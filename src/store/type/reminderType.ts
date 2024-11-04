import { z } from "zod";

// Shared enums
export enum ReminderType {
  NOTIFICATION = "NOTIFICATION",
  EMAIL = "EMAIL",
  SMS = "SMS"
}

export enum PrivacyType {
  PRIVATE = "PRIVATE",
  SHARED = "SHARED"
}

export enum ReminderStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  MISSED = "MISSED"
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED"
}

export enum EntityType {
  TODO = "todo",
  ROUTINE = "routine",
  APPOINTMENT = "appointment",
  SPECIALEVENT = "specialevent"
}

export enum RecurrencePattern {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly"
}

// Shared type definitions
const attendeesSchema = z.object({
  type: z.enum(["individual", "count"]),
  individuals: z.array(z.string().email("Invalid email address")).optional(),
  count: z.number().min(1, "Attendee count must be a positive number").optional(),
});

const reminderConfigSchema = z.object({
  type: z.nativeEnum(ReminderType),
  enabled: z.boolean().default(true),
  timeBefore: z.number().min(0).default(10),
  interval: z.string().min(1, "Reminder interval is required").max(50, "Interval must be less than 50 characters"),
});

// Base schema for shared properties
const baseSchema = z.object({
  userId: z.string(),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  location: z.string().max(255, "Location must be less than 255 characters").optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  attendees: attendeesSchema.optional(),
  reminder: reminderConfigSchema,
  privacy: z.nativeEnum(PrivacyType),
  recurring: z.boolean(),
  recurrencePattern: z.nativeEnum(RecurrencePattern).optional(),
  links: z.array(z.string().url("Invalid URL")).default([]),
});

// Appointment-specific schema
export const appointmentSchema = baseSchema.extend({
  dueDateTime: z.date(),
  status: z.nativeEnum(AppointmentStatus),
  entityType: z.literal(EntityType.APPOINTMENT),
});

// Reminder-specific schema
export const reminderSchema = baseSchema.extend({
  date: z.date(),
  time: z.string(),
  status: z.nativeEnum(ReminderStatus),
  entityType: z.nativeEnum(EntityType),
  entityId: z.string().optional(),
});

// Base interface for shared properties
interface BaseItem {
  _id: string;
  userId: string;
  title: string;
  location?: string;
  notes?: string;
  attendees?: {
    type: 'individual' | 'count';
    individuals?: string[];
    count?: number;
  };
  reminder: {
    type: ReminderType;
    enabled: boolean;
    timeBefore: number;
    interval: string;
  };
  privacy: PrivacyType;
  recurring: boolean;
  recurrencePattern?: RecurrencePattern;
  links: string[];
  createdAt: string;
  updatedAt: string;
}

// Appointment interface
export interface Appointment extends BaseItem {
  dueDateTime: string | number | Date;
  status: AppointmentStatus;
  entityType: EntityType.APPOINTMENT;
}

// Reminder interface
export interface Reminder extends BaseItem {
  date: Date;
  time: string;
  description?: string;
  status: ReminderStatus;
  entityType: EntityType;
  entityId?: string;
}

// Form data types
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type ReminderFormData = z.infer<typeof reminderSchema>;

// Utility type for creating/updating items
export type CreateItemData<T> = Omit<T, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateItemData<T> = Partial<CreateItemData<T>> & { _id: string };

export type CreateAppointmentData = CreateItemData<Appointment>;
export type UpdateAppointmentData = UpdateItemData<Appointment>;
export type CreateReminderData = CreateItemData<Reminder>;
export type UpdateReminderData = UpdateItemData<Reminder>;