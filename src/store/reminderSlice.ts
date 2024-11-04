import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { IReminder } from "@/models/notification/reminderModel";
import { RootState } from '@/store';

const BASE_REMINDER_URL = '/api/reminder';

type ReminderStatus = 'pending' | 'completed' | 'missed';
type EntityType = 'todo' | 'routine' | 'appointment'|'specialevent';

// Define a separate interface for the Redux state without Mongoose Document properties
export interface ReminderState {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // ISO string
  time: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatUntil?: string; // ISO string
  notification: {
    enabled: boolean;
    timeBefore: number;
  };
  status: ReminderStatus;
  createdBy: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  entityType: EntityType;
  entityId?: string;
}

interface RemindersSliceState {
  reminders: ReminderState[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RemindersSliceState = {
  reminders: [],
  status: 'idle',
  error: null,
};

// Helper function to convert IReminder to ReminderState
const normalizeReminder = (reminder: any): ReminderState => ({
  _id: reminder._id?.toString() ?? '',
  userId: reminder.userId,
  title: reminder.title,
  description: reminder.description,
  date: new Date(reminder.date).toISOString(),
  time: reminder.time,
  isRecurring: reminder.isRecurring ?? false,
  recurrencePattern: reminder.recurrencePattern,
  repeatUntil: reminder.repeatUntil ? new Date(reminder.repeatUntil).toISOString() : undefined,
  notification: {
    enabled: reminder.notification?.enabled ?? true,
    timeBefore: reminder.notification?.timeBefore ?? 10,
  },
  status: reminder.status ?? 'pending',
  createdBy: reminder.createdBy.toString(),
  createdAt: new Date(reminder.createdAt).toISOString(),
  updatedAt: new Date(reminder.updatedAt).toISOString(),
  entityType: reminder.entityType,
  entityId: reminder.entityId?.toString(),
});

export const fetchReminders = createAsyncThunk<ReminderState[], void, { rejectValue: string }>(
  'reminder/fetchReminders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ reminders: IReminder[] }>(BASE_REMINDER_URL);
      if (!response.data.reminders || !Array.isArray(response.data.reminders)) {
        throw new Error('Invalid response format');
      }
      return response.data.reminders.map(normalizeReminder);
    } catch (error) {
      console.error('Fetch Reminders Error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch reminders');
    }
  }
);

export const addReminder = createAsyncThunk<
  ReminderState,
  Partial<ReminderState>,
  { rejectValue: { message: string } }
>(
  'reminder/addReminder',
  async (reminder, { rejectWithValue }) => {
    try {
      const response = await axios.post<{ success: boolean; reminder: IReminder; message: string }>(
        BASE_REMINDER_URL,
        {
          ...reminder,
          notification: {
            enabled: reminder.notification?.enabled ?? true,
            timeBefore: reminder.notification?.timeBefore ?? 10,
          },
          status: reminder.status ?? 'pending',
        }
      );
      
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }

      return normalizeReminder(response.data.reminder);
    } catch (error) {
      console.error('Redux Thunk Error:', error);
      if (axios.isAxiosError(error)) {
        return rejectWithValue({ 
          message: error.response?.data?.message || error.message || 'Failed to add reminder'
        });
      }
      return rejectWithValue({ message: 'Failed to add reminder' });
    }
  }
);

export const updateReminder = createAsyncThunk<ReminderState, Partial<ReminderState>, { rejectValue: string }>(
  'reminder/updateReminder',
  async (reminder, { rejectWithValue }) => {
    try {
      const response = await axios.put<{ reminder: IReminder }>(
        `${BASE_REMINDER_URL}/${reminder._id}`,
        reminder
      );
      return normalizeReminder(response.data.reminder);
    } catch (error) {
      return rejectWithValue('Failed to update reminder');
    }
  }
);

export const updateReminderStatus = createAsyncThunk<
  ReminderState,
  { id: string; status: ReminderStatus },
  { rejectValue: string }
>(
  'reminder/updateReminderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch<{ reminder: IReminder }>(
        `${BASE_REMINDER_URL}/${id}/status`,
        { status }
      );
      return normalizeReminder(response.data.reminder);
    } catch (error) {
      return rejectWithValue('Failed to update reminder status');
    }
  }
);

export const deleteReminder = createAsyncThunk<string, string, { rejectValue: string }>(
  'reminder/deleteReminder',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_REMINDER_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete reminder');
    }
  }
);

export const fetchRemindersByEntity = createAsyncThunk<
  ReminderState[],
  { entityType: EntityType; entityId: string },
  { rejectValue: string }
>(
  'reminder/fetchRemindersByEntity',
  async ({ entityType, entityId }, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ reminders: IReminder[] }>(
        `${BASE_REMINDER_URL}?entityType=${entityType}&entityId=${entityId}`
      );
      return response.data.reminders.map(normalizeReminder);
    } catch (error) {
      return rejectWithValue('Failed to fetch reminders for the entity');
    }
  }
);

const reminderSlice = createSlice({
  name: 'reminder',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReminders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReminders.fulfilled, (state, action: PayloadAction<ReminderState[]>) => {
        state.status = 'succeeded';
        state.reminders = action.payload;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch reminders';
      })
      .addCase(addReminder.fulfilled, (state, action: PayloadAction<ReminderState>) => {
        state.reminders.push(action.payload);
      })
      .addCase(updateReminder.fulfilled, (state, action: PayloadAction<ReminderState>) => {
        const index = state.reminders.findIndex(reminder => reminder._id === action.payload._id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      })
      .addCase(updateReminderStatus.fulfilled, (state, action: PayloadAction<ReminderState>) => {
        const index = state.reminders.findIndex(reminder => reminder._id === action.payload._id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      })
      .addCase(deleteReminder.fulfilled, (state, action: PayloadAction<string>) => {
        state.reminders = state.reminders.filter(reminder => reminder._id !== action.payload);
      })
      .addCase(fetchRemindersByEntity.fulfilled, (state, action: PayloadAction<ReminderState[]>) => {
        state.status = 'succeeded';
        const existingIds = new Set(state.reminders.map(r => r._id));
        action.payload.forEach(reminder => {
          if (!existingIds.has(reminder._id)) {
            state.reminders.push(reminder);
          }
        });
      });
  },
});

// Selectors
export const selectAllReminders = (state: RootState) => state.reminder.reminders;
export const selectRemindersByStatus = (state: RootState, status: ReminderStatus) =>
  state.reminder.reminders.filter(reminder => reminder.status === status);
export const selectRemindersByEntity = (state: RootState, entityType: EntityType, entityId: string) =>
  state.reminder.reminders.filter(reminder => 
    reminder.entityType === entityType && reminder.entityId === entityId
  );
export const selectRecurringReminders = (state: RootState) =>
  state.reminder.reminders.filter(reminder => reminder.isRecurring);
export const selectReminderStatus = (state: RootState) => state.reminder.status;
export const selectReminderError = (state: RootState) => state.reminder.error;

export default reminderSlice.reducer;