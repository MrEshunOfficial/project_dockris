import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  selectFilteredAndSortedExpenses,
  setSearchTerm,
  setSelectedCategory,
} from "@/store/finances/expenseSlice";
import { ExpenseDocument } from "@/models/financeModel/expenseModel";

const CHART_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
];

type ChartType = "line" | "bar" | "pie";
type TimeRange = "week" | "month" | "year";

const ExpenseAnalytics: React.FC = () => {
  const dispatch = useDispatch();
  const expenses = useSelector(selectFilteredAndSortedExpenses);
  const [chartType, setChartType] = useState<ChartType>("line");
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    dispatch(setSearchTerm(searchFilter));
  }, [dispatch, searchFilter]);

  useEffect(() => {
    dispatch(setSelectedCategory(categoryFilter));
  }, [dispatch, categoryFilter]);

  const processChartData = useCallback(
    (range: TimeRange) => {
      const groupedData: { [key: string]: { date: string; amount: number } } =
        {};
      const format = getDateFormat(range);

      expenses.forEach((expense) => {
        const date = moment(expense.dateSpent).format(format);
        if (!groupedData[date]) {
          groupedData[date] = { date, amount: 0 };
        }
        groupedData[date].amount += expense.amount;
      });

      return Object.values(groupedData).sort((a, b) =>
        moment(a.date, format).diff(moment(b.date, format))
      );
    },
    [expenses]
  );

  const getDateFormat = (range: TimeRange): string => {
    switch (range) {
      case "week":
        return "dddd";
      case "month":
        return "MMM DD";
      case "year":
        return "MMM YYYY";
    }
  };

  const getDateKey = (range: TimeRange): string => {
    switch (range) {
      case "week":
        return "isoWeek";
      case "month":
        return "date";
      case "year":
        return "month";
    }
  };

  const data = useMemo(
    () => processChartData(timeRange),
    [processChartData, timeRange]
  );

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval={"preserveStartEnd"}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval={"preserveStartEnd"}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar dataKey="amount" fill="#8884d8">
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="date"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
            />
          </PieChart>
        );
    }
  };

  const calculateComparisons = () => {
    const now = moment();
    const currentWeekExpenses = expenses.filter((e) =>
      moment(e.dateSpent).isSame(now, "week")
    );
    const lastWeekExpenses = expenses.filter((e) =>
      moment(e.dateSpent).isSame(now.clone().subtract(1, "week"), "week")
    );
    const currentMonthExpenses = expenses.filter((e) =>
      moment(e.dateSpent).isSame(now, "month")
    );
    const lastMonthExpenses = expenses.filter((e) =>
      moment(e.dateSpent).isSame(now.clone().subtract(1, "month"), "month")
    );
    const currentYearExpenses = expenses.filter((e) =>
      moment(e.dateSpent).isSame(now, "year")
    );
    const lastYearExpenses = expenses.filter((e) =>
      moment(e.dateSpent).isSame(now.clone().subtract(1, "year"), "year")
    );

    const calculateTotal = (expenseList: ExpenseDocument[]) =>
      expenseList.reduce((sum, e) => sum + e.amount, 0);

    return {
      weekly: {
        current: calculateTotal(currentWeekExpenses),
        previous: calculateTotal(lastWeekExpenses),
      },
      monthly: {
        current: calculateTotal(currentMonthExpenses),
        previous: calculateTotal(lastMonthExpenses),
      },
      yearly: {
        current: calculateTotal(currentYearExpenses),
        previous: calculateTotal(lastYearExpenses),
      },
    };
  };

  const comparisons = useMemo(calculateComparisons, [expenses]);

  const renderComparison = (
    current: number,
    previous: number,
    period: string
  ) => {
    const diff = current - previous;
    const percentChange = previous !== 0 ? (diff / previous) * 100 : 0;
    const isIncrease = diff > 0;

    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{period} Comparison</h3>
        <p>Current: ${current.toFixed(2)}</p>
        <p>Previous: ${previous.toFixed(2)}</p>
        <p className={isIncrease ? "text-red-500" : "text-green-500"}>
          {isIncrease ? "Increase" : "Decrease"} of ${Math.abs(diff).toFixed(2)}{" "}
          ({Math.abs(percentChange).toFixed(2)}%)
        </p>
      </div>
    );
  };

  const generateInsights = () => {
    const insights = [];

    if (comparisons.weekly.current > comparisons.weekly.previous) {
      insights.push(
        "Your spending this week is higher than last week. Consider reviewing your expenses to stay on budget."
      );
    } else {
      insights.push(
        "Great job! You've managed to spend less this week compared to last week."
      );
    }

    if (comparisons.monthly.current > comparisons.monthly.previous) {
      insights.push(
        "Your monthly expenses have increased. It might be worth checking if there are any unnecessary expenses you can cut back on."
      );
    } else {
      insights.push(
        "Your monthly spending is lower than last month. Keep up the good work!"
      );
    }

    if (comparisons.yearly.current > comparisons.yearly.previous) {
      insights.push(
        "Your yearly expenses are trending upwards. Consider setting a budget to manage your long-term financial goals."
      );
    } else {
      insights.push(
        "You're doing well in managing your yearly expenses. This is great for your long-term financial health!"
      );
    }

    return insights;
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const averageExpense =
    expenses.length > 0 ? totalExpenses / expenses.length : 0;

  return (
    <Card className="w-full h-full border-0.5 border-gray-300 dark:border-gray-600">
      <CardHeader>
        <CardTitle className="flex flex-col">
          <h1 className="scroll-m-20 pb-1 text-3xl font-semibold tracking-tight">
            Expense Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize and analyze your spending patterns
          </p>
        </CardTitle>
        <div className="flex flex-wrap gap-4 mt-4">
          <Select
            value={chartType}
            onValueChange={(value: ChartType) => setChartType(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={timeRange}
            onValueChange={(value: TimeRange) => setTimeRange(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="w-full">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full mb-3 flex items-center justify-center gap-2">
            <TabsTrigger className="flex-1" value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="comparisons">
              Comparisons
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="insights">
              Insights
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="w-full h-[300px]">
              <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
            </div>
            {data.length === 0 && (
              <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">
                  No expense data available for the selected criteria.
                </p>
              </div>
            )}
            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span>Total Expenses:</span>
                <span className="font-semibold">
                  ${totalExpenses.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average Expense:</span>
                <span className="font-semibold">
                  ${averageExpense.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Number of Expenses:</span>
                <span className="font-semibold">{expenses.length}</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="comparisons">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderComparison(
                comparisons.weekly.current,
                comparisons.weekly.previous,
                "Weekly"
              )}
              {renderComparison(
                comparisons.monthly.current,
                comparisons.monthly.previous,
                "Monthly"
              )}
              {renderComparison(
                comparisons.yearly.current,
                comparisons.yearly.previous,
                "Yearly"
              )}
            </div>
          </TabsContent>
          <TabsContent value="insights">
            <ul className="list-disc pl-5 space-y-2">
              {generateInsights().map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExpenseAnalytics;
