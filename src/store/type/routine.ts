import { Model } from 'mongoose';
import { z } from 'zod';

// Core enums
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

// Base interface for completion status
export interface CompletionStatus {
  date: Date;
  completed: boolean;
}

// Core routine interface
export interface IRoutine {
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
  dailyCompletionStatus: CompletionStatus[];
  streak: number;
  lastCompletedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose model methods interface
export interface IRoutineMethods {
  isActive(): boolean;
  markAsCompleted(date: Date): Promise<IRoutine>;
  pauseRoutine(): Promise<IRoutine>;
  resumeRoutine(): Promise<IRoutine>;
  updateStreak(): void;
}

// Combine core interface with methods for document type
export interface IRoutineDocument extends IRoutine, IRoutineMethods {}

// Mongoose static methods
export interface IRoutineModel extends Model<IRoutineDocument> {
  findByStatus(status: RoutineStatus): Promise<IRoutineDocument[]>;
  findByFrequency(frequency: Frequency): Promise<IRoutineDocument[]>;
  findActiveRoutinesForUser(userId: string): Promise<IRoutineDocument[]>;
}

// Base type for form data without auto-generated fields
type BaseRoutineFormFields = Omit<IRoutine, 
  '_id' | 
  'createdAt' | 
  'updatedAt' | 
  'dailyCompletionStatus' | 
  'streak' | 
  'lastCompletedDate' |
  'startTime' |
  'endTime' |
  'status'
>;

// Form data interface that extends base fields with form-specific types
export interface RoutineFormData extends BaseRoutineFormFields {
  startTime: string | Date;
  endTime: string | Date;
  status?: RoutineStatus;
}

// Form props interface
export interface RoutineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoutineFormData) => Promise<void>;
  initialData?: RoutineFormData | null;
}

// Redux state interface
export interface RoutineState {
  routines: IRoutine[];
  filteredRoutines: IRoutine[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentDate: Date | null;
  viewMode: 'list' | 'grid';
  searchTerm: string;
  sortField: keyof IRoutine | null;
  sortDirection: 'asc' | 'desc';
  categoryFilter: string | null;
  frequencyFilter: Frequency | null;
  statusFilter: RoutineStatus | null;
  selectedUserId: string | null;
}

// API error interface
export interface ApiError {
  error: string;
  statusCode?: number;
  message?: string;
}

// Zod validation schema
export const routineSchema = z.object({
  userId: z.string(),
  title: z.string().min(1, "Title is required"),
  startTime: z.string().or(z.date()).transform((val) => new Date(val)),
  endTime: z.string().or(z.date()).transform((val) => new Date(val)),
  frequency: z.nativeEnum(Frequency),
  daysOfWeek: z.array(z.number().min(0).max(6)),
  monthlyDate: z.number().min(1).max(31).optional(),
  description: z.string().optional(),
  reminderMinutes: z.number().min(0),
  status: z.nativeEnum(RoutineStatus),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).refine(data => {
  return new Date(data.startTime) < new Date(data.endTime);
}, {
  message: "Start time must be before end time",
  path: ["startTime"]
}).refine(data => {
  if (data.frequency === Frequency.MONTHLY && !data.monthlyDate) {
    return false;
  }
  return true;
}, {
  message: "Monthly date is required for monthly frequency",
  path: ["monthlyDate"]
}).refine(data => {
  if ((data.frequency === Frequency.WEEKLY || data.frequency === Frequency.BIWEEKLY) 
      && (!data.daysOfWeek || data.daysOfWeek.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Days of week are required for weekly and biweekly frequency",
  path: ["daysOfWeek"]
});

// Type for validated routine data
export type ValidatedRoutineData = z.infer<typeof routineSchema>;

// Type for routine creation (omits auto-generated fields)
export type CreateRoutineInput = Omit<ValidatedRoutineData, 'status'> & {
  status?: RoutineStatus;
};

// Type for routine updates (all fields optional except id)
export type UpdateRoutineInput = Partial<CreateRoutineInput> & { _id: string };

// Type for completion status update
export interface CompletionStatusUpdate {
  routineId: string;
  date: Date;
}

// Type for routine status update
export interface RoutineStatusUpdate {
  routineId: string;
  status: RoutineStatus;
}

export default routineSchema;