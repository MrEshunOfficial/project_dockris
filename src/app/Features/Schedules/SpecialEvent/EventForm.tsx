import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Link, Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { addEvent, updateEvent } from "@/store/schedule/eventSlice";
import { AppDispatch, RootState } from "@/store";
import { EventType, EventDocument } from "@/store/schedule/eventSlice";
import { toast } from "@/components/ui/use-toast";

const EventTypeOptions: { label: string; value: EventType }[] = [
  { label: "Conference", value: "conference" },
  { label: "Workshop", value: "workshop" },
  { label: "Meetup", value: "meetup" },
  { label: "Party", value: "party" },
];

const eventSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Event name is required"),
  startTime: z.date(),
  endTime: z.date(),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  type: z.enum(["conference", "workshop", "meetup", "party"]),
  reminder: z.boolean().optional(),
  organizer: z.string().optional(),
  capacity: z.number().min(1).nullable().optional(),
  registeredAttendees: z.number().min(1).nullable().optional(),
  eventLinks: z.array(z.string().url()).optional(),
  mapLink: z.string().url().optional(),
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
});

type EventFormProps = {
  event?: EventDocument;
  onSubmit: (data: EventDocument) => void;
};

type EventFormData = z.infer<typeof eventSchema>;

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser } = useSelector((state: RootState) => state.auth);
  const userId = currentUser?.id;

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          ...event,
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
        }
      : {
          userId: userId,
          reminder: false,
          status: "pending",
          startTime: new Date(),
          endTime: new Date(),
        },
  });

  const handleSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      if (event && event._id) {
        const updatedEvent = await dispatch(
          updateEvent({ ...data, _id: event._id })
        ).unwrap();
        onSubmit(updatedEvent);
      } else {
        const newEvent = await dispatch(addEvent(data)).unwrap();
        onSubmit(newEvent);
      }
      toast({
        title: event ? "Event Updated" : "Event Created",
        description: `Event ${event ? "updated" : "created"} successfully.`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Failed to save event:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          `Failed to ${event ? "update" : "add"} event. Please try again.`,
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formSteps = [
    // Step 1: Basic Info
    <Card key="basic-info" className="h-3/4 border-none">
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="name"
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date) => field.onChange(date)}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
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
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date) => field.onChange(date)}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
      </CardContent>
    </Card>,
    // Step 2: Description and Type
    <Card key="description-type" className="h-3/4 border-none">
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
                <Textarea placeholder="Enter event description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  {EventTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reminder"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Set Reminder</FormLabel>
                <FormDescription>
                  {`You'll receive a reminder before the event starts.`}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>,
    // Step 3: Organizer and Capacity
    <Card key="organizer-capacity" className="h-3/4 border-none">
      <CardHeader>
        <CardTitle>Organizer and Capacity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="organizer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organizer</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 opacity-70" />
                  <Input placeholder="Enter organizer name" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter capacity"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? null : Number(value));
                  }}
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
              <FormLabel>Registered Attendees (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter Attendees"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? null : Number(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>,
    // Step 4: Links and Status
    <Card key="links-status" className="h-3/4 border-none">
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="eventLinks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Links (Optional)</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Link className="mr-2 h-4 w-4 opacity-70" />
                  <Input
                    placeholder="Enter event links (comma-separated)"
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
          name="mapLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Map Link (Optional)</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 opacity-70" />
                  <Input placeholder="Enter map link" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
    <div className="w-full p-6 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {formSteps[currentStep]}
              </motion.div>
            </AnimatePresence>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentStep((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentStep === 0}
                />
              </PaginationItem>
              {formSteps.map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => setCurrentStep(index)}
                    isActive={currentStep === index}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentStep((prev) =>
                      Math.min(formSteps.length - 1, prev + 1)
                    )
                  }
                  disabled={currentStep === formSteps.length - 1}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="flex justify-end space-x-4">
            {currentStep === formSteps.length - 1 ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() =>
                  setCurrentStep((prev) =>
                    Math.min(formSteps.length - 1, prev + 1)
                  )
                }
              >
                Next
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EventForm;
