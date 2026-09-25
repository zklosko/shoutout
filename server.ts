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

const server = fastify();
const __dirname = import.meta.dirname;

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

server.register(fastifyFormbody)

server.register(dashboardRoutes, {prefix: '/'})
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