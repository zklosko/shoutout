import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'

export type CompanionButton = {
    id: number
    page: number
    row: number
    col: number
    variableName: string
}

interface CompanionDriverOptions {
    host: string
    port: number
    buttons: CompanionButton[]
}

declare module 'fastify' {
    interface FastifyInstance {
        companion: CompanionDriver
    }
}

class CompanionDriver {
    host: string
    port: number
    #buttons: CompanionButton[]

    constructor(host: string, port: number, buttons: CompanionButton[]) {
        this.host = host
        this.port = port
        this.#buttons = buttons
    }

    updateSettings(host: string, port: number, buttons: CompanionButton[]) {
        this.host = host
        this.port = port
        this.#buttons = buttons
    }

    send(childCode: string, note?: string): { success: boolean, error: string | undefined } {
        this.#buttons.forEach(async b => {

            try {
                await fetch(`http://${this.host}:${this.port}/api/custom-variable/${b.variableName}/value`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: childCode
                })
            } catch (err) {
                return { success: false, error: err}
            }

            try {
                await fetch(`http://${this.host}:${this.port}/api/location/${b.page}/${b.row}/${b.col}/press`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (err) {
                return { success: false, error: err}
            }

        })

		return { success: true, error: undefined };
    }
}

const companionPlugin: FastifyPluginAsync<CompanionDriverOptions> = async (fastify, opts) => {
    const driver = new CompanionDriver(opts.host, opts.port, opts.buttons)

    fastify.decorate('companion', driver)
}

export default fp(companionPlugin)