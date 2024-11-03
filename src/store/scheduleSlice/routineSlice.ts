import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { RootState } from '..';

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
  createdAt: Date;
  updatedAt: Date;
}


interface RoutineState {
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
  frequencyFilter: null,
  statusFilter: null,
  selectedUserId: null,
};

const API_BASE_URL = '/api/features/schedules/routines';

// Async Thunks
export const fetchRoutines = createAsyncThunk('routines/fetchRoutines', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data.routines;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch routines');
  }
});

export const addRoutine = createAsyncThunk(
  'routines/addRoutine',
  async (newRoutine: Omit<IRoutine, '_id'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_BASE_URL, newRoutine);
      return response.data.routine;
    } catch (error:any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add routine');
    }
  }
);

export const updateRoutine = createAsyncThunk(
  'routines/updateRoutine',
  async (updatedRoutine: IRoutine, { rejectWithValue }) => {
    try {
      if (!updatedRoutine._id) {
        throw new Error('Routine ID is required');
      }

      const { _id, ...data } = updatedRoutine;
      
      // Validate time constraints
      if (data.startTime && data.endTime) {
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        
        if (startTime >= endTime) {
          throw new Error('Start time must be before end time');
        }
      }
      
      // Validate status
      if (data.status && !Object.values(RoutineStatus).includes(data.status)) {
        throw new Error(`Invalid status. Must be one of: ${Object.values(RoutineStatus).join(', ')}`);
      }
      
      // Validate frequency
      if (data.frequency && !Object.values(Frequency).includes(data.frequency)) {
        throw new Error(`Invalid frequency. Must be one of: ${Object.values(Frequency).join(', ')}`);
      }
      
      // Validate days of week if frequency is weekly or biweekly
      if ((data.frequency === Frequency.WEEKLY || data.frequency === Frequency.BIWEEKLY) 
          && (!data.daysOfWeek || data.daysOfWeek.length === 0)) {
        throw new Error('Days of week must be specified for weekly or biweekly routines');
      }
      
      // Validate monthly date if frequency is monthly
      if (data.frequency === Frequency.MONTHLY && !data.monthlyDate) {
        throw new Error('Monthly date must be specified for monthly routines');
      }

      // Format dates properly before sending to API
      const formattedData = {
        ...data,
        startTime: data.startTime instanceof Date ? data.startTime.toISOString() : data.startTime,
        endTime: data.endTime instanceof Date ? data.endTime.toISOString() : data.endTime
      };

      console.log('Sending update request:', {
        id: _id,
        data: formattedData
      });

      const response = await axios.put(`${API_BASE_URL}/${_id}`, formattedData);
      
      if (!response.data?.routine) {
        throw new Error('No data received from server');
      }
      
      return response.data.routine;
    } catch (err) {
      console.error('Update routine error:', {
        error: err,
        requestData: updatedRoutine,
        message: err instanceof Error ? err.message : 'Unknown error'
      });

      // Handle different types of errors
      if (err instanceof Error) {
        // If it's a validation error, return it directly
        if (err.message.includes('Start time must be before end time')) {
          return rejectWithValue(err.message);
        }
      }
      
      const error = err as AxiosError;
      const errorMessage = (error.response?.data as Record<string, any>)?.error || 
                          (error.response?.data as Record<string, any>)?.message || 
                          'Failed to update routine';
      
      return rejectWithValue(errorMessage);
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
      return rejectWithValue(error.response?.data || 'Failed to delete routine');
    }
  }
);

