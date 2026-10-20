import fastify, { type FastifyReply } from "fastify";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import { db } from "./src/db/index.js";
import { dashboardRoutes } from "./src/routes/dashboard.js";
import { settingsRoutes } from "./src/routes/settings.js";
import { bootstrap } from "./src/core/bootstrap.js";
import companionPlugin from "./src/core/Companion.js";
import settingsPlugin from "./src/core/Settings.js";
import { requestRoutes } from "./src/routes/request.js";
import fastifyFormbody from "@fastify/formbody";
import fastifySecureSession from "@fastify/secure-session";
import fastifyPassport from "@fastify/passport";
import { authRoutes } from "./src/routes/auth.js";
import { configurePassport } from "./src/core/auth.js";
import { render } from "preact-render-to-string";
import type { VNode } from "preact";

declare module "fastify" {
  interface FastifyReply {
    view(node: VNode): FastifyReply;
  }
}

const server = fastify();
const __dirname = import.meta.dirname;

const { port, companion, sessionKey } = await bootstrap();

await server.register(fastifySecureSession, {
  key: Buffer.from(sessionKey, "hex"),
  cookie: { path: "/ " },
});

await server.register(fastifyPassport.initialize());
await server.register(fastifyPassport.secureSession());
configurePassport();

await server.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
  constraints: {},
});

server.decorateReply("view", function (this: FastifyReply, node: VNode) {
  return this.type("text/html; charset=utf-8").send(
    "<!doctype html>" + render(node),
  );
});

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

await server.register(settingsPlugin, { db });
await server.settings.load();

server.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
