import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSelector } from 'reselect';
import { handleAxiosError } from '@/lib/axios';
import { ExpenseDocument } from '@/models/financeModel/expenseModel';

interface ExpenseState {
  expenses: ExpenseDocument[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  sortBy: keyof ExpenseDocument | null;
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
  selectedCategory: string | null;
  upcomingRecurringExpenses: ExpenseDocument[];
}

const initialState: ExpenseState = {
  expenses: [],
  status: 'idle',
  error: null,
  sortBy: null,
  sortOrder: 'asc',
  searchTerm: '',
  selectedCategory: null,
  upcomingRecurringExpenses: [],
};

const BASE_API_URL = '/api/features/financial/expenses'

export const fetchExpenses = createAsyncThunk('expenses/fetchExpenses', async () => {
  try {
    const response = await axios.get(BASE_API_URL);
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
});

export const addExpense = createAsyncThunk('expenses/addExpense', async (expense: Partial<ExpenseDocument>) => {
  try {
    const response = await axios.post(BASE_API_URL, expense);
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
});

export const updateExpense = createAsyncThunk('expenses/updateExpense', async (expense: Partial<ExpenseDocument>) => {
  try {
    const response = await axios.put(`${BASE_API_URL}/${expense._id}`, expense);
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
});

export const deleteExpense = createAsyncThunk('expenses/deleteExpense', async (id: string) => {
  try {
    await axios.delete(`${BASE_API_URL}/${id}`);
    return id;
  } catch (error) {
    return handleAxiosError(error);
  }
});


const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setSortBy: (state, action: PayloadAction<keyof ExpenseDocument>) => {
      if (state.sortBy === action.payload) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = action.payload;
        state.sortOrder = 'asc';
      }
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch expenses';
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e._id !== action.payload);
      })
      // .addCase(fetchUpcomingRecurringExpenses.fulfilled, (state, action) => {
      //   state.upcomingRecurringExpenses = action.payload;
      // });
  },
});

export const { setSortBy, setSearchTerm, setSelectedCategory } = expenseSlice.actions;

// Selectors
const selectExpenses = (state: { expenses: ExpenseState }) => state.expenses.expenses;
const selectSortBy = (state: { expenses: ExpenseState }) => state.expenses.sortBy;
const selectSortOrder = (state: { expenses: ExpenseState }) => state.expenses.sortOrder;
const selectSearchTerm = (state: { expenses: ExpenseState }) => state.expenses.searchTerm;
const selectSelectedCategory = (state: { expenses: ExpenseState }) => state.expenses.selectedCategory;

export const selectFilteredAndSortedExpenses = createSelector(
  [selectExpenses, selectSortBy, selectSortOrder, selectSearchTerm, selectSelectedCategory],
  (expenses, sortBy, sortOrder, searchTerm, selectedCategory) => {
    let filteredExpenses = expenses;

    // Filter by search term
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filteredExpenses = filteredExpenses.filter(expense =>
        expense.name.toLowerCase().includes(lowercasedSearchTerm) ||
        expense.vendor.toLowerCase().includes(lowercasedSearchTerm) ||
        expense.description?.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filteredExpenses = filteredExpenses.filter(expense => expense.category === selectedCategory);
    }

    // Sort expenses
    if (sortBy) {
      filteredExpenses.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredExpenses;
  }
);

// New selector for upcoming recurring expenses
export const selectUpcomingRecurringExpenses = createSelector(
  [selectExpenses],
  (expenses) => {
    const today = new Date();
    const oneMonthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    return expenses.filter(expense => 
      expense.recurringExpense && 
      expense.dateSpent >= today && 
      expense.dateSpent <= oneMonthFromNow
    );
  }
);
export default expenseSlice.reducer;



