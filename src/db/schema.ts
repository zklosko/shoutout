import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const childCodesTable = sqliteTable("child_codes", {
    childCode: text().primaryKey(),
    note: text().notNull().$default(() => ""),
    status: text().notNull().$default(() => "submitted")
})

export const settingsTable = sqliteTable("settings", {
    id: text().primaryKey().$default(() => "settings"),
    infoText: text().notNull().$default(() => ""),
    approverPassword: text().notNull(),
    port: int().notNull().$default(() => 8080)
})

export const connectionsTable = sqliteTable("connections", {
    type: text().primaryKey().$default(() => "companion"),
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