import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  CalendarIcon,
  DollarSign,
  Tag,
  Paperclip,
  Info,
  User,
  Briefcase,
  CreditCard,
  X,
  Loader2,
  Plus,
} from "lucide-react";
import mongoose from "mongoose"; // Import mongoose
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { ExpenseDocument } from "@/models/financeModel/expenseModel";
import { addExpense, updateExpense } from "@/store/finances/expenseSlice";
import { motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Toaster } from "@/components/ui/toaster";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Define the frequency type
type FrequencyType = "daily" | "weekly" | "monthly" | "yearly";

// Define the payment method type
type PaymentMethodType =
  | "cash"
  | "bank_transfer"
  | "credit_card"
  | "debit_card"
  | "cheque"
  | "other";

// Custom Zod refinement for Mongoose ObjectId
const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

const subExpenseSchema = z.object({
  name: z.string().trim().nonempty(),
  amount: z.number().min(0),
  dateSpent: z.string().transform((str) => new Date(str)), // Transform string to Date
  description: z.string().trim().optional(),
  tags: z.array(z.string()).max(10).optional(),
});

const expenseFormSchema = z.object({
  userId: objectIdSchema,
  name: z.string().trim().nonempty(),
  vendor: z.string().trim().nonempty(),
  amount: z.number().min(0),
  dateSpent: z.string().transform((str) => new Date(str)), // Transform string to Date
  recurringExpense: z.boolean().default(false),
  frequency: z
    .enum(["daily", "weekly", "monthly", "yearly"] as const)
    .default("monthly"),
  description: z.string().trim().optional(),
  currency: z.string().length(3).default("USD"),
  category: z.string().trim().optional(),
  tags: z.array(z.string()).max(10).optional(),
  isTaxDeductible: z.boolean().default(false),
  taxSavings: z.number().min(0).default(0).optional(),
  paymentMethod: z
    .enum([
      "cash",
      "bank_transfer",
      "credit_card",
      "debit_card",
      "cheque",
      "other",
    ] as const)
    .default("credit_card"),
  attachments: z.array(z.string().url()).optional(),
  subExpenses: z.array(subExpenseSchema).optional(),
  reminderDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(), // Transform string to Date
});

// Type for form data
type ExpenseFormData = z.infer<typeof expenseFormSchema>;

