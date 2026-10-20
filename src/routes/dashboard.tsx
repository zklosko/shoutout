import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { childCodesTable, settingsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { LogsPage } from "../views/Logs.js";
import { DashboardPage } from "../views/Dashboard.js";

export async function dashboardRoutes(fastify: FastifyInstance, options: {}) {
  fastify.get("/", async (request, response) => {
    const childCodes = await db
      .select()
      .from(childCodesTable)
      .where(eq(childCodesTable.status, "submitted"))
      .all();
    const infoText = await db
      .select({ text: settingsTable.infoText })
      .from(settingsTable)
      .get();
    return response.view(
      <DashboardPage
        childCodes={childCodes}
        infoText={infoText?.text}
        auth={request.isAuthenticated()}
      />,
    );
  });
  fastify.get("/logs", async (request, response) => {
    const childCodes = await db.select().from(childCodesTable).all();
    return response.view(
      <LogsPage logs={childCodes} auth={request.isAuthenticated()} />,
    );
  });
}
