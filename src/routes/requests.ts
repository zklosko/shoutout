import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { childCodesTable } from "../db/schema.js";

type NewChildCode = {
    childCode: string
    note?: string
}

export async function requestsRoutes(fastify: FastifyInstance, options: {}) {
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

        await db.insert(childCodesTable).values({ childCode: newChild.childCode, note: newChild.note})
        
        return response.status(201).send({ success: true })
    })
}