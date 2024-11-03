import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationMessage {
  title: string;
  body: string;
  url?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: NotificationMessage;
  NotificationType: string; // Flexible 'type' field to accept any notification type
  scheduledFor: string;
  isRead: boolean;
  status: 'pending' | 'sent' | 'failed' | 'read';
  recurringType: 'none' | 'daily' | 'weekly' | 'monthly';
  recurringStartDate?: string;
  recurringEndDate?: string;
  createdAt: string;
  updatedAt: string;
}


interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
};


const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
      state.loading = false;
      state.error = null;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
    },
    updateNotification(state, action: PayloadAction<Notification>) {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }
    },
    deleteNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    markAsRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
        notification.status = 'read';
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  setLoading,
  setError,
} = notificationSlice.actions;

export default notificationSlice.reducer;