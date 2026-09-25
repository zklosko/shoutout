import { db } from "../db/index.js";
import {
  companionButtonsTable,
  connectionsTable,
  settingsTable,
} from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { CompanionButton } from "./Companion.js";

const BLANK_CONNECTION = {
  page: 1,
  row: 0,
  col: 0,
  variableName: "shoutoutVariable",
};

type BootstrapConfig = {
  port: number;
  companion: {
    host: string;
    port: number;
    buttons: CompanionButton[];
  };
};

/** Check to see if needed database tables exist, and init with default values if they don't */
export async function bootstrap(): Promise<BootstrapConfig> {
  let settings = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.id, "settings"))
    .get();
  if (!settings) {
    console.log("Could not retreive settings table from db. Creating new one.");
    const inserted = await db
      .insert(settingsTable)
      .values({
        id: "settings",
        infoText: "",
        approverPassword: "changeme",
        port: 8080,
      })
      .onConflictDoNothing()
      .returning()
      .get();

    if (inserted) throw new Error("Failed to save settings to database");
    settings = inserted;
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
  };
}
