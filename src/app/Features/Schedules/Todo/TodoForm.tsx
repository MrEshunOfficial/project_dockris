import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  useForm,
  useFieldArray,
  Controller,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Fan,
  ListChecks,
  Sunset,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  FileIcon,
  InfoIcon,
  Loader2,
} from "lucide-react";
import DatePicker from "react-datepicker";
import {
  addTodo,
  selectTodoById,
  updateTodo,
} from "@/store/schedule/todoSlice";
import { toast } from "@/components/ui/use-toast";
import { RootState, AppDispatch } from "@/store";

// Constants
const PRIORITY_LEVELS = [
  {
    value: "lowest",
    label: "Lowest",
    icon: <Fan size={16} className="text-blue-500 mr-2" />,
  },
  {
    value: "low",
    label: "Low",
    icon: <Fan size={16} className="text-green-500 mr-2" />,
  },
  {
    value: "medium",
    label: "Medium",
    icon: <ListChecks size={16} className="text-yellow-500 mr-2" />,
  },
  {
    value: "high",
    label: "High",
    icon: <Sunset size={16} className="text-orange-500 mr-2" />,
  },
  {
    value: "highest",
    label: "Highest",
    icon: <Sunset size={16} className="text-red-500 mr-2" />,
  },
] as const;

const TODO_CATEGORIES = [
  {
    value: "work",
    label: "Work",
    icon: <Sunset size={16} className="text-red-500 mr-2" />,
  },
  {
    value: "personal",
    label: "Personal",
    icon: <Fan size={16} className="text-green-500 mr-2" />,
  },
  {
    value: "family",
    label: "Family",
    icon: <ListChecks size={16} className="text-yellow-500 mr-2" />,
  },
  {
    value: "hobbies",
    label: "Hobbies",
    icon: <Fan size={16} className="text-purple-500 mr-2" />,
  },
  {
    value: "education",
    label: "Education",
    icon: <Fan size={16} className="text-blue-500 mr-2" />,
  },
] as const;

// Update the todoSchema to match the Todo interface from the slice
const todoSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDateTime: z.date().optional(),
  priority: z.enum(["lowest", "low", "medium", "high", "highest"]),
  category: z.enum(["work", "personal", "family", "hobbies", "education"]),
  tags: z.array(z.string()).optional(),
  estimatedDuration: z.number().positive().optional(),
  subtasks: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1, "Subtask title is required"),
        completed: z.boolean().default(false),
      })
    )
    .optional(),
  links: z.array(z.string().url("Invalid URL")).optional(),
  completed: z.boolean().default(false),
});

type TodoFormData = z.infer<typeof todoSchema>;

// Form pages configuration
const FORM_PAGES = [
  { title: "Basic Info", fields: ["title", "description", "dueDateTime"] },
  {
    title: "Category and Priority",
    fields: ["category", "priority", "estimatedDuration"],
  },
  { title: "Add Tags", fields: ["tags"] },
  { title: "Create Subtasks", fields: ["subtasks"] },
  { title: "Add Links", fields: ["links"] },
] as const;

interface TodoFormProps {
  todoId?: string;
}

