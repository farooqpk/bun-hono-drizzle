import { z } from "zod";

export const taskSchema = z.object({
  name: z.string().min(3, "Task name must be at least 3 characters long"),
  projectId: z.coerce.number().int().positive(),
});

export const taskIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
