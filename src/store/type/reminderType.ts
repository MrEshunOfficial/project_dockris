import { z } from "zod";

// First, let's define the proper enums that will be shared
export enum ReminderType {
  NOTIFICATION = "NOTIFICATION",
  EMAIL = "EMAIL",
  SMS = "SMS"
}

export enum PrivacyType {
  PRIVATE = "PRIVATE",
  SHARED = "SHARED"
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED"
}

// Update the appointment schema to use the proper enum values
const appointmentSchema = z.object({
  userId: z.string(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  dueDateTime: z.date(),
  location: z
    .string()
    .min(1, "Location is required")
    .max(255, "Location must be less than 255 characters"),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
  attendees: z.object({
    type: z.enum(["individual", "count"]),
    individuals: z.array(z.string().email("Invalid email address")).optional(),
    count: z
      .number()
      .min(1, "Attendee count must be a positive number")
      .optional(),
  }),
  reminder: z.object({
    type: z.nativeEnum(ReminderType),  // Use nativeEnum instead of enum
    interval: z
      .string()
      .min(1, "Reminder interval is required")
      .max(50, "Interval must be less than 50 characters"),
  }),
  privacy: z.nativeEnum(PrivacyType),  // Use nativeEnum
  recurring: z.boolean(),
  recurrencePattern: z
    .enum(["daily", "weekly", "monthly", "yearly"])
    .optional(),
  status: z.nativeEnum(AppointmentStatus),  // Use nativeEnum
  links: z.array(z.string().url("Invalid URL")).default([]),
});

// Define the base Appointment interface
export interface Appointment {
  _id: string;
  userId: string;
  title: string;
  dueDateTime: string | number | Date;
  location: string;
  notes?: string;
  attendees: {
    type: 'individual' | 'count';
    individuals?: string[];
    count?: number;
  };
  reminder: {
    type: ReminderType;
    interval: string;
  };
  privacy: PrivacyType;
  recurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: AppointmentStatus;
  links: string[];
  createdAt: string;
  updatedAt: string;
}

// Type for form data
export type AppointmentFormData = z.infer<typeof appointmentSchema>;