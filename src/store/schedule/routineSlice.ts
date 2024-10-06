import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { Frequency, RoutineStatus } from '../types/routine';

const API_BASE_URL = '/api/features/Routines';

export interface RoutineDocument {
  _id: string;
  userId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  frequency: Frequency;
  daysOfWeek: number[];
  monthlyDate?: number;
  description?: string;
  reminderMinutes: boolean;
  status: RoutineStatus;
  category?: string;
  tags?: string[];
  completionStatus: { date: Date; completed: boolean }[];
  createdAt: Date;
  updatedAt: Date;
}

interface RoutineState {
  routines: RoutineDocument[];
  filteredRoutines: RoutineDocument[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentDate: Date | null;
  viewMode: 'list' | 'grid';
  searchTerm: string;
  sortField: 'name' | 'startTime' | 'status' | null;
  sortDirection: 'asc' | 'desc';
  categoryFilter: string | null;
}

const initialState: RoutineState = {
  routines: [],
  filteredRoutines: [],
  status: 'idle',
  error: null,
  currentDate: new Date(),
  viewMode: 'list',
  searchTerm: '',
  sortField: null,
  sortDirection: 'asc',
  categoryFilter: null,
};

export const fetchRoutines = createAsyncThunk(
  'routines/fetchRoutines',
  async ({ status, userId }: { status?: RoutineStatus; userId?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}`, {
        params: { status, userId },
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue('An error occurred while fetching routines');
      }
    }
  }
);

export const addRoutine = createAsyncThunk(
  'routines/addRoutine',
  async (newRoutine: Omit<RoutineDocument, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}`, newRoutine);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue('An error occurred while adding the routine');
      }
    }
  }
);

export const updateRoutine = createAsyncThunk(
  'routines/updateRoutine',
  async (updatedRoutine: RoutineDocument, { rejectWithValue }) => {
    try {
      const { _id, ...data } = updatedRoutine;
      const response = await axios.put(`${API_BASE_URL}/${_id}`, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue('An error occurred while updating the routine');
      }
    }
  }
);

export const deleteRoutine = createAsyncThunk(
  'routines/deleteRoutine',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      return id;
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue('An error occurred while deleting the routine');
      }
    }
  }
);

