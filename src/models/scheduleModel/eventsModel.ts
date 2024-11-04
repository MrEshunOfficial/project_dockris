import mongoose, { Document, Schema } from "mongoose";
import validator from 'validator';

export const eventTypes = ["conference", "workshop", "meetup", "party", "webinar", "training"] as const;
export const eventStatuses = ["draft", "pending", "confirmed", "cancelled", "completed"] as const;

export type EventType = typeof eventTypes[number];
export type EventStatus = typeof eventStatuses[number];

// Base interface without _id and Document properties
export interface IEventBase {
  userId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  description?: string;
  type: EventType;
  organizer: string;
  capacity?: number;
  registeredAttendees?: number;
  eventLinks?: string[];
  mapLink?: string;
  status: EventStatus;
  tags?: string[];
  isPublic: boolean;
  price?: number;
  currency?: string;
  categories?: string[];
  virtualMeetingUrl?: string;
}

// Interface that extends both IEventBase and Document
export interface IEvent extends IEventBase, Document {
  createdAt: Date;
  updatedAt: Date;
}


const EventSchema = new Schema<IEvent>(
  {
    userId: { 
      type: String, 
      required: true,
      index: true 
    },
    title: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: [3, 'Event name must be at least 3 characters long'],
      maxlength: [100, 'Event name cannot exceed 100 characters'] 
    },
    startTime: { 
      type: Date, 
      required: true, 
      index: true,
      validate: {
        validator: function(this: any, value: Date) {
          // Only validate future dates for new events
          if (this.isNew) {
            return value > new Date();
          }
          return true;
        },
        message: 'Start time must be in the future for new events'
      }
    },
    endTime: { 
      type: Date,
      required: true,
      validate: {
        validator: function(this: any, value: Date) {
          // For new documents
          if (this.isNew) {
            return this.startTime && value > this.startTime;
          }
          
          // For updates
          if (this._update?.$set) {
            const newStartTime = this._update.$set.startTime 
              ? new Date(this._update.$set.startTime)
              : this.startTime;
            return value > newStartTime;
          }
          
          // For direct modifications
          return this.startTime && value > this.startTime;
        },
        message: 'End time must be after start time'
      }
    },
    location: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    description: { 
      type: String, 
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    type: {
      type: String,
      enum: eventTypes,
      required: true,
    },
    organizer: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: [100, 'Organizer name cannot exceed 100 characters']
    },
    capacity: { 
      type: Number, 
      min: [0, 'Capacity cannot be negative'],
      max: [1000000, 'Capacity cannot exceed 1,000,000']
    },
    registeredAttendees: {
      type: Number,
      default: 0,
      min: [0, 'Registered attendees cannot be negative'],
      validate: {
        validator: function(this: IEvent, value: number): boolean {
          return this.capacity == null || value <= this.capacity;
        },
        message: 'Registered attendees cannot exceed the event capacity',
      },
    },
    eventLinks: [{ 
      type: String, 
      validate: { 
        validator: validator.isURL, 
        message: 'Invalid URL format for eventLinks' 
      } 
    }],
    mapLink: { 
      type: String, 
      validate: { 
        validator: validator.isURL, 
        message: 'Invalid URL format for mapLink' 
      } 
    },
    status: {
      type: String,
      enum: eventStatuses,
      default: "draft",
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    isPublic: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function(value: number) {
          return value === undefined || value === null || value >= 0;
        },
        message: 'Price must be a positive number'
      }
    },
    currency: {
      type: String,
      uppercase: true,
      trim: true,
      maxlength: 3,
      validate: {
        validator: function(value: string) {
          return value === undefined || /^[A-Z]{3}$/.test(value);
        },
        message: 'Currency must be a valid 3-letter code'
      }
    },
    categories: [{
      type: String,
      trim: true,
      maxlength: [30, 'Category cannot exceed 30 characters']
    }],
    virtualMeetingUrl: {
      type: String,
      validate: {
        validator: function(value: string) {
          return value === undefined || validator.isURL(value);
        },
        message: 'Invalid virtual meeting URL'
      }
    }
  },
  {
    timestamps: true,
  }
);

EventSchema.index({ userId: 1, startTime: 1 });
EventSchema.index({ status: 1, startTime: 1 });
EventSchema.index({ isPublic: 1, status: 1, startTime: 1 });

// Modified pre-save middleware
EventSchema.pre<IEvent>("save", async function(next) {
  // Capacity validation
  if (this.capacity != null && (this.registeredAttendees ?? 0) > this.capacity) {
    return next(new Error("Registered attendees cannot exceed the event capacity"));
  }

  // Time validation
  if (this.isNew || this.isModified('startTime') || this.isModified('endTime')) {
    const startTime = this.startTime;
    const endTime = this.endTime;
    
    if (!startTime || !endTime) {
      return next(new Error("Both start time and end time are required"));
    }
    
    if (startTime >= endTime) {
      return next(new Error("Event start time must be before the end time"));
    }
    
    if (this.isNew && startTime <= new Date()) {
      return next(new Error("Event start time must be in the future for new events"));
    }
  }

  // Price and currency validation
  if (this.isModified('price') || this.isModified('currency')) {
    const hasPrice = this.price != null;
    const hasCurrency = this.currency != null;
    if (hasPrice !== hasCurrency) {
      return next(new Error("Both price and currency must be provided together"));
    }
  }

  next();
});

// Modified findOneAndUpdate middleware
EventSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  if (!update?.$set) return next();

  const { startTime, endTime, price, currency } = update.$set;

  try {
    const doc = await this.model.findOne(this.getQuery());
    if (!doc) return next(new Error("Event not found"));

    // Time validation
    const newStartTime = startTime ? new Date(startTime) : doc.startTime;
    const newEndTime = endTime ? new Date(endTime) : doc.endTime;

    if (newStartTime && newEndTime && newStartTime >= newEndTime) {
      return next(new Error("Start time must be before end time"));
    }

    // Price and currency validation
    const hasPrice = price !== undefined ? price : doc.price;
    const hasCurrency = currency !== undefined ? currency : doc.currency;

    if ((hasPrice != null) !== (hasCurrency != null)) {
      return next(new Error("Both price and currency must be provided together"));
    }

    next();
  } catch (error: any) {
    next(error);
  }
});


const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
export default Event;
