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
        const allowedFields = [
            "childCode",
            "note"
        ] as const satisfies readonly (keyof NewChildCode)[];

        const newChild: Partial<NewChildCode> = {}
        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(request.body, field)) {
                newChild[field] = request.body[field] as never
            }
        }

        if (!newChild.childCode) return response.status(400).send({ error: "Child code is required" })

        await db.insert(childCodesTable)
            .values({ childCode: newChild.childCode, note: newChild.note})
            .onConflictDoUpdate({ target: childCodesTable.childCode, set: {status: 'submitted'}})
        
        return response.status(201).send({ success: true })
    }),
    fastify.post("/approve/:childCode", async (request, response) => {
        const { childCode } = request.params
        if (!childCode) return response.status(400).send({ error: "Child code is required" })

        const query = await db.update(childCodesTable)
            .set({ status: 'approved' })
            .where(eq(childCodesTable.childCode, childCode))
            .returning()
            .get()

        fastify.companion.send(query.childCode, query.note)

        return response.status(201).send({ success: true })
    }),
    fastify.post("/reject/:childCode", async (request, response) => {
        const { childCode } = request.params
        if (!childCode) return response.status(400).send({ error: "Child code is required" })

        await db.update(childCodesTable)
            .set({ status: 'rejected' })
            .where(eq(childCodesTable.childCode, childCode))

        return response.status(201).send({ success: true })
    })
}