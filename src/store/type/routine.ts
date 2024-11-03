
import { Model } from 'mongoose';

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
  dailyCompletionStatus: { date: Date; completed: boolean }[];
  isActive(): boolean;
  markAsCompleted(date: Date): Promise<IRoutine>;
  pauseRoutine(): Promise<IRoutine>;
  resumeRoutine(): Promise<IRoutine>;
  createdAt: Date;
  updatedAt: Date;
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


export interface RoutineModel extends Model<IRoutine> {
  findByStatus(status: RoutineStatus): Promise<IRoutine[]>;
  findByFrequency(frequency: Frequency): Promise<IRoutine[]>;
}

export interface RoutineFormData {
  userId:string;
  title: string;
  startTime: string | Date;
  endTime: string | Date;
  frequency: Frequency;
  daysOfWeek: number[];
  monthlyDate?: number;
  description?: string;
  reminderMinutes: number;
  tags?: string[];
  status?: RoutineStatus;
  category: string,
}

export interface RoutineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoutineFormData) => Promise<void>;
  initialData?: RoutineFormData | null;
}

export interface RoutineState {
  routines: IRoutine[];
  error: string | null;
  currentDate: Date | null;
  viewMode: 'list' | 'grid';
}

export interface ApiError {
  error: string;
  statusCode?: number;
}

// routine schema
import { z } from 'zod';

const routineSchema = z.object({
  userId: z.string(),
  title: z.string().min(1, "Name is required"),
  startTime: z.date(),
  endTime: z.date(),
  frequency: z.nativeEnum(Frequency),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  monthlyDate: z.number().min(1).max(31).optional(),
  description: z.string().optional(),
  reminderMinutes: z.number(),
  status: z.nativeEnum(RoutineStatus),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Export the schema
export default routineSchema;
