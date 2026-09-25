import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { companionButtonsTable, connectionsTable, settingsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

type SettingsParams = {
    infoText: string
    port: number
    companionHost: string
    companionPort: number
    page: number
    row: number
    col: number
    variableName: string
}

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
    fastify.post<{ Body: Partial<SettingsParams> }>("/", async (request, response) => {
        const { infoText, port, companionHost, companionPort, page, row, col, variableName } = request.body

        const settingsQuery = await db.update(settingsTable).set({ infoText: infoText, port: port}).where(eq(settingsTable.id, "settings")).returning().get()
        const connectionsQuery = await db.update(connectionsTable).set({ host: companionHost, port: companionPort}).where(eq(connectionsTable.type, "companion")).returning().get()
        const buttonsQuery = await db.update(companionButtonsTable).set({ page: page, row: row, col: col, variableName: variableName}).where(eq(companionButtonsTable.id, 1)).returning().get()
        
        response.send({
            ok: true,
        })
        return response.viewAsync('settings.hbs', {})
    })
}