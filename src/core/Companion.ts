import { eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { companionButtonsTable, connectionsTable } from "../db/schema.js"

export type CompanionButton = {
    id: number
    page: number
    row: number
    col: number
    variableName: string
}

export class CompanionDriver {
    host: string
    port: number
    #buttons: CompanionButton[]

    constructor(host: string, port: number, buttons: CompanionButton[]) {
        this.host = host
        this.port = port
        this.#buttons = buttons
    }

    healthCheck(): Boolean {
        return true // this doesn't exist, as far as I know
    }

    async updateConnectionSettings(host: string, port: number) {
        this.host = host
        this.port = port

        await db.update(connectionsTable).set({ host, port}).where(eq(connectionsTable.type, "companion"))
    }

    async updateButtonSettings(buttons: CompanionButton[]) {
        this.#buttons = buttons

        // push new values to db
    }

    send(childCode: string, note?: string) {

    }
}