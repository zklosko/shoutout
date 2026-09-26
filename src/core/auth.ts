import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { db } from "../db/index.js";
import { settingsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { Strategy as LocalStrategy } from "passport-local";
import fastifyPassport from "@fastify/passport";

const scrypt = promisify(scryptCallback);

/** Generates salt hash for provided password */
export async function generateSaltForPassword(
  password: string,
): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

/** Initial setup for Passport.js */
export function configurePassport() {
  fastifyPassport.use(
    "local",
    new LocalStrategy(async (username, password, done) => {
      try {
        const settings = await db
          .select({
            username: settingsTable.approverUsername,
            password: settingsTable.approverPassword,
          })
          .from(settingsTable)
          .where(eq(settingsTable.id, "settings"))
          .get();

        if (!settings)
          throw new Error("Could not open settings table in database");

        if (username !== settings.username) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const [salt, hashHex] = settings.password.split(":");
        if (!salt || !hashHex) {
          throw new Error(
            'AUTH_PASS_HASH is malformed — expected "salt:hash" format',
          );
        }

        const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
        const storedBuffer = Buffer.from(hashHex, "hex");
        const valid =
          derivedKey.length === storedBuffer.length &&
          timingSafeEqual(derivedKey, storedBuffer);

        if (!valid) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, { username }); // this becomes req.user
      } catch (err) {
        return done(err);
      }
    }),
  );

  fastifyPassport.registerUserSerializer(
    async (user: { username: string }) => user.username,
  );

  fastifyPassport.registerUserDeserializer(async (username: string) => ({
    username,
  }));
}
