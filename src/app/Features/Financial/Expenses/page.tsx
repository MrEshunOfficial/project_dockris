"use client";
import React, { useState } from "react";

import { motion } from "framer-motion";
import ExpenseHeader from "./ExpenseHeader";
import ExpenseAnalytics from "./ExpenseAnalytics";
import ExpenditureSummary from "./ExpenditureSummary";
import {
  EnhancedExpenseHistoryCard,
  EnhancedRecentExpensesCard,
} from "./ExpenseContent";
import SamplePage from "./SamplePage";
import { X } from "lucide-react";

const ExpenseList: React.FC<{}> = () => {
  const [showForm, setShowForm] = useState(false);

  const handleFormClick = () => {
    setShowForm((prev) => !prev);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col items-center justify-center gap-1"
    >
      <header className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between">
        <ExpenseHeader handleFormClick={handleFormClick} />
      </header>
      <section className="w-full flex-1 flex items-center justify-center gap-2 relative">
        <div className="w-1/3 h-full flex border border-gray-300 dark:border-gray-600 rounded-lg">
          <ExpenseAnalytics />
        </div>
        <div className="flex-1 h-full flex flex-col border border-gray-300 dark:border-gray-600 rounded-lg p-2 gap-2">
          <EnhancedRecentExpensesCard />
          <EnhancedExpenseHistoryCard />
        </div>
        <div className="w-1/4 h-full flex border border-gray-300 dark:border-gray-600 rounded-lg">
          <ExpenditureSummary />
        </div>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <SamplePage />
          </motion.div>
        )}
      </section>
    </motion.main>
  );
};

export default ExpenseList;
