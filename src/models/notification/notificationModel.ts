// File: /models/notification/notificationModel.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  reminderId: Types.ObjectId; // Reference to the reminder
  userId: string; // The ID of the user to be notified
  status: 'pending' | 'sent' | 'failed'; // Status of the notification
  notificationType: 'reminder' | 'recurring-reminder'; // Type of notification
  attempts: number; // Number of attempts to send the notification
  error?: string; // Error message if the notification failed
  sentAt?: Date; // Time when the notification was sent
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  reminderId: {
    type: Schema.Types.ObjectId,
    ref: 'Reminder',
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  },
  notificationType: {
    type: String,
    enum: ['reminder', 'recurring-reminder'],
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  error: {
    type: String,
    default: null,
  },
  sentAt: {
    type: Date,
    default: null,
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

// Middleware to update `updatedAt` on save
notificationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
