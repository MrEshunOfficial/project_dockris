import { handleAxiosError } from '@/lib/axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSelector } from 'reselect';

// Define the Income interface to match your model
export interface Income {
  _id: string;
  userId: string;
  name: string;
  sources: string;
  amount: number;
  dateReceived: string;
  recurringIncome: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  description?: string;
  currency?: string;
  category?: string;
  tags?: string[];
  isTaxable?: boolean;
  taxDeductions?: number;
  netAmount?: number;
  paymentMethod?: 'cash' | 'bank_transfer' | 'cheque' | 'other';
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// Income slice state
interface IncomeState {
  incomes: Income[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchTerm: string;
  sortBy: keyof Income;
  sortOrder: 'asc' | 'desc';
  filters: Partial<Income>;
}

const initialState: IncomeState = {
  incomes: [],
  status: 'idle',
  error: null,
  searchTerm: '',
  sortBy: 'dateReceived',
  sortOrder: 'desc',
  filters: {},
};

// API base URL
const API_BASE_URL = '/api/features/financial/income';

// Updated async thunks
export const fetchIncomes = createAsyncThunk<Income[], void, { rejectValue: string }>(
  'income/fetchIncomes',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get<{ success: boolean; data: Income[] }>(API_BASE_URL);
      if (response.data.success) {
        return response.data.data;
      } else {
        return thunkAPI.rejectWithValue('Failed to fetch incomes');
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(handleAxiosError(error));
    }
  }
);

export const addIncome = createAsyncThunk<Income, Omit<Income, '_id' | 'createdAt' | 'updatedAt'>, { rejectValue: string }>(
  'income/addIncome',
  async (income, thunkAPI) => {
    try {
      const response = await axios.post<{ success: boolean; data: Income }>(API_BASE_URL, income);
      if (response.data.success) {
        return response.data.data;
      } else {
        return thunkAPI.rejectWithValue('Failed to add income');
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(handleAxiosError(error));
    }
  }
);

export const updateIncome = createAsyncThunk<Income, Partial<Income> & { _id: string }, { rejectValue: string }>(
  'income/updateIncome',
  async (income, thunkAPI) => {
    try {
      const response = await axios.put<{ success: boolean; data: Income }>(`${API_BASE_URL}/${income._id}`, income);
      if (response.data.success) {
        return response.data.data;
      } else {
        return thunkAPI.rejectWithValue('Failed to update income');
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(handleAxiosError(error));
    }
  }
);

export const deleteIncome = createAsyncThunk<string, string, { rejectValue: string }>(
  'income/deleteIncome',
  async (id, thunkAPI) => {
    try {
      const response = await axios.delete<{ success: boolean }>(`${API_BASE_URL}/${id}`);
      if (response.data.success) {
        return id;
      } else {
        return thunkAPI.rejectWithValue('Failed to delete income');
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(handleAxiosError(error));
    }
  }
);

// Redux slice
const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSortBy: (state, action: PayloadAction<keyof Income>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    setFilter: (state, action: PayloadAction<Partial<Income>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncomes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchIncomes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.incomes = action.payload;
      })
      .addCase(fetchIncomes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch incomes';
      })
      .addCase(addIncome.fulfilled, (state, action) => {
        state.incomes.push(action.payload);
      })
      .addCase(updateIncome.fulfilled, (state, action) => {
        const index = state.incomes.findIndex(income => income._id === action.payload._id);
        if (index !== -1) {
          state.incomes[index] = action.payload;
        }
      })
      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.incomes = state.incomes.filter(income => income._id !== action.payload);
      });
  },
});

export const { setSearchTerm, setSortBy, setSortOrder, setFilter, clearFilters } = incomeSlice.actions;

export default incomeSlice.reducer;

// Selectors
export const selectAllIncomes = (state: { income: IncomeState }) => state.income.incomes;
export const selectIncomeStatus = (state: { income: IncomeState }) => state.income.status;
export const selectIncomeError = (state: { income: IncomeState }) => state.income.error;

export const selectFilteredAndSortedIncomes = createSelector(
  [selectAllIncomes, (state: { income: IncomeState }) => state.income],
  (incomes, incomeState) => {
    const { searchTerm, sortBy, sortOrder, filters } = incomeState;

    if (!Array.isArray(incomes)) {
      console.error('Incomes is not an array:', incomes);
      return [];
    }

    let filteredIncomes = incomes.filter(income => {
      if (searchTerm && !income.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      for (const [key, value] of Object.entries(filters)) {
        if (income[key as keyof Income] !== value) {
          return false;
        }
      }
      return true;
    });

    filteredIncomes.sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      if (valueA === valueB) return 0;
      if (valueA === undefined) return 1;
      if (valueB === undefined) return -1;
      return sortOrder === 'asc' 
        ? (valueA < valueB ? -1 : 1)
        : (valueA > valueB ? -1 : 1);
    });

    return filteredIncomes;
  }
);

export const selectTotalIncome = createSelector(
  [selectAllIncomes],
  (incomes) => {
    if (!Array.isArray(incomes)) {
      console.error('Incomes is not an array:', incomes);
      return 0;
    }
    
    return incomes.reduce((total, income) => total + income.amount, 0);
  }
);