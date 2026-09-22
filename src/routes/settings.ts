import type { FastifyInstance } from "fastify";

export async function settingsRoutes(fastify: FastifyInstance, options: {}) {
    fastify.get("/", async (request, response) => {
        return response.viewAsync('settings.hbs', {})
    })
}