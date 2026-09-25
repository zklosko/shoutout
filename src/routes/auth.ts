import type { FastifyInstance } from "fastify";
import fastifyPassport from '@fastify/passport'

export async function authRoutes(fastify: FastifyInstance, options: {}) {
    fastify.get<{ Querystring: { error?: string; next?: string } }>("/login", async (request, response) => {
        if (request.isAuthenticated()) {
            return response.redirect("/")
        }
        return response.view('login', { error: request.query['error'] === '1' })
    })
    fastify.post("/login", { preValidation: fastifyPassport.authenticate('local', {authInfo: false, successRedirect: '/', failureRedirect: '/login?error=1'})}, async (request, response) => {}),
    fastify.post("/logout", async (request, response) => {
        request.logOut()
        response.header('HX-Redirect', '/')
        return response.send()
    })
}