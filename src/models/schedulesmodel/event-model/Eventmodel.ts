import mongoose, { Document, Schema } from "mongoose";
import validator from 'validator';

export const eventTypes = ["conference", "workshop", "meetup", "party"] as const;
export const eventStatuses = ["pending", "confirmed", "cancelled"] as const;

export type EventType = typeof eventTypes[number];
export type EventStatus = typeof eventStatuses[number];

export interface IEvent extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  startTime: Date;
  endTime: Date;
  location: string;
  description?: string;
  type: EventType;
  reminder?: boolean;
  organizer: string;
  capacity?: number;
  registeredAttendees?: number;
  eventLinks?: string[];
  mapLink?: string;
  status?: EventStatus;
}

const EventSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: eventTypes,
      required: true,
    },
    reminder: { type: Boolean, default: false },
    organizer: { type: String, trim: true },
    capacity: { type: Number, default: null, min: 0 },
    registeredAttendees: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value: number): boolean {
          const doc = this as IEvent;
          return (doc.capacity == null) || value <= doc.capacity;
        },
        message: "Registered attendees cannot exceed the event capacity",
      },
    },
    eventLinks: [{ type: String, validate: { validator: validator.isURL, message: 'Invalid URL format for eventLinks' } }],
    mapLink: { type: String, validate: { validator: validator.isURL, message: 'Invalid URL format for mapLink' } },
    status: {
      type: String,
      enum: eventStatuses,
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.pre<IEvent>("save", function (next) {
  if (this.capacity != null && (this.registeredAttendees ?? 0) > this.capacity) {
    return next(new Error("Registered attendees exceed the event capacity"));
  }

  if (this.startTime >= this.endTime) {
    return next(new Error("Event start time must be before the end time"));
  }
  
  next();
});

const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
export default Event;