import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Link,
  Loader2,
  Tag,
  DollarSign,
  Globe,
  VideoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import {
  addEvent,
  updateEvent,
  eventTypes,
  eventStatuses,
  EventDocument,
} from "@/store/scheduleSlice/eventSlice";

const defaultEventValues = {
  status: "pending",
  startTime: new Date(),
  endTime: new Date(),
  isPublic: true,
  type: "conference",
  tags: [],
  categories: [],
  eventLinks: [],
  registeredAttendees: 0,
  capacity: null,
};

interface EventFormProps {
  event?: EventDocument;
  onSubmit?: (data: EventDocument) => void;
  onCancel?: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const form = useForm({
    defaultValues: {
      ...defaultEventValues,
      ...event,
      startTime: event ? new Date(event.startTime) : new Date(),
      endTime: event ? new Date(event.endTime) : new Date(),
    },
  });

  useEffect(() => {
    if (userId) {
      form.setValue("userId", userId);
    }
  }, [userId, form]);

  const validateForm = async (data: any) => {
    const errors: string[] = [];

    if (new Date(data.endTime) <= new Date(data.startTime)) {
      errors.push("End time must be after start time");
    }

    if (data.registeredAttendees > data.capacity) {
      errors.push("Registered attendees cannot exceed capacity");
    }

    if (data.price && !data.currency) {
      errors.push("Currency is required when price is set");
    }

    return errors;
  };

  const handleSubmit = async (data: any) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to create or edit events",
        variant: "destructive",
      });
      return;
    }

    const validationErrors = await validateForm(data);
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        toast({
          title: "Validation Error",
          description: error,
          variant: "destructive",
        });
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const eventData = {
        ...data,
        userId,
        tags: data.tags?.filter(Boolean) || [],
        categories: data.categories?.filter(Boolean) || [],
        eventLinks: data.eventLinks?.filter(Boolean) || [],
      };

      const result = event?._id
        ? await dispatch(
            updateEvent({ id: event._id, data: eventData })
          ).unwrap()
        : await dispatch(addEvent(eventData)).unwrap();

      toast({
        title: event ? "Event Updated" : "Event Created",
        description: `Successfully ${
          event ? "updated" : "created"
        } the event "${result.name}"`,
      });

      onSubmit?.(result);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save event",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formSteps = [
    // Basic Information
    <Card key="basic-info" className="border-none shadow-sm">
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter event name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organizer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organizer</FormLabel>
              <FormControl>
                <Input placeholder="Enter organizer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 opacity-70" />
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full rounded-md border p-2"
                      minDate={new Date()}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 opacity-70" />
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full rounded-md border p-2"
                      minDate={form.getValues("startTime")}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>,

    // Location and Access
    <Card key="location-access" className="border-none shadow-sm">
      <CardHeader>
        <CardTitle>Location & Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 opacity-70" />
                  <Input placeholder="Enter location" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mapLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Map Link</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4 opacity-70" />
                  <Input placeholder="Enter map URL" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="virtualMeetingUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Virtual Meeting URL</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <VideoIcon className="mr-2 h-4 w-4 opacity-70" />
                  <Input placeholder="Enter virtual meeting URL" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventLinks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Links</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Link className="mr-2 h-4 w-4 opacity-70" />
                  <Input
                    placeholder="Enter links (comma-separated)"
                    value={field.value?.join(", ") || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.split(",").map((link) => link.trim())
                      )
                    }
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Public Event</FormLabel>
                <FormDescription>
                  Make this event visible to all users
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>,

    // Details and Categories
    <Card key="details" className="border-none shadow-sm">
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter event description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter categories (comma-separated)"
                  value={field.value?.join(", ") || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((category) => category.trim())
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Tag className="mr-2 h-4 w-4 opacity-70" />
                  <Input
                    placeholder="Enter tags (comma-separated)"
                    value={field.value?.join(", ") || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.split(",").map((tag) => tag.trim())
                      )
                    }
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>,

    // Capacity and Status
    <Card key="capacity-status" className="border-none">
      <CardHeader>
        <CardTitle>Capacity & Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter capacity"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registeredAttendees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Registrations</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter current registrations"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eventStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>,
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {formSteps[currentStep]}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (currentStep > 0) {
                  setCurrentStep(currentStep - 1);
                } else {
                  onCancel?.();
                }
              }}
            >
              {currentStep === 0 ? "Cancel" : "Previous"}
            </Button>

            <Pagination>
              <PaginationContent>
                {formSteps.map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      className={`${
                        currentStep === index
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      onClick={() => setCurrentStep(index)}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>

            <Button
              type={"button"}
              onClick={() => {
                if (currentStep < formSteps.length - 1) {
                  setCurrentStep(currentStep + 1);
                }
              }}
            >
              Next
            </Button>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                Please wait... <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </span>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EventForm;
