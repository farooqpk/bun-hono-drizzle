import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema.js";
import "dotenv/config";

const sqlite = new Database(process.env.DATABASE_URL);

export const db = drizzle(sqlite, { schema });
