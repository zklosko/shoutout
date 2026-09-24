import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { companionButtonsTable, connectionsTable, settingsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function settingsRoutes(fastify: FastifyInstance, options: {}) {
    fastify.get("/", async (request, response) => {
        const settings = await db.select().from(settingsTable).where(eq(settingsTable.id, "settings")).get()
        const connections = await db.select().from(connectionsTable).where(eq(connectionsTable.type, "companion")).get()
        const buttons = await db.select().from(companionButtonsTable).all()

        if (!settings || !connections || !buttons) throw Error("Could not load settings, connections, or buttons from database.")

        return response.viewAsync('settings.hbs', { 
            settings: settings,
            connections: connections,
            buttons: buttons 
        })
    }),
    fastify.post("/", async (request, response) => {
        const newConfig = {}
        response.send({
            ok: true,
            config: newConfig
        })
        return response.viewAsync('settings.hbs', {})
    })
}