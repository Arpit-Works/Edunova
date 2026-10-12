
import { z } from "zod";

export const personSchema = z.object({
  image: z.string().max(2048).default(""),
  name: z.string().trim().min(1).max(100),
  username: z.string().trim().min(1).max(50),
  gender: z.string().max(30).default(""),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  role: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  teams: z.array(
    z.enum(["Design", "Product", "Marketing", "Technology"])
  ).default([]),
});

// Avoid .partial() on the create schema — Zod defaults would fill missing
// keys and overwrite existing MongoDB fields on PATCH.
export const updatePersonSchema = z
  .object({
    image: z.string().max(2048).optional(),
    name: z.string().trim().min(1).max(100).optional(),
    username: z.string().trim().min(1).max(50).optional(),
    gender: z.string().max(30).optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
    role: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().email().max(254).optional(),
    teams: z
      .array(z.enum(["Design", "Product", "Marketing", "Technology"]))
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export type PersonInput = z.infer<typeof personSchema>;
