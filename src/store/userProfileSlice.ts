import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer';
import api from '@/lib/api';

export interface IUserProfile {
  _id: string; // Mongoose Document ID
  userId: string; // Keep for backward compatibility
  email: string; // New primary identifier
  fullName: {
    firstName: string;
    lastName: string;
  };
  username: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
  occupation?: string;
  phoneNumber: string;
  country: string;
  skills: string[];
  interestsHobbies: string[];
  socialMediaLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    other?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}


// Define the shape of our state
interface UserProfileState {
  profile: IUserProfile | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: UserProfileState = {
  profile: null,
  loading: 'idle',
  error: null,
};

// Async thunks for API calls
export const fetchUserProfile = createAsyncThunk(
  'userProfile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/profileApi');
      return response.data;
    } catch (err: any) {
      console.error('Fetch profile error:', err.response?.data);
      if (err.response?.status === 401) {
        return rejectWithValue('Unauthorized: Please log in again');
      }
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

export const createUserProfile = createAsyncThunk(
  'userProfile/createUserProfile',
  async (profileData: Partial<IUserProfile>, { rejectWithValue }) => {
    try {
      const response = await api.post('/profileApi', profileData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to create profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'userProfile/updateUserProfile',
  async (profileData: Partial<IUserProfile>, { rejectWithValue }) => {
    try {
      const response = await api.put('/profileApi', profileData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update profile');
    }
  }
);

export const updateProfilePicture = createAsyncThunk(
  'userProfile/updateProfilePicture',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await api.patch('/profileApi', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (err: any) {
      console.error('API error:', err);
      return rejectWithValue(err.response?.data?.error || 'Failed to update profile picture');
    }
  }
);

export const deleteUserProfile = createAsyncThunk(
  'userProfile/deleteUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/profileApi');
      return null;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete profile');
    }
  }
);

// Create the slice
const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    resetProfileState: (state) => {
      state.profile = null;
      state.loading = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        if (action.payload === 'Unauthorized: Please log in again') {
          state.profile = null;
        }
      })
      // Create profile
      .addCase(createUserProfile.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(createUserProfile.fulfilled, (state, action: PayloadAction<IUserProfile>) => {
        state.loading = 'succeeded';
        state.profile = { ...action.payload } as WritableDraft<IUserProfile>;
    })
      .addCase(createUserProfile.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<IUserProfile>) => {
        state.loading = 'succeeded';
        state.profile = { ...action.payload } as WritableDraft<IUserProfile>;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      // Delete profile
      .addCase(deleteUserProfile.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(deleteUserProfile.fulfilled, (state) => {
        state.loading = 'succeeded';
        state.profile = null;
      })
      .addCase(deleteUserProfile.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateProfilePicture.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action: PayloadAction<{ profilePictureUrl: string }>) => {
        state.loading = 'succeeded';
        if (state.profile) {
          state.profile.profilePicture = action.payload.profilePictureUrl;
        }
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetProfileState } = userProfileSlice.actions;

export default userProfileSlice.reducer;