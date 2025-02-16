import { jwt } from "hono/jwt";

export const jwtMiddleware = jwt({ secret: process.env.JWT_SECRET! })
