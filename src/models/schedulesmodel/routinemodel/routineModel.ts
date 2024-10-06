import mongoose, { Schema, Document, Model } from 'mongoose';

export enum Frequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  BIWEEKLY = 'biweekly',
  CUSTOM = 'custom',
}

export enum RoutineStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

interface RoutineDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  startTime: Date;
  endTime: Date;
  frequency: Frequency;
  daysOfWeek: number[];
  monthlyDate?: number;
  description?: string;
  reminderMinutes: { type: Boolean, default: false },
  status: RoutineStatus;
  category?: string;
  tags?: string[];
  completionStatus: { date: Date; completed: boolean }[];
  createdAt: Date;
  updatedAt: Date;
  isActive(): boolean;
  markAsCompleted(date: Date): Promise<RoutineDocument>;
  pauseRoutine(): Promise<RoutineDocument>;
  resumeRoutine(): Promise<RoutineDocument>;
  getReminderTime(): Date;
}

interface RoutineModel extends Model<RoutineDocument> {
  findByStatus(status: RoutineStatus): Promise<RoutineDocument[]>;
  findByFrequency(frequency: Frequency): Promise<RoutineDocument[]>;
}

const routineSchema = new Schema<RoutineDocument, RoutineModel>(
  {
    name: { type: String, required: true, trim: true },
    startTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: RoutineDocument) {
          return this.startTime < this.endTime;
        },
        message: 'Start time must be before end time.',
      },
    },
    endTime: { type: Date, required: true },
    frequency: {
      type: String,
      required: true,
      enum: Object.values(Frequency),
    },
    daysOfWeek: {
      type: [Number],
      validate: {
        validator: function (this: RoutineDocument, days: number[]) {
          if (this.frequency === Frequency.WEEKLY && days.length === 0) {
            return false;
          }
          return days.every((day) => day >= 0 && day <= 6);
        },
        message:
          'Days of the week should be numbers between 0 (Sunday) and 6 (Saturday), and at least one day must be selected for weekly routines.',
      },
    },
    monthlyDate: {
      type: Number,
      min: 1,
      max: 31,
      validate: {
        validator: function (this: RoutineDocument, date: number) {
          return this.frequency !== Frequency.MONTHLY || (date >= 1 && date <= 31);
        },
        message: 'Monthly date should be between 1 and 31, and is required for monthly routines.',
      },
    },
    description: { type: String },
    reminderMinutes: { type: Boolean, default: false }, // Changed from Number to Boolean
    status: {
      type: String,
      enum: Object.values(RoutineStatus),
      default: RoutineStatus.ACTIVE,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'General' },
    tags: { type: [String], default: [] },
    completionStatus: [
      {
        date: { type: Date, required: true },
        completed: { type: Boolean, required: true },
      },
    ],
  },
  { timestamps: true }
);


// Indexes for userId and status
routineSchema.index({ userId: 1 });
routineSchema.index({ status: 1 });

// Instance methods

// Check if the routine is active
routineSchema.methods.isActive = function (this: RoutineDocument): boolean {
  return this.status === RoutineStatus.ACTIVE;
};

// Mark the routine as completed for a specific date
routineSchema.methods.markAsCompleted = function (this: RoutineDocument, date: Date): Promise<RoutineDocument> {
  this.completionStatus.push({ date, completed: true });
  this.status = RoutineStatus.COMPLETED;
  return this.save();
};

// Pause the routine
routineSchema.methods.pauseRoutine = function (this: RoutineDocument): Promise<RoutineDocument> {
  this.status = RoutineStatus.PAUSED;
  return this.save();
};

// Resume the routine
routineSchema.methods.resumeRoutine = function (this: RoutineDocument): Promise<RoutineDocument> {
  if (this.status === RoutineStatus.PAUSED) {
    this.status = RoutineStatus.ACTIVE;
  }
  return this.save();
};

// Calculate the reminder time for the routine
routineSchema.methods.getReminderTime = function (this: RoutineDocument): Date {
  const reminderMinutes = typeof this.reminderMinutes === 'number' ? this.reminderMinutes : 0; // Fallback to 0 if boolean
  const reminderTime = new Date(this.startTime);
  reminderTime.setMinutes(this.startTime.getMinutes() - reminderMinutes);
  return reminderTime;
};

// Find routines by status
routineSchema.static('findByFrequency', function (frequency: Frequency) {
  return this.find({ frequency });
});

const Routine = (mongoose.models.Routine as RoutineModel) || mongoose.model<RoutineDocument, RoutineModel>('Routine', routineSchema);

export default Routine;
