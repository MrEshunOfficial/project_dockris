import React from "react";
import { useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import moment from "moment";

import {
  selectFilteredAndSortedExpenses,
  selectUpcomingRecurringExpenses,
} from "@/store/finances/expenseSlice";

const ExpenditureSummary = () => {
  const expenses = useSelector(selectFilteredAndSortedExpenses);
  const upcomingRecurringExpenses = useSelector(
    selectUpcomingRecurringExpenses
  );

  const currentMonth = moment().format("MMMM YYYY");
  const previousMonth = moment().subtract(1, "month").format("MMMM YYYY");

  const currentMonthExpenses = expenses.filter(
    (expense) => moment(expense.dateSpent).format("MMMM YYYY") === currentMonth
  );
  const previousMonthExpenses = expenses.filter(
    (expense) => moment(expense.dateSpent).format("MMMM YYYY") === previousMonth
  );

  const currentMonthTotal = currentMonthExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const previousMonthTotal = previousMonthExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const monthlyDifference = currentMonthTotal - previousMonthTotal;

  const dailyExpenses = currentMonthExpenses.reduce(
    (acc: { [key: string]: number }, expense) => {
      const date = moment(expense.dateSpent).format("DD");
      acc[date] = (acc[date] || 0) + expense.amount;
      return acc;
    },
    {}
  );

  const chartData = Object.entries(dailyExpenses)
    .map(([day, amount]) => ({
      day: parseInt(day),
      amount: amount,
    }))
    .sort((a, b) => a.day - b.day);

  return (
    <Card className="w-full border-0.5 border-gray-300 dark:border-gray-600">
      <CardHeader>
        <CardTitle className="text-md flex flex-col justify-between items-start">
          Monthly Expense Summary
          <span className="text-gray-500 text-sm">
            Last updated: {moment().fromNow()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">{currentMonth}</h3>
              <p className="text-2xl font-bold text-green-600">
                ${currentMonthTotal.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">{previousMonth}</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${previousMonthTotal.toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Month-over-Month Change</h3>
            <p
              className={`text-xl font-bold ${
                monthlyDifference < 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {monthlyDifference < 0 ? "-" : "+"}$
              {Math.abs(monthlyDifference).toFixed(2)}
            </p>
          </div>

          <div className="flex flex-col items-start justify-center">
            <h3 className="font-semibold mb-2">Daily Expenses This Month</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col items-start justify-center">
            <h3 className="font-semibold mb-2">Upcoming Recurring Expenses</h3>
            <ScrollArea className="h-[150px] w-full rounded-md border border-gray-300 dark:border-gray-600">
              {upcomingRecurringExpenses.map((expense, index) => (
                <motion.div
                  key={expense._id as string}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex justify-between items-center"
                >
                  <span>{expense.name}</span>
                  <span className="font-bold text-red-600">
                    ${expense.amount.toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenditureSummary;
