import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "./auth.schema";

const authRouter = new Hono();

authRouter.post("/register", zValidator("json", registerSchema));

export default authRouter;
