import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL! ,
  },
});
