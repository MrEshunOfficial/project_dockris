// store/store.ts
import reminderReducer from "./reminderSlice";
import { configureStore } from "@reduxjs/toolkit";

import userProfileReducer from "./userProfileSlice";
import notificationReducer from "./notificationSlice";

// schedule slice imports
import todoReducer from "./scheduleSlice/todoSlice";
import eventReducer from "./scheduleSlice/eventSlice";
import routineReducer from "./scheduleSlice/routineSlice";
import appointmentsReducer from "./scheduleSlice/appointmentSlice";


export const store = configureStore({
  reducer: {
    reminder: reminderReducer,
    notifications: notificationReducer,

    // schedule slice reducers
    todos: todoReducer,
    events: eventReducer,
    routines: routineReducer,
    userProfile: userProfileReducer,
    appointments: appointmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