const TodoForm: React.FC<TodoFormProps> = ({ todoId }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const editingTodo = useSelector((state: RootState) =>
    todoId ? selectTodoById(state, todoId) : null
  );

  const form = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDateTime: undefined,
      priority: "medium",
      category: "work",
      tags: [],
      estimatedDuration: undefined,
      subtasks: [],
      links: [],
      completed: false,
    },
  });

  const {
    fields: subtaskFields,
    append: appendSubtask,
    remove: removeSubtask,
  } = useFieldArray({
    control: form.control,
    name: "subtasks",
  });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control: form.control,
    name: "links",
  });

  useEffect(() => {
    if (editingTodo) {
      form.reset({
        ...editingTodo,
        dueDateTime: editingTodo.dueDateTime
          ? new Date(editingTodo.dueDateTime)
          : undefined,
      });
    }
  }, [editingTodo, form]);

  const onSubmit: SubmitHandler<TodoFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      if (todoId) {
        await dispatch(updateTodo({ ...data, _id: todoId })).unwrap();
        toast({
          title: "Task Updated",
          description: "Todo updated successfully",
          duration: 3000,
        });
      } else {
        await dispatch(addTodo(data)).unwrap();
        form.reset();
        setCurrentPage(0);
        toast({
          title: "Task Added",
          description: "Your Todo has been added successfully",
          duration: 3000,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save task. Please try again.",
        duration: 3000,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() !== "") {
      const currentTags = form.getValues("tags") || [];
      form.setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((_, i) => i !== index)
    );
  };

  const nextPage = () => {
    if (currentPage < FORM_PAGES.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Field rendering functions
  const renderBasicInfoFields = () => (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <FileIcon size={18} />
              Title
            </FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <InfoIcon size={18} />
              Description
            </FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="dueDateTime"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel className="flex items-center gap-2">
              <CalendarIcon size={18} /> Due Date and Time
            </FormLabel>
            <FormControl>
              <div className="relative">
                <DatePicker
                  selected={field.value}
                  onChange={(date: Date) => field.onChange(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-2 border border-gray-300 rounded-lg transition-all duration-300 ease-in-out"
                  wrapperClassName="w-full"
                  popperClassName="react-datepicker-right"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderCategoryPriorityFields = () => (
    <>
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TODO_CATEGORIES.map(({ value, label, icon }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center justify-start gap-2">
                      {icon} {label}
                    </span>
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
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PRIORITY_LEVELS.map(({ value, label, icon }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center justify-start gap-2">
                      {icon} {label}
                    </span>
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
        name="estimatedDuration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Duration (minutes)</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderTagsField = () => (
    <FormItem>
      <div className="flex justify-between my-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a tag"
          className="flex-1 mr-2"
        />
        <Button type="button" onClick={addTag}>
          Add
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {form.watch("tags")?.map((tag, index) => (
          <div
            key={index}
            className="bg-gray-200 px-2 py-1 rounded-full flex items-center"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-2 text-red-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </FormItem>
  );

  const renderSubtasksField = () => (
    <FormItem>
      {subtaskFields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2 my-2">
          <Controller
            name={`subtasks.${index}.title`}
            control={form.control}
            render={({ field }) => (
              <Input {...field} placeholder="Subtask title" />
            )}
          />
          <Controller
            name={`subtasks.${index}.completed`}
            control={form.control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Button type="button" onClick={() => removeSubtask(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() => appendSubtask({ title: "", completed: false })}
        className="mt-2"
      >
        Add Subtask
      </Button>
    </FormItem>
  );

  const renderLinksField = () => (
    <FormItem>
      {linkFields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2 my-2">
          <Controller
            name={`links.${index}`}
            control={form.control}
            render={({ field }) => (
              <Input {...field} placeholder="https://example.com" />
            )}
          />
          <Button type="button" onClick={() => removeLink(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" onClick={() => appendLink("")} className="mt-2">
        Add Link
      </Button>
    </FormItem>
  );

  const renderCurrentPageFields = () => {
    switch (currentPage) {
      case 0:
        return renderBasicInfoFields();
      case 1:
        return renderCategoryPriorityFields();
      case 2:
        return renderTagsField();
      case 3:
        return renderSubtasksField();
      case 4:
        return renderLinksField();
      default:
        return null;
    }
  };

  return (
    <Card className="w-full p-2">
      <CardHeader className="bg-gray-100 p-2 mb-3 dark:bg-transparent border dark:border-gray-600 rounded-md">
        <CardTitle className="text-gray-800 text-xl font-semibold">
          {todoId ? "Edit Todo" : "Add New Todo"}:{" "}
          {FORM_PAGES[currentPage].title}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id="todoFormId">
          <CardContent className="w-full space-y-4 h-[335px] overflow-y-auto">
            {renderCurrentPageFields()}
          </CardContent>
          <CardFooter className="flex justify-center gap-3">
            <Button
              type="button"
              onClick={prevPage}
              disabled={currentPage === 0 || isSubmitting}
              className="flex-1 rounded-full p-3"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-full p-3"
              onClick={nextPage}
              disabled={currentPage === FORM_PAGES.length - 1 || isSubmitting}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : todoId ? (
              "Update Todo"
            ) : (
              "Add Todo"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default TodoForm;
