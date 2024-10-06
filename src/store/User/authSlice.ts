import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profile: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
    preferences?: {
      newsletter?: boolean;
      notifications?: boolean;
    };
  };
}

interface AuthState {
  currentUser: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const handleError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data.message || error.message;
  }
  return 'An unknown error occurred';
};

export const registerUser = createAsyncThunk<
  { message: string },
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await api.post<{ message: string }>('/auth/register', userData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(handleError(error));
  }
});

export const login = createAsyncThunk<
  { message: string; success: boolean },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, thunkAPI) => {
  try {
    const response = await api.post<{ message: string; success: boolean }>('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    return thunkAPI.rejectWithValue(handleError(error));
  }
});

export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchCurrentUser',
  async (_, thunkAPI) => {
    try {
      const response = await api.get<User>('/auth/me?includeProfile=true');
      return response.data;
    } catch (error) {
      console.error('Fetch current user error:', error);
      return thunkAPI.rejectWithValue(handleError(error));
    }
  }
);

export const updateUserProfile = createAsyncThunk<
  User,
  Partial<User['profile']>,
  { rejectValue: string }
>('user/updateProfile', async (updatedProfile, thunkAPI) => {
  try {
    const response = await api.put<User>('/auth/me', { profile: updatedProfile });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(handleError(error));
  }
});

export const deleteUserProfile = createAsyncThunk<User, void, { rejectValue: string }>(
  'user/deleteProfile',
  async (_, thunkAPI) => {
    try {
      const response = await api.delete<User>('/profile');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(handleError(error));
    }
  }
);

const initialState: AuthState = {
  currentUser: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Registration failed';
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch current user';
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentUser = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update profile';
      })
      .addCase(deleteUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentUser = action.payload;
      })
      .addCase(deleteUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to delete profile';
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;