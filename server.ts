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
import fastifyPassport from "@fastify/passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { authRoutes } from "./src/routes/auth.js";
import { db } from "./src/db/index.js";
import { settingsTable } from "./src/db/schema.js";
import { eq } from "drizzle-orm";

const server = fastify();
const __dirname = import.meta.dirname;
const scrypt = promisify(scryptCallback);

const { port, companion, sessionKey } = await bootstrap();

await server.register(fastifySecureSession, {
  key: Buffer.from(sessionKey, "hex"),
  cookie: { path: "/ " },
});

await server.register(fastifyPassport.initialize());
await server.register(fastifyPassport.secureSession());

fastifyPassport.use(
  "local",
  new LocalStrategy(async (username, password, done) => {
    try {
      const settings = await db
        .select({
          username: settingsTable.approverUsername,
          password: settingsTable.approverPassword,
        })
        .from(settingsTable)
        .where(eq(settingsTable.id, "settings"))
        .get();

      if (!settings)
        throw new Error("Could not open settings table in database");

      if (username !== settings.username) {
        return done(null, false, { message: "Invalid credentials" });
      }

      const [salt, hashHex] = settings.password.split(":");
      if (!salt || !hashHex) {
        throw new Error(
          'AUTH_PASS_HASH is malformed — expected "salt:hash" format',
        );
      }

      const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
      const storedBuffer = Buffer.from(hashHex, "hex");
      const valid =
        derivedKey.length === storedBuffer.length &&
        timingSafeEqual(derivedKey, storedBuffer);

      if (!valid) {
        return done(null, false, { message: "Invalid credentials" });
      }

      return done(null, { username }); // this becomes req.user
    } catch (err) {
      return done(err);
    }
  }),
);

fastifyPassport.registerUserSerializer(
  async (user: { username: string }) => user.username,
);
fastifyPassport.registerUserDeserializer(async (username: string) => ({
  username,
}));

await server.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
  constraints: {},
});

await server.register(fastifyView, {
  engine: {
    handlebars: Handlebars,
  },
  root: path.join(__dirname, "src/views"),
  layout: "/layouts/base.hbs",
});

await loadPartials(path.join(__dirname, "src/views/partials"));

server.register(fastifyFormbody);

server.register(dashboardRoutes, { prefix: "/" });
server.register(authRoutes);
server.register(settingsRoutes, { prefix: "/settings" });
server.register(requestRoutes, { prefix: "/request" });

server.get("/api/health", (request, response) => {
  response.send({
    ok: true,
    uptimeSeconds: process.uptime(),
  });
});

await server.register(companionPlugin, {
  host: companion.host,
  port: companion.port,
  buttons: companion.buttons,
});

server.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
