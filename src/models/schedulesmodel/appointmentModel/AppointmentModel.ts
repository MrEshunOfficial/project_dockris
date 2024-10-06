//appointment model
import mongoose, { Schema, Document, Model } from 'mongoose';
import validator from 'validator';

export enum ReminderType {
  NOTIFICATION = 'notification',
  EMAIL = 'email',
  SMS = 'sms',
}

export enum AppointmentStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
}

export enum PrivacyType {
  PRIVATE = 'private',
  SHARED = 'shared',
}

interface AppointmentDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  start: Date;
  end: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

interface AppointmentMethods {
  isConfirmed(): boolean;
}

interface AppointmentModel extends Model<AppointmentDocument, {}, AppointmentMethods> {
  findByStatus(status: AppointmentStatus): Promise<AppointmentDocument[]>;
}

const appointmentSchema = new Schema<AppointmentDocument, AppointmentModel, AppointmentMethods>(
  {
    title: { 
      type: String, 
      required: [true, 'Title is required'],
      trim: true,
      validate: {
        validator: (value: string) => validator.isLength(value, { min: 1, max: 255 }),
        message: 'Title must be between 1 and 255 characters'
      }
    },
    start: {
      type: Date,
      required: [true, 'Start date is required'],
      validate: {
        validator: function(this: AppointmentDocument, value: Date) {
          return value < this.end;
        },
        message: 'Start date must be before the end date'
      }
    },
    end: { 
      type: Date, 
      required: [true, 'End date is required']
    },
    location: { 
      type: String, 
      required: [true, 'Location is required'],
      validate: {
        validator: (value: string) => validator.isLength(value, { min: 1, max: 255 }),
        message: 'Location must be between 1 and 255 characters'
      }
    },
    description: { 
      type: String,
      validate: {
        validator: (value: string) => !value || validator.isLength(value, { max: 1000 }),
        message: 'Description must not exceed 1000 characters'
      }
    },
    attendees: {
      type: {
        type: String,
        enum: ['individual', 'count'],
      },
      individuals: [{
        type: String,
        validate: {
          validator: (value: string) => validator.isEmail(value),
          message: 'Invalid email address for attendee'
        }
      }],
      count: { 
        type: Number,
        validate: {
          validator: (value: number) => value > 0,
          message: 'Attendee count must be a positive number'
        }
      },
    },
    reminder: {
      type: {
        type: String,
        enum: Object.values(ReminderType),
      },
      interval: { 
        type: String, 
        validate: {
          validator: (value: string) => validator.isLength(value, { min: 1, max: 50 }),
          message: 'Reminder interval must be between 1 and 50 characters'
        }
      },
    },
    privacy: {
      type: String,
      enum: Object.values(PrivacyType),
      default: PrivacyType.PRIVATE,
    },
    recurring: { type: Boolean, default: false },
    recurrencePattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: function(this: AppointmentDocument) {
        return this.recurring;
      },
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

appointmentSchema.methods.isConfirmed = function(this: AppointmentDocument): boolean {
  return this.status === AppointmentStatus.CONFIRMED;
};

appointmentSchema.static('findByStatus', function(status: AppointmentStatus) {
  return this.find({ status });
});

appointmentSchema.index({ userId: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = (mongoose.models.Appointment as AppointmentModel) || 
  mongoose.model<AppointmentDocument, AppointmentModel>('Appointment', appointmentSchema);

export default Appointment;