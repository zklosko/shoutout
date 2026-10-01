import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { settingsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";

type DB = typeof db

type SettionsOptions = {
  db: typeof db
}

declare module "fastify" {
  interface FastifyInstance {
    settings: SettingsService;
  }
}

/** Holds persistent settings server-side, reducing db calls */
class SettingsService {
  #settings!: typeof settingsTable.$inferSelect;

  constructor(private db: DB) {}

  async load() {
    const settings = await this.db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.id, "settings"))
      .get()

    if (!settings) throw Error("Settings row not found")

    this.#settings = settings
  }

  updateSettings(values: Partial<typeof settingsTable.$inferSelect>) {
    this.#settings = {
      ...this.#settings,
      ...values
    }
  }

  get skipApproval() {
    return this.#settings.skipApproval
  }
}

const settingsPlugin: FastifyPluginAsync<SettionsOptions> = async (
  fastify,
  opts,
) => {
  const driver = new SettingsService(db);

  fastify.decorate("settings", driver);
};

export default fp(settingsPlugin);
