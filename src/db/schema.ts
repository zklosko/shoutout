import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const childCodesTable = sqliteTable("child_codes", {
    id: int().primaryKey({ autoIncrement: true}),
    childCode: text().notNull(),
    note: text(),
    status: text().notNull().$default(() => "submitted")
})

export const settingsTable = sqliteTable("settings", {
    id: text().notNull().$default(() => "settings"),
    infoText: text().notNull().$default(() => ""),
    approverPassword: text().notNull(),
    port: int().notNull().$default(() => 8080)
})

export const connectionsTable = sqliteTable("connections", {
    type: text().notNull().$default(() => "companion"),
    host: text().notNull(),
    port: int().notNull().$default(() => 8000)
})

export const companionButtonsTable = sqliteTable("companion_buttons", {
    id: int().primaryKey({autoIncrement: true}),
    page: int().notNull().$default(() => 1),
    row: int().notNull().$default(() => 0),
    col: int().notNull().$default(() => 0),
    variableName: text().notNull(),
})