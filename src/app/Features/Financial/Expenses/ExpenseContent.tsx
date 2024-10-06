import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  selectFilteredAndSortedExpenses,
  deleteExpense,
} from "@/store/finances/expenseSlice";
import { ExpenseDocument } from "@/models/financeModel/expenseModel";
import ExpenseDetailsSheet from "./ExpenseDetailsSheet";
import { AppDispatch } from "@/store";
import ExpenseForm from "./ExpenseForm";

const EnhancedRecentExpensesCard = () => {
  const expenses = useSelector(selectFilteredAndSortedExpenses);
  const recentExpenses = expenses.slice(0, 3);
  return (
    <Card className="w-full border-0.5 dark:border-gray-500">
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {recentExpenses.map((expense, index) => (
            <motion.div
              key={expense._id as string} // Explicitly cast _id to string
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="flex justify-between items-center mb-2 border p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600"
            >
              <span>{expense.name}</span>
              <span className="font-semibold">
                ${expense.amount.toFixed(2)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

const EnhancedExpenseHistoryCard = () => {
  const dispatch: AppDispatch = useDispatch();
  const expenses = useSelector(selectFilteredAndSortedExpenses);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  );
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseDocument | null>(
    null
  );

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleMoreClick = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setIsDetailsSheetOpen(true);
  };

  const handleEditExpense = (expense: ExpenseDocument) => {
    setExpenseToEdit(expense);
    setIsEditDialogOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    dispatch(deleteExpense(id));
  };

  const handleCloseEditDialog = () => {
    setExpenseToEdit(null);
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <Card className="flex-grow w-full border-0.5 dark:border-gray-500">
        <CardHeader>
          <CardTitle className="flex flex-col gap-1">
            <h3 className="font-semibold text-2xl text-gray-800">
              Expense History
            </h3>
            <small className="text-sm text-gray-500">
              {expenses.length > 0
                ? `${expenses.length} transaction${
                    expenses.length > 1 ? "s" : ""
                  } recorded`
                : "No transactions found yet. Start tracking your expenses!"}
            </small>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[320px] rounded-lg">
            <AnimatePresence>
              {expenses.map((expense, index) => (
                <motion.div
                  key={expense._id || index} // Fallback to index if _id is undefined
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-between items-center mb-2 border p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600"
                >
                  <div className="flex-1 flex items-center">
                    <div className="flex flex-col">
                      <span className="font-medium">{expense.name}</span>
                      <span className="text-sm text-gray-500">
                        {expense.dateSpent
                          ? moment(expense.dateSpent).format("MMM DD, YYYY")
                          : "Date not set"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="font-bold text-green-600">
                      $
                      {typeof expense.amount === "number"
                        ? expense.amount.toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        expense._id && handleMoreClick(expense._id)
                      }
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditExpense(expense)}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        expense._id && handleDeleteExpense(expense._id)
                      }
                      className="hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>
      <ExpenseDetailsSheet
        expenseId={selectedExpenseId}
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
      />
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the details of your expense.
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            expenseToEdit={expenseToEdit}
            onClose={handleCloseEditDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
export { EnhancedRecentExpensesCard, EnhancedExpenseHistoryCard };
