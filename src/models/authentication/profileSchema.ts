// schemas/profileSchema.ts
import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .transform((date) => date || undefined), // Transform empty string to undefined
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number format")
    .optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  socialLinks: z.object({
    twitter: z.string().url("Invalid URL").optional(),
    linkedin: z.string().url("Invalid URL").optional(),
    github: z.string().url("Invalid URL").optional(),
  }).optional(),
  preferences: z.object({
    newsletter: z.boolean().optional(),
    notifications: z.boolean().optional(),
  }).optional(),
});

export type Profile = z.infer<typeof profileSchema>;