import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const childCodesTable = sqliteTable("child_codes", {
    id: int().primaryKey({ autoIncrement: true}),
    childCode: text().notNull(),
    note: text(),
    status: text().notNull().$default(() => "submitted")
})

export const settingsTable = sqliteTable("settings", {
    id: text().notNull().$default(() => "settings"),
    infoText: text(),
    approverPassword: text().notNull(),
})