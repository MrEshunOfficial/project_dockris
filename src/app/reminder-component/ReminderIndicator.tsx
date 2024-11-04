import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  BellRing,
  Clock,
  Calendar,
  RefreshCw,
  Trash2,
  Edit2,
  Loader2,
  AlertTriangle,
  BellOff,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EntityType, ENTITY_TYPES } from "@/constants/entityTypes";
import { ReminderForm } from "@/app/reminder-component/ReminderForm";
import moment from "moment";
import { ITodo } from "@/models/scheduleModel/todoModel";
import { IAppointment } from "@/models/scheduleModel/appointmentModel";
import { AppDispatch, RootState } from "@/store";
import {
  fetchRemindersByEntity,
  selectRemindersByEntity,
  deleteReminder,
  selectReminderStatus,
  selectReminderError,
  updateReminder,
  addReminder,
  ReminderState,
} from "@/store/reminderSlice";
import { usePushNotifications } from "@/hooks/useNotification";
import { IRoutine } from "@/store/type/routine";
import { EventDocument } from "@/store/scheduleSlice/eventSlice";

interface TodoReminderProps {
  todo: ITodo;
  reminder?: ReminderState;
}

interface RoutineReminderProps {
  routine: IRoutine;
  reminder?: ReminderState;
}

interface AppointmentReminderProps {
  appointment: IAppointment;
  reminder?: ReminderState;
}

interface EventsReminderProps {
  specialevent: EventDocument;
  reminder?: ReminderState;
}

type ReminderIndicatorProps =
  | TodoReminderProps
  | RoutineReminderProps
  | AppointmentReminderProps
  | EventsReminderProps;

const getEntityInfo = (props: ReminderIndicatorProps) => {
  if ("todo" in props) {
    return {
      entityType: ENTITY_TYPES.TODO as EntityType,
      entityId: props.todo._id,
      entity: props.todo,
      title: props.todo.title,
      description: props.todo.description,
      existingReminder: props.reminder,
    };
  }
  if ("routine" in props) {
    return {
      entityType: ENTITY_TYPES.ROUTINE as EntityType,
      entityId: props.routine._id,
      entity: props.routine,
      title: props.routine.title,
      description: props.routine.description,
      existingReminder: props.reminder,
    };
  }
  if ("appointment" in props) {
    return {
      entityType: ENTITY_TYPES.APPOINTMENT as EntityType,
      entityId: props.appointment._id,
      entity: props.appointment,
      title: props.appointment.title,
      description: props.appointment.notes,
      existingReminder: props.reminder,
    };
  }
  if ("specialevent" in props) {
    return {
      entityType: ENTITY_TYPES.SPECIAL_EVENT as EntityType,
      entityId: props.specialevent._id,
      entity: props.specialevent,
      title: props.specialevent.title,
      description: props.specialevent.description,
      existingReminder: props.reminder,
    };
  }
  throw new Error("Invalid entity type provided");
};

