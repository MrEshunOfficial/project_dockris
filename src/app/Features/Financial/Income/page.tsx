"use client";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Trash2,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  selectFilteredAndSortedIncomes,
  selectTotalIncome,
  setSearchTerm,
  setSortBy,
  deleteIncome,
  Income,
} from "@/store/finances/incomeSlice";
import { AppDispatch, RootState } from "@/store";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import IncomeForm from "./IncomeForm";
import { BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";

export default function IncomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const incomes = useSelector(selectFilteredAndSortedIncomes);
  const totalIncome = useSelector(selectTotalIncome);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const chartData = useMemo(() => {
    return incomes
      .map((income) => ({
        date: new Date(income.dateReceived).toLocaleDateString(),
        amount: income.amount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [incomes]);

  const handleDeleteIncome = (id: string) => {
    dispatch(deleteIncome(id));
  };

  const handleEditIncome = (income: Income) => {
    setIncomeToEdit(income);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIncomeToEdit(null);
    setIsEditDialogOpen(false);
  };

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="w-full sticky top-0 backdrop-blur-lg bg-opacity-50 z-10">
        <h1 className="text-3xl font-bold mb-2">Income Dashboard</h1>
        <p className="leading-7 [&:not(:first-child)]:my-2">
          Manage your income sources, track your progress, and make informed
          decisions about your budget.
        </p>
        <div className="w-full">
          <Header />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 space-y-6">
          <IncomeOverviewChart chartData={chartData} />
          <RecentIncomes
            incomes={incomes}
            onDelete={handleDeleteIncome}
            onEdit={handleEditIncome}
          />
        </div>
        <div className="space-y-6">
          <IncomeStatistics incomes={incomes} totalIncome={totalIncome} />
          <UpcomingRecurringIncome
            incomes={incomes}
            onDelete={handleDeleteIncome}
            onEdit={handleEditIncome}
          />
          <IncomeHistory
            incomes={incomes}
            onDelete={handleDeleteIncome}
            onEdit={handleEditIncome}
          />
        </div>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
            <DialogDescription>
              Update the details of your income.
            </DialogDescription>
          </DialogHeader>
          <IncomeForm
            incomeToEdit={incomeToEdit}
            onClose={handleCloseEditDialog}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const IncomeOverviewChart: React.FC<{ chartData: any }> = ({ chartData }) => {
  const [chartType, setChartType] = useState("line");
  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#8884d8" />
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="date"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      default:
        return null;
    }
  };

  const chart = renderChart(); // Cache the result of renderChart

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="my-2">Income Overview</CardTitle>
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger className="w-1/2 justify-items-end">
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent className="border-none">
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chart ? (
          <ResponsiveContainer width="100%" height={300}>
            {chart}
          </ResponsiveContainer>
        ) : (
          <div>No chart available</div> // Fallback when no chart is returned
        )}
      </CardContent>
    </Card>
  );
};

interface RecentIncomesProps {
  incomes: Income[];

  onDelete: (id: string) => void;
  onEdit: (income: Income) => void;
}

const RecentIncomes: React.FC<RecentIncomesProps> = ({
  incomes,
  onDelete,
  onEdit,
}) => {
  const { currentUser } = useSelector((state: RootState) => state.auth);
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight animate-pulse">
            Most Recent Incomes
          </h3>
          <blockquote className="mt-6 border-l-2 pl-6 italic relative">
            <span className="text-sm text-gray-500">
              {incomes.slice(0, 3).length} items
            </span>
            <span className="block mt-1 text-base font-medium text-blue-500">
              A penny saved is a penny earned.
            </span>
            <span className="absolute right-0 text-xs text-gray-400 top-0">
              - {currentUser?.name}
            </span>
          </blockquote>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {incomes.slice(0, 3).map((income) => (
            <IncomeListItem
              key={income._id}
              income={income}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const IncomeListItem: React.FC<{
  income: Income;
  onDelete: (id: string) => void;
  onEdit: (income: Income) => void;
}> = ({ income, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <li className="border p-2 rounded-md">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2 items-start">
          <h3 className="font-semibold">{income.name}</h3>
          <p className="leading-7 [&:not(:first-child)]">
            {income.currency} {income.amount.toFixed(2)}
          </p>
          <small className="text-sm text-gray-500">
            {moment(income.dateReceived).format("DD/MMM, YYYY hh:mm a")}
          </small>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(income)}>
            <Edit size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(income._id)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 space-y-2">
          <p>
            <strong>Source:</strong> {income.sources}
          </p>
          <p>
            <strong>Category:</strong> {income.category}
          </p>
          <p>
            <strong>Description:</strong> {income.description || "N/A"}
          </p>
          <p>
            <strong>Recurring:</strong>{" "}
            {income.recurringIncome ? `Yes (${income.frequency})` : "No"}
          </p>
          <p>
            <strong>Taxable:</strong> {income.isTaxable ? "Yes" : "No"}
          </p>
          {income.isTaxable && (
            <p>
              <strong>Tax Deductions:</strong> {income.currency}{" "}
              {income.taxDeductions?.toFixed(2)}
            </p>
          )}
          <p>
            <strong>Payment Method:</strong> {income.paymentMethod}
          </p>
          <div>
            <strong>Tags:</strong>{" "}
            {income.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="mr-1">
                {tag}
              </Badge>
            ))}
          </div>
          {income.attachments && income.attachments.length > 0 && (
            <div>
              <strong>Attachments:</strong>
              <ul className="list-disc list-inside">
                {income.attachments.map((url, index) => (
                  <li key={index}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      <Paperclip size={14} className="inline mr-1" />
                      Attachment {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

const IncomeStatistics: React.FC<{
  incomes: Income[];
  totalIncome: number;
}> = ({ incomes, totalIncome }) => {
  const taxableIncome = incomes.reduce(
    (sum, income) => (income.isTaxable ? sum + income.amount : sum),
    0
  );
  const totalTaxDeductions = incomes.reduce(
    (sum, income) => sum + (income.taxDeductions || 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          Total Income:
          <span className="font-semibold ml-2">${totalIncome.toFixed(2)}</span>
        </p>
        <p>
          Number of Incomes:
          <span className="font-semibold ml-2">{incomes.length}</span>
        </p>
        <p>
          Average Income:
          <span className="font-semibold ml-2">
            ${(totalIncome / incomes.length || 0).toFixed(2)}
          </span>
        </p>
        <p>
          Taxable Income:
          <span className="font-semibold ml-2">
            ${taxableIncome.toFixed(2)}
          </span>
        </p>
        <p>
          Total Tax Deductions:
          <span className="font-semibold ml-2">
            ${totalTaxDeductions.toFixed(2)}
          </span>
        </p>
      </CardContent>
    </Card>
  );
};

const UpcomingRecurringIncome: React.FC<{
  incomes: Income[];
  onDelete: (id: string) => void;
  onEdit: (income: Income) => void;
}> = ({ incomes, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const recurringIncomes = incomes.filter((income) => income.recurringIncome);
  const today = new Date();

  const upcomingIncomes = recurringIncomes.filter((income) => {
    const nextPaymentDate = new Date(income.dateReceived);
    return nextPaymentDate > today;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Upcoming Recurring Income</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingIncomes.length === 0 ? (
          <p>No upcoming payments expected.</p>
        ) : (
          <ul className="space-y-4">
            {upcomingIncomes
              .slice(0, isExpanded ? undefined : 3)
              .map((income) => (
                <IncomeListItem
                  key={income._id}
                  income={income}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
          </ul>
        )}
        {recurringIncomes.length > 3 && !isExpanded && (
          <Button variant="link" onClick={() => setIsExpanded(true)}>
            Show all recurring incomes
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const IncomeHistory: React.FC<{
  incomes: Income[];
  onDelete: (id: string) => void;
  onEdit: (income: Income) => void;
}> = ({ incomes, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const sortedIncomes = [...incomes].sort(
    (a, b) =>
      new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Income History</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="border-none">
        <ul className="my-3 list-disc [&>li]:mt-2">
          {sortedIncomes.slice(0, isExpanded ? undefined : 5).map((income) => (
            <IncomeListItem
              key={income._id}
              income={income}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </ul>
        {incomes.length > 5 && !isExpanded && (
          <Button variant="link" onClick={() => setIsExpanded(true)}>
            Show all incomes
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const Header = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleSort = (key: keyof Income) => {
    dispatch(setSortBy(key));
  };

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4"
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort & Filter</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSort("name")}>
              Sort by Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("dateReceived")}>
              Sort by Date
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("amount")}>
              Sort by Amount
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Income
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new Income</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new income.
            </DialogDescription>
          </DialogHeader>
          <IncomeForm />
        </DialogContent>
      </Dialog>
    </header>
  );
};
