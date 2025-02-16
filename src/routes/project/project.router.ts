import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { projectIdSchema, projectSchema } from "./project.schema";
import { jwtMiddleware } from "../../utils/jwt-middleware";
import { db } from "../../db";
import { projectTable } from "../../db/schema";
import { and, desc, eq } from "drizzle-orm";

const app = new Hono();

app.use("/*", jwtMiddleware);

app.post("/", zValidator("json", projectSchema), async (c) => {
  const { name } = c.req.valid("json");
  const user = c.get("jwtPayload");
  try {
    await db.insert(projectTable).values({
      name,
      userId: user.id,
    });

    return c.json({ message: "Project created successfully" });
  } catch (error) {
    return c.json({ message: "Something went wrong" }, 500);
  }
});

app.get("/", async (c) => {
  const user = c.get("jwtPayload");
  try {
    const projects = await db
      .select({ id: projectTable.id, name: projectTable.name })
      .from(projectTable)
      .where(eq(projectTable.userId, user?.id))
      .orderBy(desc(projectTable.createdAt));
    return c.json(projects);
  } catch (error) {
    return c.json({ message: "Something went wrong" }, 500);
  }
});

app.get("/:id", zValidator("param", projectIdSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("jwtPayload");
  try {
    // const project = await db
    //   .select({ id: projectTable.id, name: projectTable.name })
    //   .from(projectTable)
    //   .where(and(eq(projectTable.id, id), eq(projectTable.userId, user?.id)))
    //   .limit(1);

    const project = await db.query.projectTable.findFirst({
      where: (p, { eq, and }) => and(eq(p.id, id), eq(p.userId, user?.id)),
      with: {
        tasks: true,
      },
      columns: {
        id: true,
        name: true,
      },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });

    if (!project) {
      return c.json({ message: "Project not found" }, 404);
    }

    return c.json(project);
  } catch (error) {
    return c.json({ message: "Something went wrong" }, 500);
  }
});

app.patch(
  "/:id",
  zValidator("param", projectIdSchema),
  zValidator("json", projectSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { name } = c.req.valid("json");
    const user = c.get("jwtPayload");
    try {
      const updatedProject = await db
        .update(projectTable)
        .set({ name })
        .where(and(eq(projectTable.id, id), eq(projectTable.userId, user?.id)))
        .returning({ id: projectTable.id, name: projectTable.name });

      if (updatedProject.length === 0) {
        return c.json({ message: "Project not found" }, 404);
      }

      return c.json(updatedProject[0]);
    } catch (error) {
      return c.json({ message: "Something went wrong" }, 500);
    }
  }
);

app.delete("/:id", zValidator("param", projectIdSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("jwtPayload");
  try {
    const deletedProject = await db
      .delete(projectTable)
      .where(and(eq(projectTable.id, id), eq(projectTable.userId, user?.id)))
      .returning({ id: projectTable.id, name: projectTable.name });

    if (deletedProject.length === 0) {
      return c.json({ message: "Project not found" }, 404);
    }

    return c.json({ message: "Project deleted successfully" });
  } catch (error) {
    return c.json({ message: "Something went wrong" }, 500);
  }
});

export default app;
