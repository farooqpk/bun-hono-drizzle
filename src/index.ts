import { Hono } from "hono";
import { logger } from "hono/logger";
import authRouter from "./routes/auth/auth.router";
import projectRouter from "./routes/project/project.router";
import taskRouter from "./routes/task/task.router";
import "dotenv/config";

const app = new Hono();

app.use(logger());

app.route("/auth", authRouter);
app.route("/project", projectRouter);
app.route("/task", taskRouter);

export default app;
