import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import routineSchema, {
  RoutineFormData,
  Frequency,
  RoutineStatus,
} from "@/store/types/routine";
import { useDispatch, useSelector } from "react-redux";
import {
  addRoutine,
  RoutineDocument,
  updateRoutine,
} from "@/store/schedule/routineSlice";
import { RootState, AppDispatch } from "@/store";
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
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DatePicker from "react-datepicker";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface RoutineFormProps {
  existingRoutine?: RoutineDocument;
  isEditing?: boolean;
  onSubmit: (data: RoutineDocument) => void | Promise<void>;
  onCancel: () => void;
}

const RoutineForm: React.FC<RoutineFormProps> = ({
  existingRoutine,
  onSubmit,
  onCancel,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.routines);
  const [currentPage, setCurrentPage] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<RoutineFormData>({
    resolver: zodResolver(routineSchema),
    defaultValues: existingRoutine
      ? {
          ...existingRoutine,
          startTime: new Date(existingRoutine.startTime),
          endTime: new Date(existingRoutine.endTime),
        }
      : {
          name: "",
          startTime: new Date(),
          endTime: new Date(),
          frequency: Frequency.DAILY,
          daysOfWeek: [],
          reminderMinutes: false,
          status: RoutineStatus.ACTIVE,
        },
  });

  const { currentUser } = useSelector((state: RootState) => state.auth);
  const userId = currentUser?.id;

  const onFormSubmit = async (data: RoutineFormData) => {
    console.log("Form submission started", data);
    if (!userId) {
      setFormError("User ID is required.");
      return;
    }

    const routineData: Omit<RoutineDocument, "createdAt" | "updatedAt"> = {
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      userId: userId,
      completionStatus: existingRoutine ? existingRoutine.completionStatus : [],
      status: data.status as RoutineStatus,
      daysOfWeek: data.frequency === Frequency.WEEKLY ? data.daysOfWeek : [],
      monthlyDate:
        data.frequency === Frequency.MONTHLY ? data.monthlyDate : undefined,
    };

    try {
      if (existingRoutine) {
        console.log("Updating existing routine");
        const updatedRoutineData = {
          ...routineData,
          _id: existingRoutine._id,
          createdAt: existingRoutine.createdAt, // Preserve original creation time
          updatedAt: new Date(), // Update the updatedAt timestamp
        };

        await dispatch(updateRoutine(updatedRoutineData)).unwrap();
        toast({
          title: "Routine Updated",
          description: "Routine Updated successfully",
          duration: 3000,
        });
      } else {
        const newRoutineData = {
          ...routineData,
          createdAt: new Date(), // New creation timestamp
          updatedAt: new Date(), // Initial update timestamp
        };

        await dispatch(addRoutine(newRoutineData)).unwrap();
        toast({
          title: "Routine Created",
          description: "Routine successfully Created",
          duration: 3000,
        });
        reset();
      }

      // Pass the full RoutineDocument to onSubmit
      onSubmit({
        ...routineData,
        createdAt: new Date(), // Use the current date if it's a new routine
        updatedAt: new Date(), // Set the updated timestamp
      } as RoutineDocument);

      setFormError(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to add routine. Please try again.",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  const frequency = watch("frequency");

  const defaultDate = new Date();
  defaultDate.setHours(0, 0, 0, 0);

  const handleTimeChange = (field: any, selectedDate: Date | null) => {
    if (selectedDate) {
      const newDate = new Date(defaultDate);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      field.onChange(newDate);
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Routine Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input id="name" {...field} />}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Controller
                  name="startTime"
                  control={control}
                  defaultValue={defaultDate}
                  render={({ field }) => (
                    <DatePicker
                      id="startTime"
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date) => handleTimeChange(field, date)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  )}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Controller
                  name="endTime"
                  control={control}
                  defaultValue={defaultDate}
                  render={({ field }) => (
                    <DatePicker
                      id="endTime"
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date) => handleTimeChange(field, date)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  )}
                />
                {errors?.endTime && (
                  <p className="text-red-500 text-sm">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Controller
                name="frequency"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Frequency).map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq.charAt(0).toUpperCase() +
                            freq.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.frequency && (
                <p className="text-red-500 text-sm">
                  {errors.frequency.message}
                </p>
              )}
            </div>

            {frequency === Frequency.WEEKLY && (
              <div className="space-y-2">
                <Label>Days of the Week</Label>
                <div className="flex flex-wrap gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day, index) => (
                      <Controller
                        key={day}
                        name="daysOfWeek"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${index}`}
                              checked={field.value?.includes(index)}
                              onCheckedChange={(checked) => {
                                const updatedDays = checked
                                  ? [...field.value, index]
                                  : field.value.filter(
                                      (d: number) => d !== index
                                    );
                                field.onChange(updatedDays);
                              }}
                            />
                            <Label htmlFor={`day-${index}`}>{day}</Label>
                          </div>
                        )}
                      />
                    )
                  )}
                </div>
                {errors.daysOfWeek && (
                  <p className="text-red-500 text-sm">
                    {errors.daysOfWeek.message}
                  </p>
                )}
              </div>
            )}

            {frequency === Frequency.MONTHLY && (
              <div className="space-y-2">
                <Label htmlFor="monthlyDate">Monthly Date</Label>
                <Controller
                  name="monthlyDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="monthlyDate"
                      type="number"
                      min="1"
                      max="31"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  )}
                />
                {errors.monthlyDate && (
                  <p className="text-red-500 text-sm">
                    {errors.monthlyDate.message}
                  </p>
                )}
              </div>
            )}
          </>
        );
      case 3:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <Textarea id="description" {...field} />}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="reminderMinutes"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="reminderMinutes"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="reminderMinutes">Enable Reminders</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(RoutineStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() +
                            status.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-red-500 text-sm">{errors.status.message}</p>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none">
      <AnimatePresence>
        <CardContent className="border-none">
          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="space-y-6 min-h-[350px]"
          >
            {renderPageContent()}

            <Pagination className="w-full flex items-center justify-center gap-3">
              <PaginationContent>
                <PaginationItem className="p-1">
                  {currentPage > 1 ? (
                    <PaginationPrevious
                      className=" cursor-pointer"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                    />
                  ) : (
                    <span className="pagination-disabled">Previous</span> // Custom disabled rendering
                  )}
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
                <PaginationItem className="p-1">
                  {currentPage < 3 ? (
                    <PaginationNext
                      className=" cursor-pointer"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, 3))
                      }
                    />
                  ) : (
                    <span className="pagination-disabled">Next</span> // Custom disabled rendering
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            {currentPage === 3 && (
              <div className="flex justify-between">
                <Button type="button" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" />
                      Processing ...
                    </span>
                  ) : existingRoutine ? (
                    "Update Routine"
                  ) : (
                    "Add Routine"
                  )}
                </Button>
              </div>
            )}

            {status === "loading" && <p>Loading...</p>}
            {(error || formError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {typeof error === "string"
                    ? error
                    : formError ||
                      "An unexpected error occurred. Please try again."}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </AnimatePresence>
      <Toaster />
    </Card>
  );
};
export default RoutineForm;
