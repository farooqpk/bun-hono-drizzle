import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwtMiddleware } from "../../utils/jwt-middleware";
import { db } from "../../db";
import { taskTable } from "../../db/schema";
import { and, desc, eq } from "drizzle-orm";
import { taskIdSchema, taskSchema } from "./task.schema";

const app = new Hono();

app.use("/*", jwtMiddleware);

app.post("/", zValidator("json", taskSchema), async (c) => {
  const { name, projectId } = c.req.valid("json");
  const user = c.get("jwtPayload");
  try {
    const project = await db.query.projectTable.findFirst({
      where: (p, { eq, and }) =>
        and(eq(p.id, projectId), eq(p.userId, user.id)),
    });

    if (!project) {
      return c.json({ message: "Project not found or unauthorized" }, 404);
    }

    const newTask = await db
      .insert(taskTable)
      .values({
        name,
        projectId,
      })
      .returning();

    return c.json({ message: "Task created successfully", task: newTask[0] });
  } catch (error) {
    return c.json({ message: "Something went wrong" }, 500);
  }
});

app.get("/", async (c) => {
  const user = c.get("jwtPayload");
  try {
    const projectsWithTasks = await db.query.projectTable.findMany({
      where: (p, { eq }) => eq(p.userId, user.id),
      with: {
        tasks: {
          orderBy: (t, { desc }) => desc(t.createdAt),
        },
      },
      columns: { id: true },
    });

    const tasks = projectsWithTasks.flatMap((project) =>
      project.tasks.map((task) => ({
        ...task,
      }))
    );

    return c.json(tasks);
  } catch (error) {
    return c.json({ message: "Something went wrong" }, 500);
  }
});

app.get("/:id", zValidator("param", taskIdSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("jwtPayload");

  try {
    const project_with_task = await db.query.projectTable.findFirst({
      where: (p, { eq }) => eq(p.userId, user.id),
      with: {
        tasks: {
          where: (t, { eq }) => eq(t.id, id),
        },
      },
    });

    if (!project_with_task || project_with_task.tasks.length === 0) {
      return c.json({ message: "Task not found or unauthorized" }, 404);
    }

    return c.json(project_with_task.tasks[0]);
  } catch (error) {
    return c.json({ message: "Something went wrong" }, 500);
  }
});

app.patch(
  "/:id",
  zValidator("param", taskIdSchema),
  zValidator("json", taskSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { name, projectId } = c.req.valid("json");
    const user = c.get("jwtPayload");

    try {
      const project_with_task = await db.query.projectTable.findFirst({
        where: (p, { eq }) => eq(p.userId, user.id),
        with: {
          tasks: {
            where: (t, { eq }) => eq(t.id, id),
          },
        },
      });

      if (!project_with_task || project_with_task.tasks.length === 0) {
        return c.json({ message: "Task not found or unauthorized" }, 404);
      }

      const updatedTask = await db
        .update(taskTable)
        .set({ name, projectId })
        .where(eq(taskTable.id, id))
        .returning();

      return c.json({
        message: "Task updated successfully",
        task: updatedTask[0],
      });
    } catch (error) {
      return c.json({ message: "Something went wrong" }, 500);
    }
  }
);

app.delete("/:id", zValidator("param", taskIdSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("jwtPayload");

  try {
    const project_with_task = await db.query.projectTable.findFirst({
      where: (p, { eq }) => eq(p.userId, user.id),
      with: {
        tasks: {
          where: (t, { eq }) => eq(t.id, id),
        },
      },
    });

    if (!project_with_task || project_with_task.tasks.length === 0) {
      return c.json({ message: "Task not found or unauthorized" }, 404);
    }

    await db.delete(taskTable).where(eq(taskTable.id, id));

    return c.json({ message: "Task deleted successfully" });
  } catch (error) {
    return c.json({ message: "Something went wrong" }, 500);
  }
});

export default app;
