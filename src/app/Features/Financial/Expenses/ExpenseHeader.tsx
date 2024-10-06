import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  setSearchTerm,
  setSelectedCategory,
  selectFilteredAndSortedExpenses,
} from "@/store/finances/expenseSlice";
import { RootState } from "@/store";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ExpenseForm from "./ExpenseForm";
import { motion } from "framer-motion"; // Framer Motion for animations
import { selectTotalIncome } from "@/store/finances/incomeSlice";

interface ExpenseHeaderProps {
  handleFormClick: () => void;
}

const ExpenseHeader: React.FC<ExpenseHeaderProps> = ({ handleFormClick }) => {
  const dispatch = useDispatch();
  const searchTerm = useSelector(
    (state: RootState) => state.expenses.searchTerm
  );
  const selectedCategory = useSelector(
    (state: RootState) => state.expenses.selectedCategory
  );
  const filteredExpenses = useSelector(selectFilteredAndSortedExpenses);
  const totalIncome = useSelector(selectTotalIncome);
  const [isCategoryDropdownOpen, setCategoryDropdownOpen] = useState(false); // Dropdown state

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleCategoryChange = (value: string) => {
    dispatch(setSelectedCategory(value === "All Categories" ? null : value));
  };

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex flex-col"
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Expense Tracker
        </h1>
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          Available Income: ${totalIncome.toFixed(2)}
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut", delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 mt-4"
      >
        <div className="relative flex-grow">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
        <Select
          value={selectedCategory || "All Categories"}
          onValueChange={handleCategoryChange}
          onOpenChange={(open) => setCategoryDropdownOpen(open)} // Handles dropdown state
        >
          <SelectTrigger
            className={`w-full sm:w-[180px] bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 transition-transform`}
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <SelectItem value="All Categories">All Categories</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Transport">Transport</SelectItem>
            <SelectItem value="Utilities">Utilities</SelectItem>
          </SelectContent>
        </Select>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant={"default"}
              className="flex items-center justify-center gap-2"
            >
              <PlusCircle className="mr-2" size={18} /> Log Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <p>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Log a new expense
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">
                    (optional)
                  </span>
                </p>
              </DialogTitle>
              <DialogDescription>
                {`Make changes to your profile here. Click save when you're done.`}
              </DialogDescription>
            </DialogHeader>
            <ExpenseForm />
          </DialogContent>
        </Dialog>
        {/* <Button
          variant={"default"}
          className="flex items-center justify-center gap-2"
          onClick={handleFormClick}
        >
          <PlusCircle className="mr-2" size={18} /> Log Expense
        </Button> */}
      </motion.div>
    </>
  );
};

export default ExpenseHeader;
