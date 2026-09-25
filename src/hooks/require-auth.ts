import type { FastifyRequest, FastifyReply } from "fastify";

export function requireAuth(request: FastifyRequest, response: FastifyReply, done: (err?: Error) => void) {
    if (!request.isAuthenticated()) {
        return response.redirect(`/login?next=${encodeURIComponent(request.url)}`)
    }
    done()
}