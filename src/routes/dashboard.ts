import type { FastifyInstance } from "fastify";

export async function dashboardRoutes(fastify: FastifyInstance, options: {}) {
    fastify.get("/", async (request, response) => {
        return response.viewAsync('dashboard.hbs', {})
    })
}