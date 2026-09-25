import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { childCodesTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

type NewChildCode = {
    childCode: string
    note?: string
}

export async function requestRoutes(fastify: FastifyInstance, options: {}) {
    fastify.post<{ Body: Partial<NewChildCode> }>("/new", async (request, response) => {
        const { childCode, note } = request.body

        if (!childCode) return response.status(422).send({ error: "Child code is required" })

        await db.insert(childCodesTable)
            .values({ childCode: childCode, note: note})
            .onConflictDoUpdate({ target: childCodesTable.childCode, set: {status: 'submitted'}})
        
        return response.status(201).send({ success: true })
    }),
    fastify.post<{ Params: { childCode: string } }>("/approve/:childCode", async (request, response) => {
        const { childCode } = request.params
        if (!childCode) return response.status(400).send({ error: "Child code is required" })

        const query = await db.update(childCodesTable)
            .set({ status: 'approved' })
            .where(eq(childCodesTable.childCode, childCode))
            .returning()
            .get()
        
        if (!query) {
            return response.status(404).send(`<td id="status-${childCode}">Error</td>`)
        }

        fastify.companion.send(query.childCode, query.note)

        return response.status(201).send(`<td id="status-${childCode}">approved</td>`)
    }),
    fastify.post<{ Params: { childCode: string } }>("/reject/:childCode", async (request, response) => {
        const { childCode } = request.params
        if (!childCode) return response.status(400).send({ error: "Child code is required" })

        const query = await db.update(childCodesTable)
            .set({ status: 'rejected' })
            .where(eq(childCodesTable.childCode, childCode))
            .returning()
            .get()
        
        if (!query) {
            return response.status(404).send(`<td id="status-${childCode}">Error</td>`)
        }

        return response.status(201).send(`<td id="status-${childCode}">rejected</td>`)
    })
}