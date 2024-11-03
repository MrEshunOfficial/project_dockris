import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

const BASE_EVENT_URL = '/api/features/schedules/specialevents'

// Align types with the model
export const eventTypes = ["conference", "workshop", "meetup", "party", "webinar", "training"] as const;
export const eventStatuses = ["draft", "pending", "confirmed", "cancelled", "completed"] as const;

export type EventType = typeof eventTypes[number];
export type EventStatus = typeof eventStatuses[number];

// Enhanced interface to match the model
export interface EventDocument {
  _id: string;
  userId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  description?: string;
  type: EventType;
  organizer: string;
  capacity?: number;
  registeredAttendees?: number;
  eventLinks?: string[];
  mapLink?: string;
  status: EventStatus;
  tags?: string[];
  isPublic: boolean;
  categories?: string[];
  virtualMeetingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
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
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
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
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  dateRange: {
    startDate: null,
    endDate: null
  }
};

// Enhanced fetch events with pagination and filters
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params: {
    page?: number;
    limit?: number;
    status?: EventStatus;
    type?: EventType;
    startDate?: string;
    endDate?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_EVENT_URL, { params });
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      return rejectWithValue(error.response?.data || 'Failed to fetch events');
    }
  }
);

// Enhanced validation in add event
export const addEvent = createAsyncThunk(
  'events/addEvent',
  async (newEvent: Omit<EventDocument, '_id' | 'createdAt' | 'updatedAt' | 'userId'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(BASE_EVENT_URL, newEvent);
      return response.data.event;
    } catch (err) {
      const error = err as AxiosError;
      return rejectWithValue(error.response?.data || 'Failed to add event');
    }
  }
);

interface ErrorResponse {
  error?: {
    message?: string;
  };
  message?: string;
}

// Enhanced update event with status transition validation
export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async (
    { id, data }: { id: string; data: Partial<EventDocument> },
    { rejectWithValue }
  ) => {
    try {
      if (!id) {
        return rejectWithValue('Event ID is required');
      }

      const response = await axios.patch<{ event: EventDocument }>(
        `${BASE_EVENT_URL}/${id}`,
        data
      );
      return response.data.event;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to update event';

      return rejectWithValue(errorMessage);
    }
  }
);


// Enhanced delete event with additional checks
export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_EVENT_URL}/${id}`);
      return id;
    } catch (err) {
      const error = err as AxiosError;
      return rejectWithValue(error.response?.data || 'Failed to delete event');
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
      state.pagination.page = 1; // Reset pagination when searching
    },
    setSortBy: (state, action: PayloadAction<keyof EventDocument>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    setFilterType: (state, action: PayloadAction<EventType | 'all'>) => {
      state.filterType = action.payload;
      state.pagination.page = 1; // Reset pagination when filtering
    },
    setFilterStatus: (state, action: PayloadAction<EventStatus | 'all'>) => {
      state.filterStatus = action.payload;
      state.pagination.page = 1; // Reset pagination when filtering
    },
    setViewMode: (state, action: PayloadAction<'list' | 'grid'>) => {
      state.viewMode = action.payload;
    },
    setDateRange: (state, action: PayloadAction<{ startDate: string | null; endDate: string | null }>) => {
      state.dateRange = action.payload;
      state.pagination.page = 1; // Reset pagination when changing date range
    },
    setPagination: (state, action: PayloadAction<{ page: number; limit: number }>) => {
      state.pagination.page = action.payload.page;
      state.pagination.limit = action.payload.limit;
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
        state.events = action.payload.events;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(addEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.events.findIndex(event => event._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(event => event._id !== action.payload);
        state.pagination.total -= 1;
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
  setDateRange,
  setPagination,
} = eventSlice.actions;

// Enhanced selectors
export const selectAllEvents = (state: { events: EventState }) => state.events.events;
export const selectEventById = (state: { events: EventState }, eventId: string) =>
  state.events.events.find(event => event._id === eventId);

export const selectPaginationData = (state: { events: EventState }) => state.events.pagination;

export const selectFilteredEvents = (state: { events: EventState }) => {
  let filteredEvents = [...state.events.events];

  if (state.events.searchTerm) {
    const searchLower = state.events.searchTerm.toLowerCase();
    filteredEvents = filteredEvents.filter(event => 
      event.title.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower)
    );
  }

  if (state.events.filterType !== 'all') {
    filteredEvents = filteredEvents.filter(event => event.type === state.events.filterType);
  }

  if (state.events.filterStatus !== 'all') {
    filteredEvents = filteredEvents.filter(event => event.status === state.events.filterStatus);
  }

  if (state.events.dateRange.startDate) {
    filteredEvents = filteredEvents.filter(event => 
      new Date(event.startTime) >= new Date(state.events.dateRange.startDate!)
    );
  }

  if (state.events.dateRange.endDate) {
    filteredEvents = filteredEvents.filter(event => 
      new Date(event.endTime) <= new Date(state.events.dateRange.endDate!)
    );
  }

  return filteredEvents;
};

export const selectEventStats = (state: { events: EventState }) => {
  const now = new Date();
  return {
    total: state.events.events.length,
    upcoming: state.events.events.filter(event => new Date(event.startTime) > now).length,
    ongoing: state.events.events.filter(event => 
      new Date(event.startTime) <= now && new Date(event.endTime) >= now
    ).length,
    completed: state.events.events.filter(event => new Date(event.endTime) < now).length,
  };
};

export default eventSlice.reducer;