const ReminderIndicator: React.FC<ReminderIndicatorProps> = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    entityType,
    entityId,
    entity,
    title: entityTitle,
  } = getEntityInfo(props);

  const reminders = useSelector((state: RootState) =>
    selectRemindersByEntity(state, entityType, entityId)
  );

  const reminderStatus = useSelector(selectReminderStatus);
  const reminderError = useSelector(selectReminderError);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const {
    permission,
    isSupported,
    requestPermission,
    scheduleNotification,
    getStoredReminders,
    clearStoredReminders,
    registerPeriodicSync,
  } = usePushNotifications({
    onPermissionChange: (newPermission) => {
      if (newPermission === "granted") {
        setShowPermissionAlert(false);
      }
    },
    onError: (error) => {
      console.error("Push notification error:", error);
    },
  });

  useEffect(() => {
    dispatch(
      fetchRemindersByEntity({
        entityType,
        entityId,
      })
    );
  }, [dispatch, entityId, reminderStatus, entityType]);

  const initializeNotifications = useCallback(async () => {
    if (isSupported) {
      try {
        if (permission === "granted") {
          await registerPeriodicSync();
          await getStoredReminders();
        } else if (permission !== "default") {
          setShowPermissionAlert(true);
        }
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    }
  }, [isSupported, permission, registerPeriodicSync, getStoredReminders]);

  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await clearStoredReminders();
      await getStoredReminders();
      await dispatch(
        fetchRemindersByEntity({
          entityType,
          entityId,
        })
      );
      for (const reminder of reminders) {
        await scheduleNotification(reminder);
      }
    } catch (error) {
      console.error("Error during manual sync:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    await dispatch(deleteReminder(reminderId));
    await clearStoredReminders();
    dispatch(
      fetchRemindersByEntity({
        entityType,
        entityId,
      })
    );
  };

  const handleSubmitReminder = async (reminderData: Partial<ReminderState>) => {
    try {
      if (!isSupported) {
        throw new Error("Push notifications are not supported in this browser");
      }

      if (permission !== "granted") {
        setShowPermissionAlert(true);
        await requestPermission();
      }

      const notificationSettings = {
        enabled: true,
        timeBefore: reminderData.notification?.timeBefore || 5,
      };

      const reminderDateTime = moment(
        `${reminderData.date} ${reminderData.time}`,
        "YYYY-MM-DD HH:mm"
      );
      const notificationDateTime = reminderDateTime
        .clone()
        .subtract(notificationSettings.timeBefore, "minutes");

      const reminderWithNotification: ReminderState = {
        ...reminderData,
        notification: {
          ...notificationSettings,
          notificationDate: notificationDateTime.format("YYYY-MM-DD"),
          notificationTime: notificationDateTime.format("HH:mm"),
        },
        title: `Reminder: ${entityTitle}`,
        description: `Due in ${notificationSettings.timeBefore} minutes: ${entityTitle}`,
        entityType,
        entityId,
      } as ReminderState;

      if (reminderData._id) {
        await dispatch(updateReminder(reminderWithNotification)).unwrap();
      } else {
        await dispatch(addReminder(reminderWithNotification)).unwrap();
      }

      await scheduleNotification(reminderWithNotification);

      setIsDrawerOpen(false);
      setIsEditDrawerOpen(false);
      dispatch(
        fetchRemindersByEntity({
          entityType,
          entityId,
        })
      );
    } catch (error) {
      console.error("Failed to save reminder:", error);
    }
  };

  const renderNotificationStatus = () => {
    if (!isSupported) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex items-center">
            <BellOff className="mr-2" size={18} />
            Push notifications are not supported in this browser
          </AlertDescription>
        </Alert>
      );
    }

    if (permission === "denied") {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex items-center">
            <BellOff className="mr-2" size={18} />
            Push notifications are blocked. Please enable them in your browser
            settings.
          </AlertDescription>
        </Alert>
      );
    }

    if (showPermissionAlert && permission === "default") {
      return (
        <Alert variant="default" className="mb-4">
          <AlertDescription className="flex items-center justify-between">
            <span>Please allow notifications to receive reminders.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => requestPermission()}
            >
              Enable Notifications
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  const renderReminderDetails = (reminder: ReminderState) => {
    const reminderDateTime = moment(
      `${reminder.date} ${reminder.time}`,
      "YYYY-MM-DD HH:mm"
    );
    const notificationDateTime = reminderDateTime
      .clone()
      .subtract(reminder.notification?.timeBefore || 0, "minutes");

    return (
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <p className="flex items-center">
          <Calendar className="mr-2 text-blue-500" size={16} />
          {reminderDateTime.format("MMM D, YYYY")}
        </p>
        <p className="flex items-center">
          <Clock className="mr-2 text-yellow-500" size={16} />
          Due at: {reminderDateTime.format("h:mm A")}
        </p>
        {reminder.notification?.enabled && (
          <>
            <p className="flex items-center">
              <Bell className="mr-2 text-red-500" size={16} />
              Notify: {reminder.notification.timeBefore} mins before
            </p>
            <p className="flex items-center text-xs">
              <Clock className="mr-2 text-green-500" size={14} />
              Notifies at: {notificationDateTime.format("h:mm A")}
            </p>
          </>
        )}
        {reminder.isRecurring && reminder.recurrencePattern && (
          <p className="flex items-center">
            <RefreshCw className="mr-2 text-purple-500" size={16} />
            Repeats: {reminder.recurrencePattern}
          </p>
        )}
      </div>
    );
  };

  if (reminderStatus === "loading") {
    return (
      <div className="flex items-center text-gray-500">
        <Loader2 className="animate-spin mr-2" size={18} />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (reminderStatus === "failed") {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center">
          <AlertTriangle className="mr-2" size={18} />
          <span className="text-sm">Error: {reminderError}</span>
        </AlertDescription>
      </Alert>
    );
  }

  const reminder = reminders[0];

  if (reminders.length === 0) {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <Bell size={18} className="mr-2" />
            <span className="text-xs">Add reminder</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold">
              Set a Reminder
            </DrawerTitle>
            <DrawerDescription>{entityTitle}</DrawerDescription>
          </DrawerHeader>
          {renderNotificationStatus()}
          <ReminderForm
            entityType={entityType}
            entityId={entityId}
            todo={"todo" in props ? props.todo : undefined}
            routine={"routine" in props ? props.routine : undefined}
            specialevent={
              "specialevent" in props ? props.specialevent : undefined
            }
            appointment={"appointment" in props ? props.appointment : undefined}
            onSubmit={handleSubmitReminder}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  const reminderDateTime = moment(
    `${reminder.date} ${reminder.time}`,
    "YYYY-MM-DD HH:mm"
  );
  const notificationDateTime = reminderDateTime
    .clone()
    .subtract(reminder.notification?.timeBefore || 0, "minutes");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
        >
          <BellRing size={18} className="mr-2 text-yellow-500" />
          {reminder.notification?.enabled ? (
            <span className="text-xs font-medium">
              Remind me @ {notificationDateTime.format("h:mm A")}
            </span>
          ) : (
            <span className="text-xs font-medium">
              Remind me @ {reminderDateTime.format("h:mm A")}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-max p-4 rounded-lg mt-2 border-gray-300 dark:border-gray-700">
        <div className="space-y-4">
          <h2 className="w-max scroll-m-20 border-b pb-2 font-semibold tracking-tight first:mt-0">
            Reminder Details
          </h2>
          {renderReminderDetails(reminder)}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="icon"
              className="flex items-center justify-center rounded-full"
              onClick={handleSyncNow}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="animate-spin text-green-500" size={16} />
              ) : (
                <RotateCw className="text-purple-500" size={16} />
              )}
            </Button>
            <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="flex items-center justify-center rounded-full"
                >
                  <Edit2 className="text-blue-500" size={16} />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="text-xl font-bold">
                    Edit Reminder
                  </DrawerTitle>
                  <DrawerDescription>{entityTitle}</DrawerDescription>
                </DrawerHeader>
                {renderNotificationStatus()}
                <ReminderForm
                  entityType={entityType}
                  entityId={entity._id}
                  reminder={reminder}
                  todo={
                    entityType === ENTITY_TYPES.TODO
                      ? (entity as ITodo)
                      : undefined
                  }
                  routine={
                    entityType === ENTITY_TYPES.ROUTINE
                      ? (entity as IRoutine)
                      : undefined
                  }
                  appointment={
                    entityType === ENTITY_TYPES.APPOINTMENT
                      ? (entity as IAppointment)
                      : undefined
                  }
                  onSubmit={handleSubmitReminder}
                />
              </DrawerContent>
            </Drawer>
            <Button
              variant="outline"
              size="icon"
              className="flex items-center justify-center rounded-full"
              onClick={() => handleDeleteReminder(reminder._id)}
            >
              <Trash2 className="text-red-500" size={16} />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReminderIndicator;
