import { ReminderType, AppointmentStatus, PrivacyType } from '@/models/schedulesmodel/appointmentModel/AppointmentModel';
import mongoose from 'mongoose';

export interface AppointmentRequestBody {
  title: string;
  start: string; // Date format in ISO 8601
  end: string;
  location: string;
  description?: string;
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
  userId: mongoose.Schema.Types.ObjectId;
}

export interface AppointmentResponse {
  _id: string;
  title: string;
  start: string;
  end: string;
  location: string;
  description?: string;
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
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: string;
  updatedAt: string;
}


import { z } from 'zod';

export const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  start: z.date({ required_error: 'Start date is required' }),
  end: z.date({ required_error: 'End date is required' }),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  attendees: z.union([
    z.object({
      type: z.literal('individual'),
      individuals: z.array(z.string().min(1)).nonempty('At least one individual must be added'),
    }),
    z.object({
      type: z.literal('count'),
      count: z.number().min(1, 'At least one attendee is required'),
    }),
  ]),
  reminder: z.object({
    type: z.enum(['notification', 'email', 'sms']),
    interval: z.string().min(1, 'Reminder interval is required'),
  }),
  privacy: z.enum(['private', 'shared']).default('private'),
  recurring: z.boolean().default(false),
  recurrencePattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  status: z.enum(['Pending', 'Confirmed', 'Cancelled']).default('Pending'),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
