import React from "react";
import {
  CalendarDays,
  DollarSign,
  Tag,
  FileText,
  CreditCard,
  Repeat,
  Receipt,
  Store,
  Flag,
  Bell,
  List,
  Calculator,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { selectFilteredAndSortedExpenses } from "@/store/finances/expenseSlice";

interface ExpenseDetailsProps {
  expenseId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ExpenseDetailsSheet: React.FC<ExpenseDetailsProps> = ({
  expenseId,
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch();
  const expenses = useSelector(selectFilteredAndSortedExpenses);
  const expense = expenses.find((e) => e._id === expenseId);

  if (!expense) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: expense.currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return moment(date).format("MMM DD, YYYY");
  };

  const handleDeleteSubExpense = (index: number) => {
    // Assuming you have an action to update the expense
    dispatch({
      type: "expenses/updateExpense",
      payload: {
        ...expense,
        subExpenses: expense.subExpenses?.filter((_, i) => i !== index),
      },
    });
  };

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label?: string;
    value: string;
  }) => (
    <div className="flex items-center space-x-2">
      <Icon className="h-4 w-4" />
      <span>
        {label && `${label}: `}
        {value}
      </span>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{expense.name}</SheetTitle>
          {expense.isTaxDeductible && (
            <Badge className="w-max">Tax Deductible</Badge>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <InfoItem
              icon={DollarSign}
              value={formatCurrency(expense.amount)}
            />
            <InfoItem
              icon={Calculator}
              label="Net"
              value={formatCurrency(expense.netExpense || 0)}
            />
            <InfoItem
              icon={CalendarDays}
              value={formatDate(expense.dateSpent)}
            />
            <InfoItem icon={Store} value={expense.vendor} />
            <InfoItem icon={Tag} value={expense.category || "Uncategorized"} />
            <InfoItem
              icon={CreditCard}
              value={expense?.paymentMethod?.replace("_", " ") ?? "N/A"}
            />
            <InfoItem icon={Flag} value={expense.currency ?? "N/A"} />

            {expense.description && (
              <InfoItem icon={FileText} value={expense.description} />
            )}

            {expense.recurringExpense && (
              <InfoItem
                icon={Repeat}
                label="Recurring"
                value={expense.frequency || ""}
              />
            )}

            {expense.reminderDate && (
              <InfoItem
                icon={Bell}
                label="Reminder"
                value={formatDate(expense.reminderDate)}
              />
            )}

            {expense.taxSavings && (
              <InfoItem
                icon={Receipt}
                label="Tax Savings"
                value={formatCurrency(expense.taxSavings)}
              />
            )}
          </div>

          {expense.subExpenses && expense.subExpenses.length > 0 && (
            <Card className="border-none">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <List className="mr-2 h-4 w-4" />
                  Sub-Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expense.subExpenses.map((subExpense, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border dark:border-gray-600 rounded"
                    >
                      <div>
                        <div className="font-medium">{subExpense.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(subExpense.amount)} •{" "}
                          {formatDate(subExpense.dateSpent)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubExpense(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {expense.tags && expense.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {expense.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {expense.attachments && expense.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Attachments</h3>
              <div className="space-y-1">
                {expense.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    Attachment {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <div>Created: {formatDate(expense.createdAt)}</div>
            <div>Updated: {formatDate(expense.updatedAt)}</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExpenseDetailsSheet;
