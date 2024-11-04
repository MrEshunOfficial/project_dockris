import React from "react";
import { useForm } from "react-hook-form";
import { format, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import { Loader2, CalendarIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EntityType, ENTITY_TYPES } from "@/constants/entityTypes";
import { ITodo } from "@/models/scheduleModel/todoModel";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { IRoutine } from "@/store/type/routine";
import { ReminderState } from "@/store/reminderSlice";
import { EventDocument } from "@/store/scheduleSlice/eventSlice";

// Helper function to safely convert various date formats to Date object
const safeParseDate = (date: string | number | Date | undefined): Date => {
  if (!date) return new Date();

  if (date instanceof Date) return date;

  if (typeof date === "string") {
    try {
      return parseISO(date);
    } catch {
      return new Date(date);
    }
  }

  if (typeof date === "number") {
    return new Date(date);
  }

  return new Date();
};

interface ReminderFormSchema {
  _id?: string;
  userId: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  isRecurring: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
  repeatUntil?: Date;
  notification: {
    enabled: boolean;
    timeBefore: number;
  };
  entityType: EntityType;
  entityId: string;
  status: "pending" | "completed" | "missed";
}

interface ReminderFormProps {
  reminder?: ReminderState;
  entityType: EntityType;
  entityId: string;
  todo?: ITodo;
  routine?: IRoutine;
  specialevent?: EventDocument;
  onSubmit: (data: Partial<ReminderState>) => Promise<void>;
}

const getEntityDateTime = (
  entityType: EntityType,
  todo?: ITodo,
  routine?: IRoutine,
  specialevent?: EventDocument
): Date => {
  switch (entityType) {
    case ENTITY_TYPES.TODO:
      return todo?.dueDateTime ? safeParseDate(todo.dueDateTime) : new Date();
    case ENTITY_TYPES.ROUTINE:
      return routine?.startTime ? safeParseDate(routine.startTime) : new Date();
    case ENTITY_TYPES.SPECIAL_EVENT:
      return specialevent?.startTime
        ? safeParseDate(specialevent.startTime)
        : new Date();
    default:
      return new Date();
  }
};

const getEntityTitle = (
  entityType: EntityType,
  todo?: ITodo,
  routine?: IRoutine,
  specialevent?: EventDocument
): string => {
  switch (entityType) {
    case ENTITY_TYPES.TODO:
      return todo?.title || "";
    case ENTITY_TYPES.ROUTINE:
      return routine?.title || "";
    case ENTITY_TYPES.SPECIAL_EVENT:
      return specialevent?.title || "";
    default:
      return "";
  }
};

const getEntityDescription = (
  entityType: EntityType,
  todo?: ITodo,
  routine?: IRoutine,
  specialevent?: EventDocument
): string => {
  switch (entityType) {
    case ENTITY_TYPES.TODO:
      return todo?.description || "";
    case ENTITY_TYPES.ROUTINE:
      return routine?.description || "";
    case ENTITY_TYPES.SPECIAL_EVENT:
      return specialevent?.description || "";
    default:
      return "";
  }
};

export function ReminderForm({
  reminder,
  entityType,
  entityId,
  todo,
  routine,
  specialevent,
  onSubmit,
}: ReminderFormProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues: ReminderFormSchema = {
    _id: reminder?._id ? (reminder._id as string) : undefined,
    userId: userId || "",
    title:
      reminder?.title ||
      getEntityTitle(entityType, todo, routine, specialevent),
    description:
      reminder?.description ||
      getEntityDescription(entityType, todo, routine, specialevent),
    date: reminder?.date
      ? safeParseDate(reminder.date)
      : getEntityDateTime(entityType, todo, routine, specialevent),
    time:
      reminder?.time ||
      format(
        getEntityDateTime(entityType, todo, routine, specialevent),
        "HH:mm"
      ),
    isRecurring: reminder?.isRecurring || false,
    recurrencePattern: reminder?.recurrencePattern,
    repeatUntil: reminder?.repeatUntil
      ? safeParseDate(reminder.repeatUntil)
      : undefined,
    notification: {
      enabled: reminder?.notification?.enabled ?? true,
      timeBefore: reminder?.notification?.timeBefore ?? 15,
    },
    entityType: entityType,
    entityId: entityId,
    status: reminder?.status || "pending",
  };

  const form = useForm<ReminderFormSchema>({
    defaultValues,
  });

  const handleSubmit = async (data: ReminderFormSchema) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is not available",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reminderData: Partial<ReminderState> = {
        ...data,
        _id: reminder?._id,
        userId,
        date: format(data.date, "yyyy-MM-dd"),
        repeatUntil: data.repeatUntil
          ? format(data.repeatUntil, "yyyy-MM-dd")
          : undefined,
        entityType,
        entityId,
        createdBy: userId,
      };

      await onSubmit(reminderData);

      toast({
        title: "Success",
        description: `Reminder ${
          reminder?._id ? "updated" : "created"
        } successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full p-4 flex flex-col items-center"
      >
        <div className="w-3/5 flex items-center justify-center gap-4 mb-3 p-2">
          <div className="flex-1 flex flex-col gap-2 border p-2 rounded-md dark:border-gray-600 border-gray-300">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            } dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Time
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="time"
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 dark:border-gray-600">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-gray-700 dark:text-gray-300">
                      Recurring Reminder
                    </FormLabel>
                    <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                      Set this reminder to repeat on a schedule
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="dark:bg-gray-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1 flex flex-col gap-2 border p-2 rounded-md dark:border-gray-600 border-gray-300">
            {form.watch("isRecurring") && (
              <>
                <FormField
                  control={form.control}
                  name="recurrencePattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Recurrence Pattern
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select a pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-gray-800">
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repeatUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Repeat Until
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              } dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick an end date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="notification.enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 dark:border-gray-600">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-gray-700 dark:text-gray-300">
                      Enable Notification
                    </FormLabel>
                    <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                      Receive a notification for this reminder
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="dark:bg-gray-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("notification.enabled") && (
              <FormField
                control={form.control}
                name="notification.timeBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notification Time (minutes before)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out dark:bg-blue-600 dark:hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {reminder && reminder._id ? "Update Reminder" : "Create Reminder"}
          </Button>
        </div>
      </form>
      <Toaster />
    </Form>
  );
}

export default ReminderForm;
