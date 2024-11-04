import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader2, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Badge } from "@/components/ui/badge";
import {
  Frequency,
  RoutineStatus,
  RoutineFormData,
} from "@/store/type/routine";
import { useSession } from "next-auth/react";
import routineSchema from "@/store/type/routine";

interface RoutineFormProps {
  initialData?: RoutineFormData;
  onSubmit: (data: RoutineFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

const RoutineForm: React.FC<RoutineFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error: externalError,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const defaultValues: RoutineFormData = {
    userId: userId || "",
    title: "",
    startTime: new Date(),
    endTime: new Date(),
    frequency: Frequency.DAILY,
    daysOfWeek: [],
    monthlyDate: 1,
    description: "",
    reminderMinutes: 15,
    status: RoutineStatus.ACTIVE,
    tags: [],
    category: "",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<RoutineFormData>({
    resolver: zodResolver(routineSchema),
    defaultValues: initialData || defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      const formattedData = {
        ...initialData,
        startTime: new Date(initialData.startTime),
        endTime: new Date(initialData.endTime),
      };
      reset(formattedData);
      setTags(initialData.tags || []);
    }
  }, [initialData, reset]);

  const onFormSubmit = async (data: RoutineFormData) => {
    if (!userId) {
      setInternalError("User ID is required.");
      return;
    }

    try {
      const formData = { ...data, tags };
      await onSubmit(formData);
      setInternalError(null);

      if (!initialData) {
        reset(defaultValues);
        setTags([]);
      }
    } catch (error: any) {
      setInternalError(error.message || "Failed to process routine.");
      toast({
        title: "Error",
        description: error.message || "Failed to process routine.",
        variant: "destructive",
      });
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      setValue("tags", newTags);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const frequency = watch("frequency");

  const handleFrequencyChange = (newValue: Frequency) => {
    setValue("frequency", newValue, { shouldValidate: true });
    // Reset related fields based on frequency
    if (newValue === Frequency.DAILY) {
      setValue("daysOfWeek", []);
      setValue("monthlyDate", 1);
    } else if (newValue === Frequency.WEEKLY) {
      setValue("monthlyDate", 1);
    } else if (newValue === Frequency.MONTHLY) {
      setValue("daysOfWeek", []);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Routine Title</Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => <Input id="title" {...field} />}
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => <Input id="category" {...field} />}
        />
        {errors.category && (
          <p className="text-red-500 text-sm">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleTagRemove(tag)}
              />
            </Badge>
          ))}
        </div>
        <Input
          placeholder="Add tag and press Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleTagAdd((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={field.onChange}
                showTimeSelect
                showTimeSelectOnly
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="h:mm aa"
                className="w-full p-2 border rounded"
              />
            )}
          />
          {errors.startTime && (
            <p className="text-red-500 text-sm">{errors.startTime.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={field.onChange}
                showTimeSelect
                showTimeSelectOnly
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="h:mm aa"
                className="w-full p-2 border rounded"
              />
            )}
          />
          {errors.endTime && (
            <p className="text-red-500 text-sm">{errors.endTime.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderScheduling = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency</Label>
        <Controller
          name="frequency"
          control={control}
          render={({ field: { value } }) => (
            <Select onValueChange={handleFrequencyChange} value={value}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Frequency).map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.frequency && (
          <p className="text-red-500 text-sm">{errors.frequency.message}</p>
        )}
      </div>

      {frequency === Frequency.WEEKLY && (
        <div className="space-y-2">
          <Label>Days of the Week</Label>
          <div className="grid grid-cols-4 gap-2">
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
                            ? [...(field.value || []), index]
                            : (field.value || []).filter((d) => d !== index);
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
        </div>
      )}

      {frequency === Frequency.MONTHLY && (
        <div className="space-y-2">
          <Label htmlFor="monthlyDate">Date of Month</Label>
          <Controller
            name="monthlyDate"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min="1"
                max="31"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reminderMinutes">Reminder (minutes before)</Label>
        <Controller
          name="reminderMinutes"
          control={control}
          render={({ field }) => (
            <Input
              type="number"
              min="0"
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              id="description"
              placeholder="briefly describe your routine "
              {...field}
              className="min-h-[100px]"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
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
      </div>
    </div>
  );

  const renderPageContent = () => {
    switch (currentPage) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderScheduling();
      case 3:
        return renderDetails();
      default:
        return null;
    }
  };

  return (
    <Card className="w-full boder-gray-300 dark:border-gray-700">
      <CardContent className="p-6 border-none">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {renderPageContent()}

          <Pagination className="flex justify-center items-center gap-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, 3))
                  }
                  className={
                    currentPage === 3 ? "opacity-50 cursor-not-allowed" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="w-full flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={onCancel}
              className="flex-1 rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant={"default"}
              className="flex-1 rounded-md"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  Processing...
                </span>
              ) : initialData ? (
                "Update Routine"
              ) : (
                "Create Routine"
              )}
            </Button>
          </div>

          {(externalError || internalError) && (
            <Alert variant="destructive">
              <AlertDescription>
                {externalError || internalError}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <Toaster />
    </Card>
  );
};

export default RoutineForm;
