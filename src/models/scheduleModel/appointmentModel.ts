//appointment model
import { AppointmentStatus, PrivacyType, ReminderType } from '@/store/type/reminderType';
import mongoose, { Schema, Document, Model } from 'mongoose';
import validator from 'validator';
export interface IAppointment extends Document {
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

interface AppointmentMethods {
  isConfirmed(): boolean;
}

interface AppointmentModel extends Model<IAppointment, {}, AppointmentMethods> {
  findByStatus(status: AppointmentStatus): Promise<IAppointment[]>;
}

const appointmentSchema = new Schema<IAppointment, AppointmentModel, AppointmentMethods>(
  {
    userId: { type: String, required: true }, 
    title: { 
      type: String, 
      required: [true, 'Title is required'],
      trim: true,
      validate: {
        validator: (value: string) => validator.isLength(value, { min: 1, max: 255 }),
        message: 'Title must be between 1 and 255 characters'
      }
    },
    dueDateTime: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: (value: Date) => value.getTime() > Date.now(),
        message: 'Due date must be in the future'
      }
    },
    location: { 
      type: String, 
      required: [true, 'Location is required'],
      validate: {
        validator: (value: string) => validator.isLength(value, { min: 1, max: 255 }),
        message: 'Location must be between 1 and 255 characters'
      }
    },
    notes: { 
      type: String,




      validate: {
        validator: (value: string) => !value || validator.isLength(value, { max: 1000 }),
        message: 'notes must not exceed 1000 characters'
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
            validator: (value: string) => !value || validator.isLength(value, { min: 1, max: 50 }),
            message: 'Reminder interval must be between 1 and 50 characters'
        }
    }
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
      required: function(this: IAppointment) {
        return this.recurring;
      },
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
    },
    links: [String]
  },
  { timestamps: true }
);

appointmentSchema.methods.isConfirmed = function(this: IAppointment): boolean {
  return this.status === AppointmentStatus.CONFIRMED;
};

appointmentSchema.static('findByStatus', function(status: AppointmentStatus) {
  return this.find({ status });
});

appointmentSchema.index({ userId: 1 });
appointmentSchema.index({ status: 1 });

const myAppModel = (mongoose.models.Appointment as unknown as AppointmentModel) || 
  mongoose.model<IAppointment, AppointmentModel>('Appointment', appointmentSchema);

export default myAppModel;
