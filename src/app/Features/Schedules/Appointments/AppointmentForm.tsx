import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Bell,
  Lock,
  Repeat,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  createAppointment,
  updateAppointment,
  selectStatus,
  selectError,
  AppointmentStatus,
  PrivacyType,
  ReminderType,
  selectRecurringAppointments,
  Appointment,
} from "@/store/schedule/appointmentSlice";
import { AppDispatch, RootState } from "@/store";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const appointmentSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),
    start: z.date(),
    end: z.date(),
    location: z
      .string()
      .min(1, "Location is required")
      .max(255, "Location must be less than 255 characters"),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional(),
    attendees: z.object({
      type: z.enum(["individual", "count"]),
      individuals: z
        .array(z.string().email("Invalid email address"))
        .optional(),
      count: z
        .number()
        .min(1, "Attendee count must be a positive number")
        .optional(),
    }),
    reminder: z.object({
      type: z.enum(["notification", "email", "sms"]),
      interval: z
        .string()
        .min(1, "Reminder interval is required")
        .max(50, "Interval must be less than 50 characters"),
    }),
    privacy: z.enum(["private", "shared"]),
    recurring: z.boolean().default(false),
    recurrencePattern: z
      .enum(["daily", "weekly", "monthly", "yearly"])
      .optional(),
    status: z.enum(["Pending", "Confirmed", "Cancelled"]).default("Pending"),
    userId: z.string().min(1, "User ID is required"),
  })
  .refine((data) => data.start < data.end, {
    message: "Start date must be before the end date",
    path: ["end"],
  });

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onSuccess?: () => void;
}

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector((state: RootState) => selectStatus(state));
  const error = useSelector((state: RootState) => selectError(state));
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const userId = currentUser?.id || "";

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    defaultValues: {
      title: "",
      start: new Date(),
      end: new Date(),
      location: "",
      description: "",
      attendees: { type: "individual", individuals: [] },
      reminder: { type: "notification", interval: "" },
      privacy: "private",
      recurring: false,
      status: "Pending",
      userId: userId,
    },
  });

  const isLoading = status === "loading";

  useEffect(() => {
    if (appointment) {
      console.log("Appointment data:", appointment); // For debugging
      reset({
        ...appointment,
        start: ensureDate(appointment.start),
        end: ensureDate(appointment.end),
      });
    }
  }, [appointment, reset]);

  const ensureDate = (dateValue: string | number | Date): Date => {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    const parsedDate = new Date(dateValue);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  };

  const watchAttendeeType = watch("attendees.type");
  const { fields, append, remove } = useFieldArray({
    control,
    name: "attendees.individuals",
  });

  const watchRecurring = watch("recurring");

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      if (!userId) {
        throw new Error("User ID is not available");
      }
      const appointmentData = {
        ...data,
        userId: userId,
      };

      if (appointment) {
        await dispatch(
          updateAppointment({ id: appointment._id, data: appointmentData })
        ).unwrap();
        toast({
          title: "Appointment Updated successfully",
          description: "Your appointment has been updated successfully",
          duration: 3000,
        });
      } else {
        await dispatch(createAppointment(appointmentData)).unwrap();
        toast({
          title: "Appointment Added successfully",
          description: "Your appointment has been successfully added.",
          duration: 3000,
        });
      }
      reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Failed to add/update appointment:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to add/update appointment. Please try again.",
        duration: 3000,
        variant: "destructive",
      });
    }
  };
  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <>
            <div className="space-y-4">
              <div className="flex flex-col items-start gap-2">
                <div className="flex gap-2 items-center">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <p className="leading-7">Title</p>
                </div>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Appointment Title"
                      className="flex-grow focus:outline-none"
                    />
                  )}
                />
              </div>
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}

              <div className="w-full flex flex-col items-start space-y-2">
                <div className="flex gap-2 items-center">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <p className="leading-7">Start Date & Time</p>
                </div>
                <Controller
                  name="start"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date | null) => field.onChange(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-[22.5rem] p-2 border rounded"
                      placeholderText="Start Date & Time"
                    />
                  )}
                />
              </div>
              {errors.start && (
                <p className="text-red-500 text-sm">{errors.start.message}</p>
              )}

              <div className="w-full flex-col items-start space-y-2">
                <div className="flex gap-2 items-center">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <p className="leading-7">End Date & Time</p>
                </div>
                <Controller
                  name="end"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date | null) => field.onChange(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-[22.5rem] p-2 border rounded"
                      placeholderText="End Date & Time"
                    />
                  )}
                />
              </div>
              {errors.end && (
                <p className="text-red-500 text-sm">{errors.end.message}</p>
              )}

              <div className="flex flex-col items-start space-y-2">
                <div className="flex gap-2 items-center">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <p className="leading-7">Venue</p>
                </div>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Location"
                      className="flex-grow"
                    />
                  )}
                />
              </div>
              {errors.location && (
                <p className="text-red-500 text-sm">
                  {errors.location.message}
                </p>
              )}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="space-y-4">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Description (optional)"
                    className="w-full"
                  />
                )}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span>Attendees</span>
                </label>
                <Controller
                  name="attendees.type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select attendee type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="count">Count</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {watchAttendeeType === "individual" && (
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center space-x-2"
                      >
                        <Controller
                          name={`attendees.individuals.${index}`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Enter email address"
                              className="flex-grow"
                            />
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append("")}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Attendee
                    </Button>
                  </div>
                )}
                {watchAttendeeType === "count" && (
                  <Controller
                    name="attendees.count"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        placeholder="Number of attendees"
                      />
                    )}
                  />
                )}
              </div>
              {errors.attendees?.count && (
                <p className="text-red-500 text-sm">
                  {errors.attendees.count.message}
                </p>
              )}
              {errors.attendees?.individuals && (
                <p className="text-red-500 text-sm">
                  {errors.attendees.individuals.message}
                </p>
              )}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Set Reminder</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Reminder</h4>
                      <p className="text-sm text-muted-foreground">
                        Set up your reminder preferences.
                      </p>
                    </div>
                    <div className="w-full grid gap-2">
                      <div className="w-full flex items-center justify-between gap-2">
                        <Controller
                          name="reminder.type"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Reminder type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="notification">
                                  Notification
                                </SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <Controller
                          name="reminder.interval"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="reminder-interval"
                              placeholder="e.g., 30 minutes before"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-gray-500" />
                  <span>Privacy</span>
                </label>
                <Controller
                  name="privacy"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value === "private"}
                      onCheckedChange={(checked: any) =>
                        field.onChange(() => {
                          if (checked) field.onChange("private");
                          else field.onChange("public");
                        })
                      }
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <Repeat className="w-5 h-5 text-gray-500" />
                  <span>Recurring</span>
                </label>
                <Controller
                  name="recurring"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {watchRecurring && (
                <Controller
                  name="recurrencePattern"
                  control={control}
                  rules={{
                    required:
                      "Recurrence pattern is required when recurring is enabled",
                  }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recurrence pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              {errors.recurrencePattern && (
                <p className="text-red-500 text-sm">
                  {errors.recurrencePattern.message}
                </p>
              )}

              {watchRecurring && (
                <div className="mt-2 p-2 rounded">
                  <p className="text-sm font-medium">Recurrence Preview:</p>
                  <p className="text-sm">
                    This appointment will repeat {watch("recurrencePattern")}{" "}
                    starting from {watch("start")?.toLocaleDateString()}
                  </p>
                </div>
              )}

              <Popover>
                <PopoverTrigger asChild className="w-3/4">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    <span>Set Status</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 border-none w-[22.5rem]">
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div
        className="p-2 rounded-lg"
        style={{ height: "400px", overflowY: "auto" }}
      >
        {renderPage()}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="cursor-pointer"
            />
          </PaginationItem>
          {[1, 2, 3].map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, 3))}
              disabled={currentPage === 3}
              className="cursor-pointer"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="w-full flex items-center">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : appointment ? "Update" : "Create"}
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Toaster />
    </form>
  );
};

export default AppointmentForm;
