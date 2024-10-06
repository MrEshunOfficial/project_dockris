import { configureStore } from "@reduxjs/toolkit";
import todosReducer from "./schedule/todoSlice";

import authReducer from "./User/authSlice";
// schedule reducers
import routineReducer from "./schedule/routineSlice";
import appointmentsReducer from "./schedule/appointmentSlice";
import eventReducer from "./schedule/eventSlice";

//finance reducers
import incomeReducer from "./finances/incomeSlice";
import expenseReducer from "./finances/expenseSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
    events: eventReducer,
    income: incomeReducer,
    expenses: expenseReducer,
    routines: routineReducer,
    appointments: appointmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
