import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = '/api/features/specialevents';

export const eventTypes = ["conference", "workshop", "meetup", "party"] as const;
export const eventStatuses = ["pending", "confirmed" ,"cancelled"] as const;

export type EventType = typeof eventTypes[number];
export type EventStatus = typeof eventStatuses[number];

export interface EventDocument {
  _id: string;
  userId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  location: string;
  type: EventType;
  organizer: string;
  attendees?: string[];
  createdAt: Date;
  updatedAt: Date;
  reminder?: boolean;
  capacity?: number;
  registeredAttendees?: number;
  eventLinks?: string[];
  mapLink?: string;
  status: EventStatus;
}

interface EventState {
  events: EventDocument[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchTerm: string;
  sortBy: keyof EventDocument;
  sortOrder: 'asc' | 'desc';
  filterType: EventType | 'all';
  filterStatus: EventStatus | 'all';
  viewMode: 'list' | 'grid';
}

const initialState: EventState = {
  events: [],
  status: 'idle',
  error: null,
  searchTerm: '',
  sortBy: 'startTime',
  sortOrder: 'asc',
  filterType: 'all',
  filterStatus: 'all',
  viewMode: 'list',
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async ({ organizer }: { organizer?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}`, {
        params: { organizer },
      });
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.error || 'An error occurred while fetching events');
      }
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue('An error occurred while fetching events');
      }
    }
  }
);

export const addEvent = createAsyncThunk(
  'events/addEvent',
  async (newEvent: Omit<EventDocument, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      if (newEvent.capacity != null && (newEvent.registeredAttendees ?? 0) > newEvent.capacity) {
        return rejectWithValue('Registered attendees exceed the event capacity');
      }
      const response = await axios.post(`${API_BASE_URL}`, newEvent);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue('An error occurred while adding the event');
      }
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async (updatedEvent: EventDocument, { rejectWithValue }) => {
    try {
      if (updatedEvent.capacity != null && (updatedEvent.registeredAttendees ?? 0) > updatedEvent.capacity) {
        return rejectWithValue('Registered attendees exceed the event capacity');
      }
      const { _id, ...data } = updatedEvent;
      const response = await axios.put(`${API_BASE_URL}/${_id}`, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue('An error occurred while updating the event');
      }
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      return id;
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue('An error occurred while deleting the event');
      }
    }
  }
);

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<EventDocument[]>) => {
      state.events = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSortBy: (state, action: PayloadAction<keyof EventDocument>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    setFilterType: (state, action: PayloadAction<EventType | 'all'>) => {
      state.filterType = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<EventStatus | 'all'>) => {
      state.filterStatus = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'list' | 'grid'>) => {
      state.viewMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'An error occurred while fetching events';
      })
      .addCase(addEvent.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        // Optimistic add
        const tempId = Date.now().toString(); // Generate a temporary ID
        const newEvent = {
          ...action.meta.arg,
          _id: tempId,
          createdAt: new Date(),
          updatedAt: new Date()
        } as EventDocument;
        state.events.push(newEvent);
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.events.findIndex(event => event._id === action.meta.arg._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        } else {
          state.events.push(action.payload);
        }
      })
      .addCase(addEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.events = state.events.filter(event => event._id !== action.meta.arg._id);
      })
      .addCase(updateEvent.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        const index = state.events.findIndex((event) => event._id === action.meta.arg._id);
        if (index !== -1) {
          state.events[index] = { ...state.events[index], ...action.meta.arg };
        }
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.events.findIndex((event) => event._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
       
        state.events = state.events.map(event => 
          event._id === action.meta.arg._id ? action.meta.arg : event
        );
      })
      .addCase(deleteEvent.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.events = state.events.filter((event) => event._id !== action.meta.arg);
      })
      
      .addCase(deleteEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.status = 'loading';
        fetchEvents({ organizer: undefined });
      });
  },
});

export const {
  setEvents,
  setSearchTerm,
  setSortBy,
  setSortOrder,
  setFilterType,
  setFilterStatus,
  setViewMode,
} = eventSlice.actions;

// Selector functions
export const selectAllEvents = (state: { events: EventState }) => state.events.events;
export const selectEventById = (state: { events: EventState }, eventId: string) =>
  state.events.events.find((event) => event._id === eventId);

export const selectFilteredAndSortedEvents = (state: { events: EventState }) => {
  let filteredEvents = [...state.events.events];

  // Apply search
  if (state.events.searchTerm) {
    filteredEvents = filteredEvents.filter((event) =>
      event.name.toLowerCase().includes(state.events.searchTerm.toLowerCase())
    );
  }

  // Apply type filter
  if (state.events.filterType !== 'all') {
    filteredEvents = filteredEvents.filter((event) => event.type === state.events.filterType);
  }

  // Apply status filter
  if (state.events.filterStatus !== 'all') {
    filteredEvents = filteredEvents.filter((event) => event.status === state.events.filterStatus);
  }

  // Apply sorting
  return filteredEvents.sort((a, b) => {
    const sortBy = state.events.sortBy ?? 'startTime';
    const sortOrder = state.events.sortOrder ?? 'asc';

    const valueA = a[sortBy];
    const valueB = b[sortBy];

    if (valueA === undefined || valueB === undefined) {
      return 0;
    }

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

export const selectTotalEvents = (state: { events: EventState }) => state.events.events.length;

export const selectUpcomingEvents = (state: { events: EventState }, currentDate: Date) => {
  return state.events.events.filter(event => new Date(event.startTime) > currentDate);
};

export const selectEventsByStatus = (state: { events: EventState }, status: EventStatus) =>
  state.events.events.filter((event) => event.status === status);

export const selectEventsByType = (state: { events: EventState }, type: EventType) =>
  state.events.events.filter((event) => event.type === type);

export default eventSlice.reducer;