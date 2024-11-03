import mongoose, { Schema, Document, Model } from 'mongoose';

// Enable debugging in development
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

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

export interface RoutineDocument extends Document {
  _id: string;
  userId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  frequency: Frequency;
  daysOfWeek: number[];
  monthlyDate?: number;
  description?: string;
  reminderMinutes: number;
  status: RoutineStatus;
  category?: string;
  tags?: string[];
  dailyCompletionStatus: { date: Date; completed: boolean }[];
  streak: number;
  lastCompletedDate?: Date;
  isActive(): boolean;
  markAsCompleted(date: Date): Promise<RoutineDocument>;
  pauseRoutine(): Promise<RoutineDocument>;
  resumeRoutine(): Promise<RoutineDocument>;
  updateStreak(): void;
  createdAt: Date;
  updatedAt: Date;
}

interface RoutineModel extends Model<RoutineDocument> {
  findByStatus(status: RoutineStatus): Promise<RoutineDocument[]>;
  findByFrequency(frequency: Frequency): Promise<RoutineDocument[]>;
  findActiveRoutinesForUser(userId: string): Promise<RoutineDocument[]>;
}

const routineSchema = new Schema<RoutineDocument, RoutineModel>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    startTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: RoutineDocument, startTime: Date) {
          // If this is an update operation and endTime isn't being modified, 
          // use the existing endTime
          const endTime = this.endTime || this.get('endTime');
          return new Date(startTime) < new Date(endTime);
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
    reminderMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(RoutineStatus),
      default: RoutineStatus.ACTIVE,
      index: true,
    },
    category: { type: String, default: 'General', index: true },
    tags: { type: [String], default: [], index: true },
    dailyCompletionStatus: [
      {
        date: { type: Date, required: true },
        completed: { type: Boolean, required: true },
      },
    ],
    streak: { type: Number, default: 0 },
    lastCompletedDate: { type: Date },
  },
  { 
    timestamps: true,
    // Add optimistic concurrency control
    optimisticConcurrency: true
  }
);

// Check if the routine is active
routineSchema.methods.isActive = function (this: RoutineDocument): boolean {
  return this.status === RoutineStatus.ACTIVE;
};

// Mark the routine as completed for a specific date
routineSchema.methods.markAsCompleted = async function (this: RoutineDocument, date: Date): Promise<RoutineDocument> {
  try {
    const completionEntry = { date, completed: true };
    const existingEntryIndex = this.dailyCompletionStatus.findIndex(
      (entry) => entry.date.toDateString() === date.toDateString()
    );

    if (existingEntryIndex !== -1) {
      this.dailyCompletionStatus[existingEntryIndex] = completionEntry;
    } else {
      this.dailyCompletionStatus.push(completionEntry);
    }

    this.lastCompletedDate = date;
    this.updateStreak();
    return await this.save();
  } catch (error) {
    throw error;
  }
};

// Pause the routine
routineSchema.methods.pauseRoutine = async function (this: RoutineDocument): Promise<RoutineDocument> {
  try {
    this.status = RoutineStatus.PAUSED;
    return await this.save();
  } catch (error) {
    throw error;
  }
};

// Resume the routine
routineSchema.methods.resumeRoutine = async function (this: RoutineDocument): Promise<RoutineDocument> {
  try {
    if (this.status === RoutineStatus.PAUSED) {
      this.status = RoutineStatus.ACTIVE;
    }
    return await this.save();
  } catch (error) {
    throw error;
  }
};

// Update streak
routineSchema.methods.updateStreak = function (this: RoutineDocument): void {
  if (!this.lastCompletedDate) {
    this.streak = 0;
    return;
  }

  const today = new Date();
  const lastCompleted = new Date(this.lastCompletedDate);
  const diffDays = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 3600 * 24));

  if (diffDays <= 1) {
    this.streak += 1;
  } else {
    this.streak = 0;
  }
};

// Find routines by status
routineSchema.static('findByStatus', function (status: RoutineStatus) {
  return this.find({ status });
});

// Find routines by frequency
routineSchema.static('findByFrequency', function (frequency: Frequency) {
  return this.find({ frequency });
});

// Find active routines for a specific user
routineSchema.static('findActiveRoutinesForUser', function (userId: string) {
  return this.find({ userId, status: RoutineStatus.ACTIVE });
});

// Prevent model recompilation error
const userRoutines = mongoose.models.userRoutines || mongoose.model<RoutineDocument, RoutineModel>('userRoutines', routineSchema);

export default userRoutines;