import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { randomBytes } from "node:crypto";

export const childCodesTable = sqliteTable("child_codes", {
  childCode: text().primaryKey(),
  note: text()
    .notNull()
    .$default(() => ""),
  status: text()
    .notNull()
    .$default(() => "submitted"),
});

export const settingsTable = sqliteTable("settings", {
  id: text()
    .primaryKey()
    .$default(() => "settings"),
  infoText: text()
    .notNull()
    .$default(() => ""),
  approverUsername: text().notNull(),
  approverPassword: text().notNull(),
  skipApproval: int({ mode: "boolean" })
    .notNull()
    .$default(() => false),
  port: int()
    .notNull()
    .$default(() => 8080),
});

export const sessionsTable = sqliteTable("sessions", {
  id: text()
    .primaryKey()
    .$default(() => "session"),
  key: text()
    .notNull()
    .$default(() => randomBytes(32).toString("hex")),
});

export const connectionsTable = sqliteTable("connections", {
  type: text()
    .primaryKey()
    .$default(() => "companion"),
  host: text().notNull(),
  port: int()
    .notNull()
    .$default(() => 8000),
});

export const companionButtonsTable = sqliteTable("companion_buttons", {
  id: int().primaryKey({ autoIncrement: true }),
  page: int()
    .notNull()
    .$default(() => 1),
  row: int()
    .notNull()
    .$default(() => 0),
  col: int()
    .notNull()
    .$default(() => 0),
  variableName: text().notNull(),
});
