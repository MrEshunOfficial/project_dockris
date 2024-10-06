// features/appointments/appointmentsSlice.ts

import axiosInstance from '@/lib/axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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

export interface Appointment {
  _id: string;
  userId: string;
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

interface AppointmentsState {
  appointments: Appointment[];
  filteredAppointments: Appointment[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchTerm: string;
  sortBy: 'date' | 'title' | 'status' | 'privacy';
  sortOrder: 'asc' | 'desc';
}

const initialState: AppointmentsState = {
  appointments: [],
  filteredAppointments: [],
  status: 'idle',
  error: null,
  searchTerm: '',
  sortBy: 'date',
  sortOrder: 'asc',
};

const API_BASE_URL = "/api/features/appointment";

// Thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async ({ status }: { status?: AppointmentStatus } = {}, { rejectWithValue }) => {
    try {
      const url = status ? `${API_BASE_URL}?status=${status}` : API_BASE_URL;
      const response = await axiosInstance.get(url);
      return response.data.appointments;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching appointments');
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchAppointmentById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
      return response.data.appointment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching appointment');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData: Omit<Appointment, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_BASE_URL, appointmentData);
      return response.data.appointment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error creating appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, data }: { id: string; data: Partial<Appointment> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, data);
      return response.data.appointment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error updating appointment');
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting appointment');
    }
  }
);

// Slice
const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filteredAppointments = state.appointments.filter(
        apt => 
          apt.title.toLowerCase().includes(action.payload.toLowerCase()) ||
          apt.privacy.toLowerCase().includes(action.payload.toLowerCase()) ||
          (apt.recurring ? 'recurring' : 'non-recurring').includes(action.payload.toLowerCase())
      );
    },
    setSortBy: (state, action: PayloadAction<'date' | 'title' | 'status' | 'privacy'>) => {
      state.sortBy = action.payload;
      state.filteredAppointments = [...state.filteredAppointments].sort((a, b) => {
        if (state.sortBy === 'date') {
          return state.sortOrder === 'asc' 
            ? new Date(a.start).getTime() - new Date(b.start).getTime()
            : new Date(b.start).getTime() - new Date(a.start).getTime();
        } else if (state.sortBy === 'title') {
          return state.sortOrder === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        } else if (state.sortBy === 'status') {
          return state.sortOrder === 'asc'
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        } else if (state.sortBy === 'privacy') {
          return state.sortOrder === 'asc'
            ? a.privacy.localeCompare(b.privacy)
            : b.privacy.localeCompare(a.privacy);
        }
        return 0;
      });
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
      state.filteredAppointments = [...state.filteredAppointments].reverse();
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
        state.filteredAppointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch Appointment by ID
      .addCase(fetchAppointmentById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.status = 'succeeded';
        const index = state.appointments.findIndex(apt => apt._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        } else {
          state.appointments.push(action.payload);
        }
        state.filteredAppointments = [...state.appointments]; // Update filtered appointments
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Create Appointment
      .addCase(createAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.status = 'succeeded';
        state.appointments.push(action.payload);
        state.filteredAppointments = [...state.appointments]; // Update filtered appointments
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Update Appointment
      .addCase(updateAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.status = 'succeeded';
        const index = state.appointments.findIndex(apt => apt._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
          state.filteredAppointments = state.appointments.map(apt => 
            apt._id === action.payload._id ? action.payload : apt
          );
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Delete Appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.appointments = state.appointments.filter(apt => apt._id !== action.payload);
        state.filteredAppointments = state.filteredAppointments.filter(apt => apt._id !== action.payload);
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setSearchTerm, setSortBy, setSortOrder } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;

// Selectors
export const selectAppointments = (state: { appointments: AppointmentsState }) => state.appointments.filteredAppointments;
export const selectStatus = (state: { appointments: AppointmentsState }) => state.appointments.status;
export const selectError = (state: { appointments: AppointmentsState }) => state.appointments.error;
export const selectSearchTerm = (state: { appointments: AppointmentsState }) => state.appointments.searchTerm;
export const selectSortBy = (state: { appointments: AppointmentsState }) => state.appointments.sortBy;
export const selectSortOrder = (state: { appointments: AppointmentsState }) => state.appointments.sortOrder;

// Additional Selectors
export const selectRecurringAppointments = (state: { appointments: AppointmentsState }) =>
  state.appointments.filteredAppointments.filter(apt => apt.recurring);

export const selectPrivateAppointments = (state: { appointments: AppointmentsState }) =>
  state.appointments.filteredAppointments.filter(apt => apt.privacy === 'private');