const routineSlice = createSlice({
  name: 'routines',
  initialState,
  reducers: {
    setRoutines: (state, action: PayloadAction<RoutineDocument[]>) => {
      state.routines = action.payload;
      state.filteredRoutines = action.payload;
    },
    
    updateCompletionStatus: (state, action: PayloadAction<{ routineId: string; date: string; completed: boolean }>) => {
      const { routineId, date, completed } = action.payload;
      const routine = state.routines.find(r => r._id === routineId);
      if (routine) {
        const existingStatusIndex = routine.completionStatus.findIndex(status => status.date === date);
        if (existingStatusIndex !== -1) {
          routine.completionStatus[existingStatusIndex].completed = completed;
        } else {
          routine.completionStatus.push({ date, completed });
        }
      }
    },
    searchRoutines: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      applyFilters(state);
    },
    setCurrentDate: (state, action: PayloadAction<Date>) => {
      state.currentDate = action.payload;
    },
    handleStatusChange: (state, action: PayloadAction<{ routineId: string; newStatus: RoutineStatus }>) => {
      const { routineId, newStatus } = action.payload;
      const routine = state.routines.find(r => r._id === routineId);
      if (routine) {
        routine.status = newStatus;
      }
    },
    sortOrder: (state, action: PayloadAction<'name' | 'startTime' | 'status'>) => {
      if (state.sortField === action.payload) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = action.payload;
        state.sortDirection = 'asc';
      }
      applyFilters(state);
    },
    filterCategory: (state, action: PayloadAction<string | null>) => {
      state.categoryFilter = action.payload;
      applyFilters(state);
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    clearFilters: (state) => {
      state.searchTerm = '';
      state.sortField = null;
      state.sortDirection = 'asc';
      state.categoryFilter = null;
      state.filteredRoutines = state.routines;
    },
    markRoutineAsCompleted: (state, action: PayloadAction<{ routineId: string; date: Date }>) => {
      const { routineId, date } = action.payload;
      const routine = state.routines.find(r => r._id === routineId);
      if (routine) {
        routine.completionStatus.push({ date, completed: true });
        routine.status = RoutineStatus.COMPLETED;
      }
    },
    pauseRoutine: (state, action: PayloadAction<string>) => {
      const routine = state.routines.find(r => r._id === action.payload);
      if (routine) {
        routine.status = RoutineStatus.PAUSED;
      }
    },
    resumeRoutine: (state, action: PayloadAction<string>) => {
      const routine = state.routines.find(r => r._id === action.payload);
      if (routine && routine.status === RoutineStatus.PAUSED) {
        routine.status = RoutineStatus.ACTIVE;
      }
    },

   


  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutines.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRoutines.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.routines = action.payload;
        state.filteredRoutines = action.payload;
      })
      .addCase(fetchRoutines.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addRoutine.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addRoutine.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.routines.push(action.payload);
        state.filteredRoutines = state.routines;
      })
      .addCase(addRoutine.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateRoutine.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateRoutine.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.routines.findIndex((routine) => routine._id === action.payload._id);
        if (index !== -1) {
          state.routines[index] = action.payload;
          state.filteredRoutines = state.routines;
        }
      })
      .addCase(updateRoutine.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(deleteRoutine.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteRoutine.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.routines = state.routines.filter((routine) => routine._id !== action.payload);
        state.filteredRoutines = state.routines;
      })
      .addCase(deleteRoutine.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

const applyFilters = (state: RoutineState) => {
  let filtered = [...state.routines];

  if (state.searchTerm) {
    const searchTerm = state.searchTerm.toLowerCase();
    filtered = filtered.filter(routine => 
      routine.name.toLowerCase().includes(searchTerm) ||
      routine.description?.toLowerCase().includes(searchTerm) ||
      routine.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  if (state.categoryFilter) {
    filtered = filtered.filter(routine => routine.category === state.categoryFilter);
  }

  if (state.sortField) {
    filtered.sort((a, b) => {
      if (a[state.sortField!] < b[state.sortField!]) return state.sortDirection === 'asc' ? -1 : 1;
      if (a[state.sortField!] > b[state.sortField!]) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  state.filteredRoutines = filtered;
};

export const {
  setViewMode,
  setRoutines, 
  updateCompletionStatus, 
  searchRoutines, 
  setCurrentDate, 
  handleStatusChange, 
  sortOrder,
  filterCategory,
  clearFilters,
  markRoutineAsCompleted,
  pauseRoutine,
  resumeRoutine,
} = routineSlice.actions;

export const selectTotalRoutines = (state: { routines: RoutineState }) => state.routines.filteredRoutines.length;

export const selectCompletedRoutinesByDay = (state: { routines: RoutineState }, date: Date) => {
  return state.routines.routines.filter(routine => 
    routine.completionStatus.some(status => {
      const statusDate = status.date instanceof Date ? status.date : new Date(status.date);
      if (isNaN(statusDate.getTime())) {
        console.warn('Invalid date format for status:', status);
        return false;
      }
      return statusDate.toISOString() === date.toISOString() && status.completed;
    })
  );
};

export const selectUpcomingRoutines = (state: { routines: RoutineState }, currentDate: Date) => {
  return state.routines.filteredRoutines.filter(routine => new Date(routine.startTime) > currentDate);
};

export const selectRoutinesByTimeOfDay = (state: { routines: RoutineState }, startHour: number, endHour: number) => {
  return state.routines.filteredRoutines.filter(routine => {
    const routineHour = new Date(routine.startTime).getHours();
    return routineHour >= startHour && routineHour < endHour;
  });
};

export const selectMorningRoutines = (state: { routines: RoutineState }) => selectRoutinesByTimeOfDay(state, 5, 12);
export const selectAfternoonRoutines = (state: { routines: RoutineState }) => selectRoutinesByTimeOfDay(state, 12, 17);
export const selectEveningRoutines = (state: { routines: RoutineState }) => selectRoutinesByTimeOfDay(state, 17, 22);

export const selectTodayCompletionStatus = (state: { routines: RoutineState }, routineId: string) => {
  const routine = state.routines.routines.find(r => r._id === routineId);
  
  if (routine) {
    const today = new Date().toDateString();
    return routine.completionStatus.find(status => {
      const statusDate = status.date instanceof Date ? status.date : new Date(status.date);
      if (isNaN(statusDate.getTime())) {
        console.warn('Invalid date format in status:', status);
        return false;
      }
      return statusDate.toDateString() === today;
    })?.completed || false;
  }
  return false;
};

export const selectActiveRoutines = (state: { routines: RoutineState }) => 
  state.routines.filteredRoutines.filter(routine => routine.status === RoutineStatus.ACTIVE);

export const selectRoutinesByFrequency = (state: { routines: RoutineState }, frequency: Frequency) => 
  state.routines.filteredRoutines.filter(routine => routine.frequency === frequency);

export const selectRoutineReminderTime = (state: { routines: RoutineState }, routineId: string) => {
  const routine = state.routines.routines.find(r => r._id === routineId);
  if (routine && routine.reminderMinutes) {
    const startTime = new Date(routine.startTime);
    return new Date(startTime.getTime() - routine.reminderMinutes * 60000);
  }
  return null;
};

export const selectRoutinesByTag = (state: { routines: RoutineState }, tag: string) => 
  state.routines.filteredRoutines.filter(routine => routine.tags?.includes(tag));

export const selectRoutinesByCategory = (state: { routines: RoutineState }, category: string) => 
  state.routines.filteredRoutines.filter(routine => routine.category === category);

export const selectRoutineById = (state: { routines: RoutineState }, routineId: string) => 
  state.routines.routines.find(routine => routine._id === routineId);

export const selectPausedRoutines = (state: { routines: RoutineState }) => 
  state.routines.filteredRoutines.filter(routine => routine.status === RoutineStatus.PAUSED);

export const selectCompletedRoutines = (state: { routines: RoutineState }) => 
  state.routines.filteredRoutines.filter(routine => routine.status === RoutineStatus.COMPLETED);

export const selectRoutineCompletion = (state: { routines: RoutineState }, routineId: string, date: Date) => {
  const routine = state.routines.routines.find(r => r._id === routineId);
  if (routine) {
    const formattedDate = date.toISOString().split('T')[0];
    return routine.completionStatus.find(status => {
      const statusDate = status.date instanceof Date ? status.date : new Date(status.date);
      return statusDate.toISOString().split('T')[0] === formattedDate;
    })?.completed || false;
  }
  return false;
};

export const selectRoutineStreak = (state: { routines: RoutineState }, routineId: string) => {
  const routine = state.routines.routines.find(r => r._id === routineId);
  if (routine) {
    let streak = 0;
    const today = new Date();
    const sortedCompletions = routine.completionStatus
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (let i = 0; i < sortedCompletions.length; i++) {
      const completion = sortedCompletions[i];
      const completionDate = new Date(completion.date);
      if (completion.completed && isConsecutiveDay(completionDate, today, i)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
  return 0;
};

const isConsecutiveDay = (date: Date, baseDate: Date, offset: number) => {
  const diff = baseDate.getTime() - date.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
  return daysDiff === offset;
};

export const selectRoutineCompletionHistory = (state: { routines: RoutineState }, routineId: string, days: number) => {
  const routine = state.routines.routines.find(r => r._id === routineId);
  if (routine) {
    const today = new Date();
    const history = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const status = routine.completionStatus.find(s => s.date === dateString);
      history.push({
        date: dateString,
        completed: status ? status.completed : false,
      });
    }
    return history.reverse();
  }
  return [];
};

export default routineSlice.reducer;