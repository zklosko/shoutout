import type { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";
import { generateSaltForPassword } from "../core/auth.js";
import { db } from "../db/index.js";
import { settingsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { LoginPage } from "../views/Login.js";

type ChangePasswordParams = {
  newPassword: string;
  confirmPassword: string;
};

export async function authRoutes(fastify: FastifyInstance, options: {}) {
  fastify.get<{ Querystring: { error?: string; next?: string } }>(
    "/login",
    async (request, response) => {
      if (request.isAuthenticated()) {
        return response.redirect("/");
      }
      const loginError = request.query["error"]  === "1"
      return response.view(<LoginPage error={loginError} />)
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
  fastify.post<{ Body: ChangePasswordParams }>(
    "/account/change",
    async (request, response) => {
      const { newPassword, confirmPassword } = request.body;

      if (newPassword !== confirmPassword) {
        return response.send({ ok: "false" });
      }

      const hashedNewPassword = await generateSaltForPassword(newPassword);

      await db
        .update(settingsTable)
        .set({ approverPassword: hashedNewPassword })
        .where(eq(settingsTable.id, "settings"));

      return response.header(
          "HX-Trigger",
          JSON.stringify({
            toast: {
              message: `Changed password successfully`,
              type: "info",
            },
          }),
        ).send("")
    },
  );
}
