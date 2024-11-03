// File: /models/reminder/reminderModel.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReminder extends Document {
  userId: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatUntil?: Date;
  notification: {
    enabled: boolean;
    timeBefore: number; // in minutes
  };
  status: 'pending' | 'completed' | 'missed';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  entityType: 'todo' | 'routine' | 'appointment';
  entityId?: Types.ObjectId;
}

const reminderSchema = new Schema<IReminder>({
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
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
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
    timeBefore: {
      type: Number,
      default: 10,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'missed'],
    default: 'pending',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  entityType: {
    type: String,
    enum: ['todo', 'routine', 'appointment'], // lowercase values matching ENTITY_TYPES
    required: true
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

reminderSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', reminderSchema);