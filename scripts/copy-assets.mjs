import { cp } from "node:fs/promises";

await cp("public", "dist/public", { recursive: true });
await cp("drizzle", "dist/drizzle", { recursive: true });
