import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { childCodesTable, settingsTable } from "../db/schema.js";

export async function dashboardRoutes(fastify: FastifyInstance, options: {}) {
  fastify.get("/", async (request, response) => {
    const childCodes = await db.select().from(childCodesTable).all();
    const infoText = await db.select({ text: settingsTable.infoText }).from(settingsTable).get()
    return response.viewAsync("dashboard.hbs", {
      childCodes,
      infoText: infoText?.text,
      isAuthenticated: request.isAuthenticated(),
    });
  });
}
