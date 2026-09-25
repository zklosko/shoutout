import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { childCodesTable } from "../db/schema.js";

export async function dashboardRoutes(fastify: FastifyInstance, options: {}) {
    fastify.get("/", async (request, response) => {
        const childCodes = await db.select().from(childCodesTable).all()
        return response.viewAsync('dashboard.hbs', { childCodes, isAuthenticated: request.isAuthenticated() })
    })
}