import { db } from "../db/index.js";
import {
  companionButtonsTable,
  connectionsTable,
  sessionsTable,
  settingsTable,
} from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { CompanionButton } from "./Companion.js";
import { migrate } from "drizzle-orm/libsql/migrator";
import { generateSaltForPassword } from "./auth.js";
import { randomBytes } from "node:crypto";

const BLANK_CONNECTION = {
  page: 1,
  row: 0,
  col: 0,
  variableName: "shoutoutVariable",
};
const USERNAME = "admin";
const RAW_PASSWORD = "changeme";

type BootstrapConfig = {
  port: number;
  companion: {
    host: string;
    port: number;
    buttons: CompanionButton[];
  };
  sessionKey: string;
};

/** Check to see if needed database tables exist, and init with default values if they don't */
export async function bootstrap(): Promise<BootstrapConfig> {
  await migrate(db, { migrationsFolder: "./drizzle" });

  let sessions = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, "sessions"))
    .get();
  if (!sessions) {
    console.log("No session key found. Creating new one...");
    const inserted = await db
      .insert(sessionsTable)
      .values({
        id: "sessions",
        key: randomBytes(32).toString("hex"),
      })
      .onConflictDoNothing()
      .returning()
      .get();

    if (!inserted) throw new Error("Failed to save settings to database");
    sessions = inserted;
  }

  let settings = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.id, "settings"))
    .get();
  if (!settings) {
    console.log(
      "Could not retreive settings table from db. Creating new one...",
    );
    const inserted = await db
      .insert(settingsTable)
      .values({
        id: "settings",
        infoText: "",
        approverUsername: USERNAME,
        approverPassword: await generateSaltForPassword(RAW_PASSWORD),
        port: 8080,
        skipApproval: false,
      })
      .onConflictDoNothing()
      .returning()
      .get();

    if (!inserted) throw new Error("Failed to save settings to database");
    settings = inserted;

    console.log(
      "\n" +
        "Created a new admin user account.\n" +
        "The username is admin and the password is changeme.\n" +
        "The password can be changed on the settings page of the web ui.\n",
    );
  }

  let connections = await db.select().from(connectionsTable).get();
  if (!connections) {
    console.log("Creating connections table...");
    const inserted = await db
      .insert(connectionsTable)
      .values({
        type: "companion",
        host: "127.0.0.1",
        port: 8000,
      })
      .onConflictDoNothing()
      .returning()
      .get();

    connections = inserted;
  }

  let buttons = await db.select().from(companionButtonsTable).all();
  if (buttons.length === 0) {
    console.log("Creating buttons table...");
    const inserted = await db
      .insert(companionButtonsTable)
      .values({
        page: BLANK_CONNECTION.page,
        row: BLANK_CONNECTION.row,
        col: BLANK_CONNECTION.col,
        variableName: BLANK_CONNECTION.variableName,
      })
      .onConflictDoNothing()
      .returning()
      .all();

    buttons = inserted;
  }

  return {
    port: settings.port,
    companion: {
      host: connections.host,
      port: connections.port,
      buttons: buttons,
    },
    sessionKey: sessions.key,
  };
}
