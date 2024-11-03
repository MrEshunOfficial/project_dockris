import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  CheckCircle2,
  Calendar,
  ListTodo,
  RefreshCw,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { markAsRead, setNotifications } from "@/store/notificationSlice";
import { RootState, AppDispatch } from "@/store";

// Types
interface Notification {
  id: string;
  NotificationType: string;
  message: {
    title: string;
    body: string;
  };
  scheduledFor: string;
  isRead: boolean;
}

interface FilterOption {
  value: string;
  label: string;
  icon?: React.ElementType;
}

// Filter options array
const filterOptions: FilterOption[] = [
  { value: "all", label: "All", icon: Bell },
  { value: "unread", label: "Unread", icon: Bell },
  { value: "read", label: "Read", icon: CheckCircle2 },
  { value: "todo", label: "Todo", icon: ListTodo },
  { value: "appointment", label: "Appointment", icon: Calendar },
  { value: "general", label: "General", icon: Bell },
];

// Components
const NotificationIcon: React.FC<{
  type: Notification["NotificationType"];
}> = ({ type }) => {
  const icons: { [key: string]: React.ElementType } = {
    todo: ListTodo,
    appointment: Calendar,
    general: Bell,
  };
  const Icon = icons[type] || Bell;
  return <Icon className="h-5 w-5 text-primary-500" />;
};

const NotificationCard: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onMarkAsRead }) => (
  <Card className="mb-4 shadow-lg transition-shadow duration-300 rounded-md border-none p-4 bg-white dark:bg-gray-800">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="flex items-center space-x-2">
        <NotificationIcon type={notification.NotificationType} />
        <CardTitle className="text-md font-semibold text-primary-700 dark:text-primary-300">
          {notification.message.title}
        </CardTitle>
      </div>
      <Badge
        variant={notification.isRead ? "secondary" : "default"}
        className={notification.isRead ? "" : "animate-pulse"}
      >
        {notification.isRead ? "Read" : "New"}
      </Badge>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        {notification.message.body}
      </p>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{format(new Date(notification.scheduledFor), "PPp")}</span>
        {!notification.isRead && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkAsRead(notification.id)}
            className="hover:bg-green-100 hover:text-green-700 transition-colors duration-300"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as read
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Hooks
const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications
  );
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notificationApi");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data: Notification[] = await response.json();
      dispatch(setNotifications(data));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Here you might want to dispatch an action to set an error state
    }
  }, [dispatch]);
  const markNotificationAsRead = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/notifications/${id}/read`, {
          method: "PUT",
        });
        if (!response.ok)
          throw new Error("Failed to mark notification as read");
        dispatch(markAsRead(id));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        // Here you might want to dispatch an action to set an error state
      }
    },
    [dispatch]
  );
  return { notifications, fetchNotifications, markNotificationAsRead };
};

// Main component
const NotificationUi: React.FC = () => {
  const { notifications, fetchNotifications, markNotificationAsRead } =
    useNotifications();
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return notification.NotificationType === filter;
  });

  return (
    <div className="w-full p-4">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-300">
          Notifications
        </h1>
        <Button
          variant="ghost"
          onClick={fetchNotifications}
          className="flex items-center text-sm text-primary-600 dark:text-primary-400"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full mb-4">
            <Filter className="mr-2 h-4 w-4 text-primary-600 dark:text-primary-400" />
            Filter:{" "}
            {filterOptions.find((option) => option.value === filter)?.label ||
              "All"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="grid gap-4 p-4">
            <h4 className="font-medium leading-none">Filter Notifications</h4>
            <div className="grid gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => setFilter(option.value)}
                >
                  {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <ScrollArea className="h-[600px] rounded-md border border-gray-300 dark:border-gray-800 p-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No notifications to display
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markNotificationAsRead}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationUi;
