import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "node:path";

const server = fastify();
const __dirname = import.meta.dirname;

await server.register(fastifyStatic, {
  root: path.join(__dirname, "..", "public"),
  prefix: "/",
});

server.get("/api/health", (request, response) => {
  response.send({
    ok: true,
    uptimeSeconds: process.uptime(),
  });
});

server.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});