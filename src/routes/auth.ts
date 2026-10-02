import type { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";
import { generateSaltForPassword } from "../core/auth.js";
import { db } from "../db/index.js";
import { settingsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

type ChangePasswordParams = {
  newPassword: string
  confirmPassword: string
}

export async function authRoutes(fastify: FastifyInstance, options: {}) {
  fastify.get<{ Querystring: { error?: string; next?: string } }>(
    "/login",
    async (request, response) => {
      if (request.isAuthenticated()) {
        return response.redirect("/");
      }
      return response.view(
        "login",
        { error: request.query["error"] === "1" },
        { layout: "layouts/base.hbs" },
      );
    },
  );
  fastify.post(
    "/login",
    {
      preValidation: fastifyPassport.authenticate("local", {
        authInfo: false,
        successRedirect: "/",
        failureRedirect: "/login?error=1",
      }),
    },
    async (request, response) => {},
  );
  fastify.post("/logout", async (request, response) => {
    request.logOut();
    response.header("HX-Redirect", "/");
    return response.send();
  });
  fastify.post<{ Body: ChangePasswordParams }>("/account/change", async (request, response) => {
    const {
      newPassword,
      confirmPassword
    } = request.body

    if (newPassword !== confirmPassword) {
      return response.send({ ok: "false" })
    }

    const hashedNewPassword = await generateSaltForPassword(newPassword)

    await db.update(settingsTable).set({ approverPassword: hashedNewPassword }).where(eq(settingsTable.id, "settings"))

    return response.send({ ok: "true" })
  })
}
