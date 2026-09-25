import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import path from "node:path";
import Handlebars from "handlebars";
import { dashboardRoutes } from "./src/routes/dashboard.js";
import { settingsRoutes } from "./src/routes/settings.js";
import { bootstrap } from "./src/core/bootstrap.js";
import companionPlugin from "./src/core/Companion.js";
import { requestRoutes } from "./src/routes/request.js";
import fastifyFormbody from "@fastify/formbody";
import { loadPartials } from "./src/core/load-partials.js";
import fastifySecureSession from "@fastify/secure-session";
import fastifyPassport from '@fastify/passport'
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt as scryptCallback, timingSafeEqual} from "node:crypto";
import { promisify } from "node:util";
import fs from "node:fs"
import { authRoutes } from "./src/routes/auth.js";

const server = fastify();
const __dirname = import.meta.dirname;
const scrypt = promisify(scryptCallback)

await server.register(fastifySecureSession, {
  key: fs.readFileSync('session-key'), // TODO gen in bootstrap
  cookie: { path: '/ '}
})

await server.register(fastifyPassport.initialize())
await server.register(fastifyPassport.secureSession())

fastifyPassport.use(
    'local',
    new LocalStrategy(async (username, password, done) => {
        if (username !== process.env.AUTH_USER) {
            return done(null, false, { message: 'Invalid credentials' })
        }

        const [salt, hashHex] = process.env.AUTH_PASS_HASH!.split(':')
        if (!salt || !hashHex) {
          throw new Error('AUTH_PASS_HASH is malformed — expected "salt:hash" format')
        }

        const derivedKey = (await scrypt(password, salt, 64)) as Buffer
        const storedBuffer = Buffer.from(hashHex, 'hex')
        const valid = derivedKey.length === storedBuffer.length && timingSafeEqual(derivedKey, storedBuffer)

        if (!valid) {
            return done(null, false, { message: 'Invalid credentials' })
        }

        return done(null, { username }) // this becomes req.user
    })
)

fastifyPassport.registerUserSerializer(async (user: { username: string }) => user.username)
fastifyPassport.registerUserDeserializer(async (username: string) => ({ username }))

await server.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
  constraints: {},
});

await server.register(fastifyView, {
    engine: {
      handlebars: Handlebars,
    },
    root: path.join(__dirname, 'src/views'),
    layout: "/layouts/base.hbs"
})

await loadPartials(path.join(__dirname, "src/views/partials"))

server.register(fastifyFormbody)

server.register(dashboardRoutes, {prefix: '/'})
server.register(authRoutes)
server.register(settingsRoutes, {prefix: '/settings'})
server.register(requestRoutes, {prefix: '/request'})

server.get("/api/health", (request, response) => {
  response.send({
    ok: true,
    uptimeSeconds: process.uptime(),
  });
});

// Startup db checks, get data needed to launch server
const { port, companion } = await bootstrap()
await server.register(companionPlugin, {
  host: companion.host,
  port: companion.port,
  buttons: companion.buttons
})

// Launch server
server.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});