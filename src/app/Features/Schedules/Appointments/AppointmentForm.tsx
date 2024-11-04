import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
  Link as LinkIcon,
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AppDispatch, RootState } from "@/store";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  createAppointment,
  updateAppointment,
  selectStatus,
  selectError,
} from "@/store/scheduleSlice/appointmentSlice";
import { useSession } from "next-auth/react";
import {
  Appointment,
  AppointmentFormData,
  AppointmentStatus,
  PrivacyType,
  ReminderType,
} from "@/store/type/reminderType";

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onSuccess?: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session } = useSession();
  const userId = session?.user?.id || "";
  const [links, setLinks] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    defaultValues: {
      userId,
      title: "",
      dueDateTime: new Date(),
      location: "",
      notes: "",
      attendees: { type: "individual", individuals: [] },
      reminder: { type: ReminderType.NOTIFICATION, interval: "" },
      privacy: PrivacyType.PRIVATE,
      recurring: false,
      status: AppointmentStatus.PENDING,
      links: [],
    },
  });

  const isLoading = status === "loading";

  useEffect(() => {
    if (appointment) {
      reset({
        ...appointment,
        dueDateTime: new Date(appointment.dueDateTime),
      });
      setLinks(appointment.links);
    }
  }, [appointment, reset]);

  const watchAttendeeType = watch("attendees.type");
  const watchRecurring = watch("recurring");

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      if (!userId) {
        throw new Error("User ID is not available");
      }

      const appointmentData: AppointmentFormData = {
        ...data,
        userId,
        links,
      };

      if (appointment?._id) {
        await dispatch(
          updateAppointment({ id: appointment._id, data: appointmentData })
        ).unwrap();
        toast({
          title: "Success",
          description: "Appointment updated successfully",
        });
      } else {
        await dispatch(createAppointment(appointmentData)).unwrap();
        toast({
          title: "Success",
          description: "Appointment created successfully",
        });
      }

      onSuccess?.();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to save appointment",
        variant: "destructive",
      });
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span>Title</span>
              </div>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Appointment Title" />
                )}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <Clock className="w-5 h-5 text-gray-500" />
                <span>Due Date & Time</span>
              </div>
              <Controller
                name="dueDateTime"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date | null) => field.onChange(date)} // Adjusted to allow `Date | null`
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full p-2 border rounded"
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>Location</span>
              </div>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Enter location" />
                )}
              />
              {errors.location && (
                <p className="text-red-500 text-sm">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <LinkIcon className="w-5 h-5 text-gray-500" />
                <span>Related Links</span>
              </div>
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...links];
                        newLinks[index] = e.target.value;
                        setLinks(newLinks);
                      }}
                      placeholder="Enter URL"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setLinks(links.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLinks([...links, ""])}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Link
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label>Notes</label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Add notes..." />
                )}
              />
              {errors.notes && (
                <p className="text-red-500 text-sm">{errors.notes.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <Users className="w-5 h-5 text-gray-500" />
                <span>Attendees</span>
              </div>
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
                <Controller
                  name="attendees.individuals"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      {field.value?.map((email, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={email}
                            onChange={(e) => {
                              const newEmails = [...(field.value || [])];
                              newEmails[index] = e.target.value;
                              field.onChange(newEmails);
                            }}
                            placeholder="Enter email"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newEmails = field.value?.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newEmails);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          field.onChange([...(field.value || []), ""])
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Attendee
                      </Button>
                    </div>
                  )}
                />
              )}

              {watchAttendeeType === "count" && (
                <Controller
                  name="attendees.count"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                      placeholder="Number of attendees"
                    />
                  )}
                />
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <Bell className="w-5 h-5 text-gray-500" />
                <span>Reminder</span>
              </div>
              <Controller
                name="reminder.type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reminder type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ReminderType.NOTIFICATION}>
                        Notification
                      </SelectItem>
                      <SelectItem value={ReminderType.EMAIL}>Email</SelectItem>
                      <SelectItem value={ReminderType.SMS}>SMS</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <Controller
                name="reminder.interval"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="e.g., 30 minutes before"
                    className="mt-2"
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <Lock className="w-5 h-5 text-gray-500" />
                <span>Privacy</span>
              </div>
              <Controller
                name="privacy"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value === PrivacyType.PRIVATE}
                    onCheckedChange={(checked) =>
                      field.onChange(
                        checked ? PrivacyType.PRIVATE : PrivacyType.SHARED
                      )
                    }
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <Repeat className="w-5 h-5 text-gray-500" />
                <span>Recurring</span>
              </div>
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

            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <AlertCircle className="w-5 h-5 text-gray-500" />
                <span>Status</span>
              </div>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AppointmentStatus.PENDING}>
                        Pending
                      </SelectItem>
                      <SelectItem value={AppointmentStatus.CONFIRMED}>
                        Confirmed
                      </SelectItem>
                      <SelectItem value={AppointmentStatus.CANCELLED}>
                        Cancelled
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {renderPage()}

      <div className="flex justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        {currentPage < 3 ? (
          <Button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(3, prev + 1))}
          >
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Appointment"}
          </Button>
        )}
      </div>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
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
              onClick={() => setCurrentPage((prev) => Math.min(3, prev + 1))}
              className={
                currentPage === 3 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Toaster />
    </form>
  );
};

export default AppointmentForm;
