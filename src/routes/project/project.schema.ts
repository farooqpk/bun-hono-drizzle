import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters long"),
});

export const projectIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});