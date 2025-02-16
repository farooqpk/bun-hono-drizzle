import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "./auth.schema";
import { db } from "../../db";
import { usersTable } from "../../db/schema";
import * as jwt from "hono/jwt";

const app = new Hono();

app.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  try {
    const isAlreadyExist = await db.query.usersTable.findFirst({
      where: (u, { eq }) => eq(u.email, email),
      columns: {
        id: true,
      },
    });

    if (isAlreadyExist) {
      return c.json({ message: "Email already exist" }, 400);
    }

    const encryptedPassword = await Bun.password.hash(password);

    const user: { id: number }[] = await db
      .insert(usersTable)
      .values({
        email,
        password: encryptedPassword,
      })
      .returning({
        id: usersTable.id,
      });

    const token = await jwt.sign(
      { id: user[0].id, email },
      process.env.JWT_SECRET as string
    );
    return c.json({
      message: "User created successfully",
      token,
    });
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
});

app.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  try {
    const user = await db.query.usersTable.findFirst({
      where: (u, { eq }) => eq(u.email, email),
      columns: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return c.json({ message: "Invalid credentials" }, 401);
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
      return c.json({ message: "Invalid credentials" }, 401);
    }

    const token = await jwt.sign(
      { id: user.id, email },
      process.env.JWT_SECRET as string
    );

    return c.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
});

export default app;