export const updateCompletionStatus = createAsyncThunk(
  'routines/updateCompletionStatus',
  async ({ routineId, date }: { routineId: string; date: Date }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${routineId}`, {
        action: 'markCompleted',
        date: date.toISOString()
      });
      return response.data.routine;
    } catch (err) {
      const error = err as AxiosError;
      return rejectWithValue(error.response?.data || 'Failed to update completion status');
    }
  }
);

export const updateRoutineStatus = createAsyncThunk(
  'routines/updateStatus',
  async ({ routineId, status }: { routineId: string; status: RoutineStatus }, { rejectWithValue }) => {
    try {
      // Map the status to the correct action
      let action: string;
      switch (status) {
        case RoutineStatus.PAUSED:
          action = 'pause';
          break;
        case RoutineStatus.ACTIVE:
          action = 'resume';
          break;
        default:
          throw new Error('Unsupported status update');
      }

      const response = await axios.patch(`${API_BASE_URL}/${routineId}`, {
        action,
        date: new Date().toISOString() // Include current date as it's required by the API
      });
      return response.data.routine;
    } catch (err) {
      const error = err as AxiosError;
      return rejectWithValue(error.response?.data || 'Failed to update routine status');
    }
  }
);

const applyFilters = (state: RoutineState) => {
  let filtered = [...state.routines];

  // User filter
  if (state.selectedUserId) {
    filtered = filtered.filter(routine => routine.userId === state.selectedUserId);
  }

  // Search term
  if (state.searchTerm) {
    const searchTerm = state.searchTerm.toLowerCase();
    filtered = filtered.filter(routine => 
      routine.title.toLowerCase().includes(searchTerm) ||
      routine.description?.toLowerCase().includes(searchTerm) ||
      routine.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Category filter
  if (state.categoryFilter) {
    filtered = filtered.filter(routine => routine.category === state.categoryFilter);
  }

  // Frequency filter
  if (state.frequencyFilter) {
    filtered = filtered.filter(routine => routine.frequency === state.frequencyFilter);
  }

  // Status filter
  if (state.statusFilter) {
    filtered = filtered.filter(routine => routine.status === state.statusFilter);
  }

  // Sorting
  if (state.sortField) {
    filtered.sort((a, b) => {
      const aVal = a[state.sortField!];
      const bVal = b[state.sortField!];
  
      if (typeof aVal === 'undefined' || typeof bVal === 'undefined') {
        return 0; // Handle undefined values
      }
  
      if (aVal < bVal) return state.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  state.filteredRoutines = filtered;
  return filtered;
};

const routineSlice = createSlice({
  name: 'routines',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<string>) => {
      state.selectedUserId = action.payload;
      applyFilters(state);
    },
    
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },

    searchRoutines: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      applyFilters(state);
    },

    setCurrentDate: (state, action: PayloadAction<Date>) => {
      state.currentDate = action.payload;
    },

    sortRoutines: (state, action: PayloadAction<keyof IRoutine>) => {
      if (state.sortField === action.payload) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = action.payload;
        state.sortDirection = 'asc';
      }
      applyFilters(state);
    },

    filterByCategory: (state, action: PayloadAction<string | null>) => {
      state.categoryFilter = action.payload;
      applyFilters(state);
    },

    filterByFrequency: (state, action: PayloadAction<Frequency | null>) => {
      state.frequencyFilter = action.payload;
      applyFilters(state);
    },

    filterByStatus: (state, action: PayloadAction<RoutineStatus | null>) => {
      state.statusFilter = action.payload;
      applyFilters(state);
    },

    clearFilters: (state) => {
      state.searchTerm = '';
      state.sortField = null;
      state.sortDirection = 'asc';
      state.categoryFilter = null;
      state.frequencyFilter = null;
      state.statusFilter = null;
      state.filteredRoutines = state.routines;
    },

    updateStreak: (state, action: PayloadAction<string>) => {
      const routine = state.routines.find(r => r._id === action.payload);
      if (routine && routine.lastCompletedDate) {
        const today = new Date();
        const lastCompleted = new Date(routine.lastCompletedDate);
        const diffDays = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 3600 * 24));

        if (diffDays <= 1) {
          routine.streak += 1;
        } else {
          routine.streak = 0;
        }
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
        applyFilters(state);
      })
      .addCase(fetchRoutines.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addRoutine.fulfilled, (state, action) => {
        state.routines.push(action.payload);
        applyFilters(state);
      })
      .addCase(updateRoutine.fulfilled, (state, action) => {
        const index = state.routines.findIndex((routine) => routine._id === action.payload._id);
        if (index !== -1) {
          state.routines[index] = action.payload;
          applyFilters(state);
        }
      })
      .addCase(deleteRoutine.fulfilled, (state, action) => {
        state.routines = state.routines.filter((routine) => routine._id !== action.payload);
        applyFilters(state);
      })
      .addCase(updateCompletionStatus.fulfilled, (state, action) => {
        const index = state.routines.findIndex((routine) => routine._id === action.payload._id);
        if (index !== -1) {
          state.routines[index] = action.payload;
          applyFilters(state);
        }
      })
      .addCase(updateRoutineStatus.fulfilled, (state, action) => {
        const index = state.routines.findIndex((routine) => routine._id === action.payload._id);
        if (index !== -1) {
          state.routines[index] = action.payload;
          applyFilters(state);
        }
      });
  },
});

// Selectors
export const selectRoutinesByTimeRange = (state: RootState, startHour: number, endHour: number) => {
  return state.routines.filteredRoutines.filter(routine => {
    const routineHour = new Date(routine.startTime).getHours();
    return routineHour >= startHour && routineHour < endHour;
  });
};

export const selectMorningRoutines = (state: RootState) => selectRoutinesByTimeRange(state, 5, 12);
export const selectAfternoonRoutines = (state: RootState) => selectRoutinesByTimeRange(state, 12, 17);
export const selectEveningRoutines = (state: RootState) => selectRoutinesByTimeRange(state, 17, 22);

export const selectRoutineById = (state: RootState, routineId: string) => 
  state.routines.routines.find(routine => routine._id === routineId);

export const selectActiveRoutines = (state: RootState) => 
  state.routines.filteredRoutines.filter(routine => routine.status === RoutineStatus.ACTIVE);

export const selectRoutinesByFrequency = (state: RootState, frequency: Frequency) => 
  state.routines.filteredRoutines.filter(routine => routine.frequency === frequency);

export const selectRoutinesByCategory = (state: RootState, category: string) => 
  state.routines.filteredRoutines.filter(routine => routine.category === category);

export const selectRoutinesByTag = (state: RootState, tag: string) => 
  state.routines.filteredRoutines.filter(routine => routine.tags?.includes(tag));

export const selectCompletedRoutines = (state: RootState) => 
  state.routines.filteredRoutines.filter(routine => routine.status === RoutineStatus.COMPLETED);

export const selectPausedRoutines = (state: RootState) => 
  state.routines.filteredRoutines.filter(routine => routine.status === RoutineStatus.PAUSED);

export const selectTodayCompletionStatus = (state: RootState, routineId: string) => {
  const routine = selectRoutineById(state, routineId);
  if (routine) {
    const today = new Date().toDateString();
    return routine.dailyCompletionStatus.find(status => 
      new Date(status.date).toDateString() === today
    )?.completed || false;
  }
  return false;
};

export const {
  setSelectedUser,
  setViewMode,
  searchRoutines,
  setCurrentDate,
  sortRoutines,
  filterByCategory,
  filterByFrequency,
  filterByStatus,
  clearFilters,
  updateStreak,
} = routineSlice.actions;

export default routineSlice.reducer;