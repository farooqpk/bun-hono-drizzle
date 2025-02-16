import { relations, sql } from "drizzle-orm";
import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable(
  "user_table",
  {
    id: int("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("email_idx").on(table.email)]
);

export const projectTable = sqliteTable("project_table", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  userId: int("userId").notNull().references(() => usersTable.id),
});

export const taskTable = sqliteTable("task_table", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  projectId: int("projectId").notNull().references(() => projectTable.id),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type Project = typeof projectTable.$inferSelect;
export type InsertProject = typeof projectTable.$inferInsert;
export type Task = typeof taskTable.$inferSelect;
export type InsertTask = typeof taskTable.$inferInsert;

export const UserRelations = relations(usersTable, ({ many }) => ({
  projects: many(projectTable),
}));

export const ProjectRelations = relations(projectTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [projectTable.userId],
    references: [usersTable.id],
  }),
  tasks: many(taskTable),
}));
export const TaskRelations = relations(taskTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [taskTable.projectId],
    references: [projectTable.id],
  }),
}));
