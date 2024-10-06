import { Document, Model, Schema } from 'mongoose';
import { ReactNode } from 'react';

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

export interface IRoutine {
  name: string;
  startTime: Date;
  endTime: Date;
  frequency: Frequency;
  daysOfWeek: number[];
  monthlyDate?: number;
  description?: string;
  reminderMinutes: boolean;
  status: RoutineStatus;
  userId: Schema.Types.ObjectId;
  category?: string;
  tags?: string[];
}

export interface RoutineDocument extends IRoutine, Document {
  _id: string;
  completionStatus: { date: Date; completed: boolean }[];
  createdAt: Date;
  updatedAt: Date;
  isActive: () => boolean;
}

export interface RoutineModel extends Model<RoutineDocument> {
  findByStatus(status: RoutineStatus): Promise<RoutineDocument[]>;
  findByFrequency(frequency: Frequency): Promise<RoutineDocument[]>;
}

export interface RoutineFormData {
  _id: string;
  userId:string;
  name: string;
  startTime: string | Date;
  endTime: string | Date;
  frequency: Frequency;
  daysOfWeek: number[];
  monthlyDate?: number;
  description?: string;
  reminderMinutes: boolean;
  status?: RoutineStatus;
}

export interface RoutineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoutineFormData) => Promise<void>;
  initialData?: RoutineFormData | null;
}

export interface RoutineState {
  routines: RoutineDocument[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
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
  name: z.string().min(1, "Name is required"),
  startTime: z.date(),
  endTime: z.date(),
  frequency: z.nativeEnum(Frequency),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  monthlyDate: z.number().min(1).max(31).optional(),
  description: z.string().optional(),
  reminderMinutes: z.boolean(),
  status: z.nativeEnum(RoutineStatus),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Export the schema
export default routineSchema;