// Interface for the component props
interface ExpenseFormProps {
  expenseToEdit?: ExpenseDocument | null;
  onClose?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expenseToEdit,
  onClose,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const { currentUser } = useSelector((state: RootState) => state.auth);
  const userId = currentUser?.id;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      userId: userId || "",
      name: "",
      vendor: "",
      amount: 0,
      dateSpent: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
      recurringExpense: false,
      frequency: "monthly" as FrequencyType,
      description: "",
      currency: "USD",
      category: "",
      tags: [],
      isTaxDeductible: false,
      taxSavings: 0,
      paymentMethod: "credit_card" as PaymentMethodType,
      attachments: [],
      subExpenses: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subExpenses",
  });

  useEffect(() => {
    if (userId) {
      setValue("userId", userId);
    }

    if (expenseToEdit) {
      Object.keys(expenseToEdit).forEach((key) => {
        const typedKey = key as keyof ExpenseDocument;
        let value = expenseToEdit[typedKey];

        // Convert Mongoose ObjectId to string
        if (value instanceof mongoose.Types.ObjectId) {
          value = value.toString();
        }

        // Format dates as YYYY-MM-DD strings
        if (value instanceof Date) {
          value = value.toISOString().split("T")[0];
        }

        if (value !== undefined) {
          setValue(key as keyof ExpenseFormData, value as any);
        }
      });
      setTags(expenseToEdit.tags || []);
      setAttachments([]);
    }
  }, [setValue, userId, expenseToEdit]);
  const onSubmit = async (formData: ExpenseFormData) => {
    try {
      if (!userId) {
        throw new Error("User ID is not available");
      }

      // Convert string IDs to Mongoose ObjectId for the database
      const expensesData: Partial<ExpenseDocument> = {
        ...formData,
        userId: new mongoose.Types.ObjectId(formData.userId),
        amount: Number(formData.amount),
        taxSavings: Number(formData.taxSavings),
      };

      if (expenseToEdit && expenseToEdit._id) {
        await dispatch(
          updateExpense({
            ...expensesData,
            _id: expenseToEdit._id,
          } as ExpenseDocument)
        ).unwrap();

        toast({
          title: "Expenditure Updated",
          description: "Your expenditure has been successfully updated.",
          duration: 3000,
        });
      } else {
        await dispatch(addExpense(expensesData as ExpenseDocument)).unwrap();

        toast({
          title: "Expenditure Logged",
          description: "Your expenditure has been successfully added.",
          duration: 3000,
        });
      }

      reset();
      setTags([]);

      if (onClose) {
        onClose();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to process expenditure. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && event.currentTarget.value.trim() !== "") {
      const newTag = event.currentTarget.value.trim();
      if (tags.length < 10 && !tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        setValue("tags", updatedTags);
        event.currentTarget.value = "";
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    setValue("tags", updatedTags);
  };

  const handleAddAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && attachments.length + files.length <= 5) {
      const newFiles = Array.from(files);
      setAttachments((prevFiles) => [...prevFiles, ...newFiles]);

      // Update the form value with file names or URLs
      const fileUrls = newFiles.map((file) => URL.createObjectURL(file));
      setValue("attachments", fileUrls);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      const remainingUrls = updatedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setValue("attachments", remainingUrls);

      return updatedFiles;
    });
  };

  const renderSubExpenses = () => (
    <div className="flex flex-col gap-3 p-1 w-full">
      <div className="flex justify-between items-center sticky top-2 z-10">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              name: "",
              amount: 0,
              dateSpent: new Date(),
              description: "",
              tags: [],
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Sub-Expense
        </Button>
      </div>
      <ScrollArea className="w-full h-[30vh] p-1">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col gap-3 p-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg my-2"
          >
            <div className="flex justify-between">
              <Label>Sub-Expense #{index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Controller
                  name={`subExpenses.${index}.name`}
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Controller
                  name={`subExpenses.${index}.amount`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Controller
                  name={`subExpenses.${index}.dateSpent`}
                  control={control}
                  render={({ field }) => <Input {...field} type="date" />}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Controller
                  name={`subExpenses.${index}.description`}
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </div>
            </div>
            <Separator className="my-3" />
          </div>
        ))}
      </ScrollArea>
    </div>
  );

  const renderPageContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="flex flex-col gap-2 p-1">
            <p className="text-center w-full p-1 border-b border-gray-300 dark:border-gray-600 mb-2">
              {expenseToEdit?.name || "Basic Information"}
            </p>
            <div>
              <Label htmlFor="name" className="mb-3 flex items-center gap-2">
                Name
              </Label>
              <div className="relative mb-2">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="name" className="pl-10" />
                  )}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="sources" className="mb-3 flex items-center gap-2">
                Vendor
              </Label>
              <div className="relative mb-2">
                <Briefcase
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Controller
                  name="vendor"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="sources" className="pl-10" />
                  )}
                />
              </div>
              {errors.vendor && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.vendor.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="amount" className="mb-3 flex items-center gap-2">
                Amount
              </Label>
              <div className="relative mb-2">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="amount"
                      type="number"
                      className="pl-10"
                      inputMode="decimal"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="dateSpent"
                className="mb-3 flex items-center gap-2"
              >
                Transaction Date
              </Label>
              <div className="relative mb-2">
                <CalendarIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Controller
                  name="dateSpent"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="dateSpent"
                      type="date"
                      className="pl-10"
                    />
                  )}
                />
              </div>
              {errors.dateSpent && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.dateSpent.message}
                </p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-2 p-1">
            <p className="text-center w-full p-1 border-b border-gray-300 dark:border-gray-600 mb-2">
              {expenseToEdit?.name || "Details... "}
            </p>
            <div>
              <Label
                htmlFor="currency"
                className="mb-3 flex items-center gap-2"
              >
                Currency
              </Label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.currency && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.currency.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="category"
                className="mb-3 flex items-center gap-2"
              >
                Category
              </Label>
              <div className="relative">
                <Tag
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="category" className="pl-10" />
                  )}
                />
              </div>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="recurringExpense"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="recurringExpense"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label
                htmlFor="recurringExpense"
                className="mb-3 flex items-center gap-2"
              >
                Recurring Expenditure
              </Label>
            </div>

            <div>
              <Label
                htmlFor="frequency"
                className="mb-3 flex items-center gap-2"
              >
                Frequency
              </Label>
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
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.frequency && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.frequency.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="paymentMethod"
                className="mb-3 flex items-center gap-2"
              >
                Payment Method
              </Label>
              <div className="relative">
                <CreditCard
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-2 p-1">
            <p className="text-center w-full p-1 border-b border-gray-300 dark:border-gray-600 mb-2">
              {expenseToEdit?.name || "Sub-expenditure Details"}
            </p>
            {renderSubExpenses()}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="attachments">Attachments</Label>
              <div className="flex items-center space-x-2">
                <Paperclip className="text-gray-400" size={18} />
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleAddAttachment}
                />
              </div>
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center mt-2">
                  <span>{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttachment(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              {errors.attachments && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.attachments.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex items-center space-x-2">
                <Tag className="text-gray-400" size={18} />
                <Input
                  id="tags"
                  placeholder="Add a tag and press Enter"
                  onKeyPress={handleAddTag}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                  >
                    <span>{tag}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
              {errors.tags && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tags.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <div className="relative">
                <Info
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="description"
                      className="pl-10"
                      rows={4}
                      placeholder="Provide a brief description"
                    />
                  )}
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="isTaxDeductible"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isTaxDeductible"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isTaxDeductible">Is Taxable</Label>
            </div>

            <div>
              <Label htmlFor="taxSavings">Tax Deductions</Label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Controller
                  name="taxSavings"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="taxSavings"
                      type="number"
                      className="pl-10"
                      inputMode="decimal"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              {errors.taxSavings && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.taxSavings.message}
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-[3/4] mx-auto"
    >
      <Card className="border-none p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="px-0">
            <div className="space-y-4 h-[400px] border border-gray-300 dark:border-gray-600 p-2 rounded-lg overflow-y-auto">
              {renderPageContent()}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  />
                </PaginationItem>
                {[1, 2, 3, 4].map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, 4))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {expenseToEdit ? "Updating..." : "Submitting..."}
                </>
              ) : expenseToEdit ? (
                "Update Expense"
              ) : (
                "Add Expense"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Toaster />
    </motion.section>
  );
};

export default ExpenseForm;
