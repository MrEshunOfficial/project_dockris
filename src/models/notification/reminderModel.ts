import mongoose, { Schema, Document, Types } from 'mongoose';
import { z } from 'zod';

// Enums
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

// Interface for the Mongoose document
export interface IReminder extends Document {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  location?: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  repeatUntil?: Date;
  notification: {
    enabled: boolean;
    type: ReminderType;
    timeBefore: number; // in minutes
  };
  status: ReminderStatus;
  privacy: PrivacyType;
  attendees?: {
    type: 'individual' | 'count';
    individuals?: string[];
    count?: number;
  };
  links?: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  entityType: EntityType;
  entityId?: Types.ObjectId;
}

// Zod schema for validation
export const reminderSchema = z.object({
  userId: z.string(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  date: z.date(),
  time: z.string(),
  location: z
    .string()
    .max(255, "Location must be less than 255 characters")
    .optional(),
  isRecurring: z.boolean(),
  recurrencePattern: z.nativeEnum(RecurrencePattern).optional(),
  repeatUntil: z.date().optional(),
  notification: z.object({
    enabled: z.boolean(),
    type: z.nativeEnum(ReminderType),
    timeBefore: z.number().min(0),
  }),
  status: z.nativeEnum(ReminderStatus),
  privacy: z.nativeEnum(PrivacyType),
  attendees: z.object({
    type: z.enum(["individual", "count"]),
    individuals: z.array(z.string().email("Invalid email address")).optional(),
    count: z.number().min(1, "Attendee count must be a positive number").optional(),
  }).optional(),
  links: z.array(z.string().url("Invalid URL")).default([]),
  entityType: z.nativeEnum(EntityType),
  entityId: z.string().optional(),
});

// Mongoose schema
const mongooseReminderSchema = new Schema<IReminder>({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    trim: true,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrencePattern: {
    type: String,
    enum: Object.values(RecurrencePattern),
    default: null,
  },
  repeatUntil: {
    type: Date,
    default: null,
  },
  notification: {
    enabled: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: Object.values(ReminderType),
      default: ReminderType.NOTIFICATION,
    },
    timeBefore: {
      type: Number,
      default: 10,
    },
  },
  status: {
    type: String,
    enum: Object.values(ReminderStatus),
    default: ReminderStatus.PENDING,
  },
  privacy: {
    type: String,
    enum: Object.values(PrivacyType),
    default: PrivacyType.PRIVATE,
  },
  attendees: {
    type: {
      type: String,
      enum: ['individual', 'count'],
    },
    individuals: [String],
    count: Number,
  },
  links: {
    type: [String],
    default: [],
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  entityType: {
    type: String,
    enum: Object.values(EntityType),
    required: true,
  },
  entityId: {
    type: Schema.Types.ObjectId,
    ref: 'Entity',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

mongooseReminderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Type for form data
export type ReminderFormData = z.infer<typeof reminderSchema>;

// Export the model
export default mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', mongooseReminderSchema);