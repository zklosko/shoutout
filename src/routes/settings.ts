import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { companionButtonsTable, connectionsTable, settingsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { requireAuth } from "../hooks/require-auth.js";

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

function definedFields<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined)
    ) as Partial<T>
}

export async function settingsRoutes(fastify: FastifyInstance, options: {}) {
    fastify.addHook('preHandler', requireAuth)
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

        try {
            await db.update(settingsTable).set({ infoText: infoText, port: port}).where(eq(settingsTable.id, "settings")).returning().get()
            await db.update(connectionsTable).set({ host: companionHost, port: companionPort}).where(eq(connectionsTable.type, "companion")).returning().get()
            
            const buttonsUpdate = definedFields({ page, row, col, variableName })

            const buttonsQuery = Object.keys(buttonsUpdate).length
                ? await db.update(companionButtonsTable).set(buttonsUpdate).where(eq(companionButtonsTable.id, 1)).returning().get()
                : await db.select().from(companionButtonsTable).where(eq(companionButtonsTable.id, 1)).get()

            if (companionHost !== undefined && companionPort !== undefined && buttonsQuery) {
                fastify.companion.updateSettings(companionHost, companionPort, [
                    {
                        page: buttonsQuery.page,
                        row: buttonsQuery.row,
                        col: buttonsQuery.col,
                        variableName: buttonsQuery.variableName
                    }
                ])
            }
        } catch (err) {
            return response.code(400).send("Could not update database")
        }

        response.send({
            ok: true,
        })
        return response.viewAsync('settings.hbs', {})
    })
}