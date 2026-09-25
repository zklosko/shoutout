import { cp } from "node:fs/promises"

await cp("public", "dist/public", { recursive: true })
await cp("src/views", "dist/src/views", { recursive: true })