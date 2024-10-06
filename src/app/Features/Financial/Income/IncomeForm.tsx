import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
} from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useDispatch } from "react-redux";
import { addIncome, Income, updateIncome } from "@/store/finances/incomeSlice";
import { AppDispatch, RootState } from "@/store";

const incomeSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required"),
  sources: z.string().min(1, "Please enter the source"),
  amount: z.number().min(0, "Amount must be a non-negative number"),
  dateReceived: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  recurringIncome: z.boolean().optional().default(false),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  description: z.string().optional(),
  currency: z.string().max(3).toUpperCase().optional().default("USD"),
  category: z.string().optional(),
  tags: z.array(z.string()).max(10, "You cannot have more than 10 tags"),
  isTaxable: z.boolean().optional().default(false),
  taxDeductions: z
    .number()
    .min(0, "Tax deductions must be a non-negative number")
    .optional(),
  paymentMethod: z
    .enum(["cash", "bank_transfer", "cheque", "other"])
    .default("bank_transfer"),
  attachments: z
    .array(z.string().url())
    .max(5, "You cannot upload more than 5 attachments"),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  incomeToEdit?: Income | null;
  onClose?: () => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ incomeToEdit, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const { toast } = useToast();
  const dispatch: AppDispatch = useDispatch();

  const { currentUser } = useSelector((state: RootState) => state.auth);
  const userId = currentUser?.id;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      userId: "",
      recurringIncome: false,
      frequency: "daily",
      isTaxable: false,
      attachments: [],
      paymentMethod: "bank_transfer",
      currency: "USD",
      category: "",
      tags: [],
      description: "",
      dateReceived: new Date().toISOString().split("T")[0],
      name: "",
      sources: "",
      amount: 0,
      taxDeductions: 0,
    },
  });

  useEffect(() => {
    if (userId) {
      setValue("userId", userId);
    }

    if (incomeToEdit) {
      Object.keys(incomeToEdit).forEach((key) => {
        setValue(
          key as keyof IncomeFormData,
          incomeToEdit[key as keyof Income]
        );
      });
      setTags(incomeToEdit.tags || []);
      setAttachments([]);
    }
  }, [setValue, userId, incomeToEdit]);

  const onSubmit = async (data: IncomeFormData) => {
    try {
      if (!userId) {
        throw new Error("User ID is not available");
      }

      const incomeData = {
        ...data,
        userId,
        amount: Number(data.amount),
        taxDeductions: Number(data.taxDeductions),
      };

      if (incomeToEdit) {
        await dispatch(
          updateIncome({ _id: incomeToEdit._id, ...incomeData })
        ).unwrap();

        toast({
          title: "Income Updated",
          description: "Your income has been successfully updated.",
          duration: 3000,
        });
      } else {
        await dispatch(addIncome(incomeData)).unwrap();

        toast({
          title: "Income Added",
          description: "Your income has been successfully added.",
          duration: 3000,
        });
      }

      reset();
      setTags([]);

      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to process income. Please try again.",
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

  const renderPageContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="mb-3 flex items-center gap-2">
                Name
              </Label>
              <div className="relative">
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
              <Label htmlFor="sources">Source</Label>
              <div className="relative">
                <Briefcase
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Controller
                  name="sources"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="sources" className="pl-10" />
                  )}
                />
              </div>
              {errors.sources && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.sources.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
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
              <Label htmlFor="dateReceived">Date Received</Label>
              <div className="relative">
                <CalendarIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Controller
                  name="dateReceived"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="dateReceived"
                      type="date"
                      className="pl-10"
                    />
                  )}
                />
              </div>
              {errors.dateReceived && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.dateReceived.message}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
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
              <Label htmlFor="category">Category</Label>
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
                name="recurringIncome"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="recurringIncome"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="recurringIncome">Recurring Income</Label>
            </div>

            <div>
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
              <Label htmlFor="paymentMethod">Payment Method</Label>
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
                name="isTaxable"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isTaxable"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isTaxable">Is Taxable</Label>
            </div>

            <div>
              <Label htmlFor="taxDeductions">Tax Deductions</Label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Controller
                  name="taxDeductions"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="taxDeductions"
                      type="number"
                      className="pl-10"
                      inputMode="decimal"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              {errors.taxDeductions && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.taxDeductions.message}
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
      className="w-[400px] mx-auto"
    >
      <Card className="border-none p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="px-0">
            <div className="space-y-4">{renderPageContent()}</div>
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
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === 2}
                    onClick={() => setCurrentPage(2)}
                  >
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === 3}
                    onClick={() => setCurrentPage(3)}
                  >
                    3
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, 3))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {incomeToEdit ? "Updating..." : "Submitting..."}
                </>
              ) : incomeToEdit ? (
                "Update Income"
              ) : (
                "Add Income"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Toaster />
    </motion.section>
  );
};

export default IncomeForm;
