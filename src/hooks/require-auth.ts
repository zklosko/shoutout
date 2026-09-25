import type { FastifyRequest, FastifyReply } from "fastify";

export function requireAuth(request: FastifyRequest, response: FastifyReply, done: (err?: Error) => void) {
    if (!request.isAuthenticated()) {
        response.status(401).send({ error: 'Not signed in' })
        return
    }
    done()
}