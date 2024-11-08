import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

const API_BASE_URL = '/api/features/schedules/todos';

interface ITodo {
  _id: string;
  userId: string;
  dueDateTime: string | number | Date;
  title: string;
  description: string;
  priority: string;
  category: string;
  tags: string[];
  estimatedDuration: number;
  completed: boolean;
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  links: string[];
  createdAt: string;
  updatedAt: string;
}

interface TodosState {
  items: ITodo[];
  filteredItems: ITodo[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  categories: string[];
  selectedCategory: string | null;
  selectedTodo: string | null;
}

const initialState: TodosState = {
  items: [],
  filteredItems: [],
  status: 'idle',
  error: null,
  categories: [],
  selectedCategory: null,
  selectedTodo: null,
}


// Async Thunks with error handling using rejectWithValue
export const fetchTodos = createAsyncThunk('todos/fetchTodos', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data.todos;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch todos');
  }
});

export const addTodo = createAsyncThunk('todos/addTodo', async (todo: Omit<ITodo, '_id'>, { rejectWithValue }) => {
  try {
    const response = await axios.post(API_BASE_URL, todo);
    return response.data.todo;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add todo');
  }
});

export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async (todo: Partial<ITodo> & { _id: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${todo._id}`, todo);
      return response.data.todo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update todo');
    }
  }
);

// New thunk for deleting a subtask
export const deleteSubtask = createAsyncThunk(
  'todos/deleteSubtask',
  async ({ todoId, subtaskId }: { todoId: string; subtaskId: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${todoId}?subtaskId=${subtaskId}`);
      
      if (response.data.message === "Last subtask deleted. Parent todo removed.") {
        dispatch(deleteTodo(todoId));
        return { todoId, deleted: true };
      } else {
        return response.data.todo;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete subtask');
    }
  }
);

// Updated deleteTodo thunk to handle cascading deletion
export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete todo');
    }
  }
);

export const searchTodos = createAsyncThunk(
  'todos/searchTodos',
  async (searchTerm: string, { getState, rejectWithValue }) => {
    try {
      const { todos } = getState() as { todos: TodosState };
      const filteredTodos = todos.items.filter(
        (todo) =>
          Object.values(todo).some(
            (value) =>
              typeof value === 'string' &&
              value.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          todo.subtasks.some(
            (subtask) =>
              subtask.title.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          todo.tags.some(
            (tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      return filteredTodos;
    } catch (error: any) {
      return rejectWithValue('Search failed');
    }
  }
);

export const toggleTodoCompletion = createAsyncThunk(
  'todos/toggleTodoCompletion',
  async (todoId: string, { getState, dispatch }) => {
    const { todos } = getState() as { todos: TodosState };
    const todo = todos.items.find(t => t._id === todoId);
    if (!todo) throw new Error('Todo not found');
    const updatedTodo = { ...todo, completed: !todo.completed };
    return dispatch(updateTodo(updatedTodo)).unwrap();
  }
);

export const toggleSubtaskCompletion = createAsyncThunk(
  'todos/toggleSubtaskCompletion',
  async ({ todoId, subtaskId }: { todoId: string; subtaskId: string }, { getState, dispatch }) => {
    const { todos } = getState() as { todos: TodosState };
    const todo = todos.items.find(t => t._id === todoId);
    if (!todo || !todo.subtasks) throw new Error('Todo or subtask not found');
    const updatedSubtasks = todo.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const updatedTodo = { ...todo, subtasks: updatedSubtasks };
    return dispatch(updateTodo(updatedTodo)).unwrap();
  }
);

// Slice with reducers
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      state.filteredItems = action.payload
        ? state.items.filter(todo => todo.category === action.payload)
        : state.items;
    },
    setSelectedTodo: (state, action: PayloadAction<string | null>) => {
      state.selectedTodo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch todos
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodos.fulfilled, (state, action: PayloadAction<ITodo[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.filteredItems = action.payload;
        state.categories = Array.from(new Set(action.payload.map(todo => todo.category)));
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Add todo
      .addCase(addTodo.fulfilled, (state, action: PayloadAction<ITodo>) => {
        state.items.push(action.payload);
        state.filteredItems.push(action.payload);
      })

      .addCase(updateTodo.fulfilled, (state, action: PayloadAction<ITodo>) => {
        state.items = state.items.map(todo => 
          todo._id === action.payload._id ? action.payload : todo
        );
        state.filteredItems = state.filteredItems.map(todo => 
          todo._id === action.payload._id ? action.payload : todo
        );
        // Update categories if necessary
        state.categories = Array.from(new Set(state.items.map(todo => todo.category)));
      })
        // Delete subtask
        .addCase(deleteSubtask.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(deleteSubtask.fulfilled, (state, action: PayloadAction<ITodo | { todoId: string; deleted: boolean }>) => {
          state.status = 'succeeded';
          if ('deleted' in action.payload) {
            const { todoId } = action.payload;
            state.items = state.items.filter(todo => todo._id !== todoId);
            state.filteredItems = state.filteredItems.filter(todo => todo._id !== todoId);
          } else {
            const updatedTodo = action.payload as ITodo;
            const index = state.items.findIndex(todo => todo._id === updatedTodo._id);
            if (index !== -1) {
              state.items[index] = updatedTodo;
            }
            const filteredIndex = state.filteredItems.findIndex(todo => todo._id === updatedTodo._id);
            if (filteredIndex !== -1) {
              state.filteredItems[filteredIndex] = updatedTodo;
            }
          }
        })

        .addCase(deleteSubtask.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload as string;
        })
        .addCase(deleteTodo.fulfilled, (state, action: PayloadAction<string>) => {
          state.items = state.items.filter(todo => todo._id !== action.payload);
          state.filteredItems = state.filteredItems.filter(todo => todo._id !== action.payload);
        })
      .addCase(searchTodos.fulfilled, (state, action: PayloadAction<ITodo[]>) => {
        state.filteredItems = action.payload;
      })
      .addCase(toggleTodoCompletion.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(toggleTodoCompletion.fulfilled, (state, action: PayloadAction<ITodo>) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(todo => todo._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;

        const filteredIndex = state.filteredItems.findIndex(todo => todo._id === action.payload._id);
        if (filteredIndex !== -1) state.filteredItems[filteredIndex] = action.payload;
      })
      .addCase(toggleTodoCompletion.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(toggleSubtaskCompletion.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(toggleSubtaskCompletion.fulfilled, (state, action: PayloadAction<ITodo>) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(todo => todo._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;

        const filteredIndex = state.filteredItems.findIndex(todo => todo._id === action.payload._id);
        if (filteredIndex !== -1) state.filteredItems[filteredIndex] = action.payload;
      })
      .addCase(toggleSubtaskCompletion.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
      
  },
});

// Selectors
export const selectTodos = (state: { todos: TodosState }) => state.todos.items;
export const selectFilteredTodos = (state: { todos: TodosState }) => state.todos.filteredItems;
export const selectTodoById = (state: { todos: TodosState }, id: string) =>
  state.todos.items.find(todo => todo._id === id);

// Export actions and reducer
export const { setSelectedCategory, setSelectedTodo } = todosSlice.actions;
export default todosSlice.reducer;