import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { childCodesTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { CodeRow } from "../views/components/CodeRow.js";
import type { ChildCode } from "../views/Dashboard.js";

type NewChildCode = {
  childCode: string;
  note?: string;
};

export async function requestRoutes(fastify: FastifyInstance, options: {}) {
  (fastify.post<{ Body: Partial<NewChildCode> }>(
    "/new",
    async (request, response) => {
      const { childCode, note } = request.body;

      if (!childCode)
        return response
          .status(422)
          .header(
            "HX-Trigger",
            JSON.stringify({
              toast: {
                message: "Child code is required",
                type: "warning",
              },
            }),
          )
          .send("");

      await db
        .insert(childCodesTable)
        .values({ childCode: childCode, note: note })
        .onConflictDoUpdate({
          target: childCodesTable.childCode,
          set: { status: "submitted" },
        });

      if (fastify.settings.skipApproval) {
        await db
          .update(childCodesTable)
          .set({ status: "submitted" })
          .where(eq(childCodesTable.childCode, childCode));

        fastify.companion.send(childCode, note);

        const childCodeEntry: ChildCode = {
          childCode,
          ...(note ? { note } : {}),
          status: "submitted",
        };

        return response
          .status(201)
          .header(
            "HX-Trigger",
            JSON.stringify({ approveRejectSuccess: { childCode: childCode } }),
          )
          .view(
            <CodeRow
              childCode={childCodeEntry}
              auth={request.isAuthenticated()}
              logs={false}
            />,
          );
      }

      const childCodeEntry: ChildCode = {
        childCode,
        ...(note ? { note } : {}),
        status: "submitted",
      };
      return response
        .status(201)
        .view(
          <CodeRow
            childCode={childCodeEntry}
            auth={request.isAuthenticated()}
            logs={false}
          />,
        );
    },
  ),
    fastify.post<{ Params: { childCode: string } }>(
      "/approve/:childCode",
      async (request, response) => {
        const { childCode } = request.params;
        if (!childCode)
          return response
            .status(400)
            .header(
              "HX-Trigger",
              JSON.stringify({
                toast: {
                  message: "Child code is required",
                  type: "warning",
                },
              }),
            )
            .send("");

        const query = await db
          .update(childCodesTable)
          .set({ status: "approved" })
          .where(eq(childCodesTable.childCode, childCode))
          .returning()
          .get();

        if (!query) {
          return response
            .status(404)
            .send(`<td id="status-${childCode}">Error</td>`);
        }

        fastify.companion.send(query.childCode, query.note);

        return response
          .status(201)
          .header(
            "HX-Trigger",
            JSON.stringify({ approveRejectSuccess: { childCode: childCode } }),
          )
          .send(`<td id="status-${childCode}">approved</td>`);
      },
    ),
    fastify.post<{ Params: { childCode: string } }>(
      "/reject/:childCode",
      async (request, response) => {
        const { childCode } = request.params;
        if (!childCode)
          return response
            .status(400)
            .header(
              "HX-Trigger",
              JSON.stringify({
                toast: {
                  message: "Child code is required",
                  type: "warning",
                },
              }),
            )
            .send("");

        const query = await db
          .update(childCodesTable)
          .set({ status: "rejected" })
          .where(eq(childCodesTable.childCode, childCode))
          .returning()
          .get();

        if (!query) {
          return response
            .status(404)
            .send(`<td id="status-${childCode}">Error</td>`);
        }

        return response
          .status(201)
          .header(
            "HX-Trigger",
            JSON.stringify({ approveRejectSuccess: { childCode: childCode } }),
          )
          .send(`<td id="status-${childCode}">rejected</td>`);
      },
    ));
  fastify.delete<{ Params: { childCode: string } }>(
    "/delete/:childCode",
    async (request, response) => {
      const { childCode } = request.params;
      if (!childCode)
        return response
          .status(400)
          .header(
            "HX-Trigger",
            JSON.stringify({
              toast: {
                message: "Child code is required",
                type: "warning",
              },
            }),
          )
          .send("");

      try {
        await db
          .delete(childCodesTable)
          .where(eq(childCodesTable.childCode, childCode));
      } catch (err) {
        return response
          .status(500)
          .header(
            "HX-Trigger",
            JSON.stringify({
              toast: {
                message: `Could not delete ${childCode}`,
                type: "danger",
              },
            }),
          )
          .send("");
      }

      return response
        .status(200)
        .header(
          "HX-Trigger",
          JSON.stringify({
            toast: {
              message: `Deleted ${childCode}`,
              type: "info",
            },
          }),
        )
        .send("");
    },
  );
  fastify.delete("/delete/all", async (request, response) => {
    try {
      await db.delete(childCodesTable);
    } catch (err) {
      return response
        .status(500)
        .header(
          "HX-Trigger",
          JSON.stringify({
            toast: {
              message: "Could not delete child codes",
              type: "danger",
            },
          }),
        )
        .send("");
    }

    return response
      .status(200)
      .header(
        "HX-Trigger",
        JSON.stringify({
          toast: {
            message: "All child codes deleted",
            type: "success",
          },
        }),
      )
      .send("");
  });
}
