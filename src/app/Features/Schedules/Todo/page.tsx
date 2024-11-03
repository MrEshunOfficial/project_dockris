"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  PlusCircle,
  Filter,
  Clock,
  CheckCircle,
  Circle,
  Lightbulb,
  BellIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import TodoForm from "./TodoForm";
import TodoDetails from "./TodoDetails";
import moment from "moment";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  searchTodos,
  setSelectedCategory,
  toggleTodoCompletion,
  updateTodo,
  deleteTodo,
  setSelectedTodo,
} from "@/store/scheduleSlice/todoSlice";

import { ITodo } from "@/models/scheduleModel/todoModel";
import { ENTITY_TYPES } from "@/constants/entityTypes";
import { deleteReminder, selectAllReminders } from "@/store/reminderSlice";
import ReminderIndicator from "@/app/reminder-component/ReminderIndicator";
import { FaCalendarAlt, FaInfo } from "react-icons/fa";

const TodoList: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: todos,
    filteredItems,
    categories,
    selectedCategory,
    selectedTodo,
  } = useAppSelector((state) => state.todos);

  // Fetch all reminders at the component level
  const allReminders = useAppSelector(selectAllReminders);

  const [searchTerm, setSearchTerm] = useState("");
  const [isTodoFormOpen, setIsTodoFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "active"
  >("all");
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  useEffect(() => {
    dispatch(searchTodos(searchTerm));
  }, [dispatch, searchTerm]);

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDate.toLocaleString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const handleCategoryClick = (category: string) => {
    dispatch(
      setSelectedCategory(category === selectedCategory ? null : category)
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddTodo = () => {
    dispatch(setSelectedTodo(null));
    setIsTodoFormOpen(true);
  };

  const handleEditTodo = (todo: ITodo) => {
    dispatch(setSelectedTodo(todo._id));
    setIsTodoFormOpen(true);
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      // Find the associated reminder
      const reminder = allReminders.find(
        (r) => r.entityType === ENTITY_TYPES.TODO && r.entityId === todoId
      );

      // Delete the todo
      await dispatch(deleteTodo(todoId)).unwrap();

      // If there's an associated reminder, delete it
      if (reminder) {
        await dispatch(deleteReminder(reminder._id)).unwrap();
      }

      toast({
        title: "Todo and associated reminder deleted",
        description:
          "The todo and its reminder have been successfully deleted.",
        duration: 3000,
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to delete todo and/or reminder:", error);
      toast({
        title: "Failed to delete task",
        description:
          "Error deleting task and/or its reminder. Please try again!",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  const handleToggleCompletion = (todoId: string) => {
    dispatch(toggleTodoCompletion(todoId));
  };

  const handleSaveTodo = async (todoData: Omit<ITodo, "_id">) => {
    try {
      if (selectedTodo) {
        await dispatch(updateTodo({ _id: selectedTodo, ...todoData })).unwrap();
        setIsTodoFormOpen(false);
        dispatch(setSelectedTodo(null));
        toast({
          title: "Task updated successfully",
          description: "Congratulations! Task updated successfully",
          duration: 3000,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to save todo:", error);
      toast({
        title: "Failed to update task",
        description: "Error updating task, please try again!",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  const handleSelectTodo = (todoId: string) => {
    dispatch(setSelectedTodo(todoId));
    setIsDetailsOpen(true);
  };

  const getMotivationalText = () => {
    const phrases = [
      "Let's make today legendary!",
      "Onwards to greatness!",
      "One step closer to success!",
      "You've got this!",
      "Stay awesome and focused!",
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  const sortedAndFilteredTodos = useMemo(() => {
    return [...filteredItems]
      .filter((todo) => {
        if (filterStatus === "completed") return todo.completed;
        if (filterStatus === "active") return !todo.completed;
        return true;
      })
      .filter((todo) => !filterPriority || todo.priority === filterPriority)
      .sort((a, b) => {
        if (a.completed === b.completed) {
          return (
            moment(a.dueDateTime).valueOf() - moment(b.dueDateTime).valueOf()
          );
        }
        return a.completed ? 1 : -1;
      });
  }, [filteredItems, filterStatus, filterPriority]);

  const todoStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const active = total - completed;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, active, completionPercentage };
  }, [todos]);

  const upcomingTodos = useMemo(() => {
    const now = moment();
    return todos
      .filter((todo) => {
        const dueTime = moment(todo.dueDateTime);
        const timeDiff = dueTime.diff(now, "hours");
        return !todo.completed && timeDiff >= 0 && timeDiff <= 2;
      })
      .sort(
        (a, b) =>
          moment(a.dueDateTime).valueOf() - moment(b.dueDateTime).valueOf()
      );
  }, [todos]);

  return (
    <div className="flex h-full ">
      <main className="flex-1 px-2 overflow-auto">
        <Card className="h-full flex flex-col gap-2 border border-gray-200 dark:border-gray-600">
          <CardHeader className="flex border-b flex-row items-center justify-between">
            <div className="flex flex-col gap-2 items-start">
              <CardTitle className="text-lg">Make today Count ... 😊</CardTitle>
              <small>{formattedDate}</small>
            </div>
            <div className="w-max flex items-center justify-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded-full px-4 py-2 font-bold flex items-center"
                  >
                    <FaInfo className="mr-2" />
                    Overview
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[22rem] flex flex-col p-2 border-gray-300 dark:border-gray-700"
                >
                  <SheetHeader className="my-3">
                    <SheetTitle>Routine</SheetTitle>
                    <SheetDescription>
                      Edit routine details and settings.
                    </SheetDescription>
                  </SheetHeader>
                  <aside className="w-full px-2 overflow-auto flex flex-col">
                    <EnhancedTodoStats stats={todoStats} />
                    <UpcomingTodos
                      todos={upcomingTodos}
                      onSelectTodo={handleSelectTodo}
                    />
                    <Categories
                      categories={categories}
                      selectedCategory={selectedCategory}
                      onCategoryClick={handleCategoryClick}
                    />
                  </aside>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search todos..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-64"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("completed")}
                  >
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Priority</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setFilterPriority(null)}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("low")}>
                    Low
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("medium")}>
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("high")}>
                    High
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleAddTodo}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Todo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="w-full flex-grow overflow-auto p-2">
            {todos.length === 0 ? (
              <div className="text-center py-8">No todos found</div>
            ) : (
              <ul className="space-y-4 mt-4 h-[60vh] overflow-auto">
                {sortedAndFilteredTodos.map((todo) => (
                  <TodoItem
                    key={todo._id}
                    todo={todo}
                    onToggleCompletion={handleToggleCompletion}
                    onEdit={handleEditTodo}
                    onDelete={handleDeleteTodo}
                    onSelect={handleSelectTodo}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="border-none p-2">
          <SheetHeader className="my-2 mb-2">
            <SheetDescription>
              <div className="flex items-center space-x-2 text-xl font-bold text-gray-800 dark:text-gray-100">
                {todos.map((todo) => {
                  if (todo._id === selectedTodo) {
                    return <h1 key={todo._id}>{todo.title}</h1>;
                  }
                })}
              </div>
              <p className="text-sm text-blue-500 font-semibold mt-2 flex items-center gap-2 ">
                <Lightbulb
                  size={16}
                  className="text-yellow-500 animate-pulse"
                />{" "}
                {getMotivationalText()}
              </p>
            </SheetDescription>
          </SheetHeader>
          {selectedTodo && (
            <TodoDetails
              todo={todos.find((t) => t._id === selectedTodo) as ITodo}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isTodoFormOpen} onOpenChange={setIsTodoFormOpen}>
        <DialogContent className="dark:border-gray-700 border-gray-300 w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-gray-500 border-b pb-2 dark:border-gray-700 border-gray-300">
              {selectedTodo ? "Update Task" : "Add New Task"}
            </DialogTitle>
          </DialogHeader>
          <TodoForm todoId={selectedTodo} onSubmit={handleSaveTodo} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TodoItemProps {
  todo: ITodo;
  onToggleCompletion: (todoId: string) => void;
  onEdit: (todo: ITodo) => void;
  onDelete: (todoId: string) => void;
  onSelect: (todoId: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleCompletion,
  onEdit,
  onDelete,
  onSelect,
}) => {
  // Add reminder selector
  const reminder = useAppSelector((state) =>
    selectAllReminders(state).find(
      (r) => r.entityType === ENTITY_TYPES.TODO && r.entityId === todo._id
    )
  );

  return (
    <li className="flex items-center justify-between p-4 shadow my-3 border border-gray-200 dark:border-gray-600 rounded-lg">
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggleCompletion(todo._id)}
        />
        <div>
          <h3
            className={`font-medium capitalize ${
              todo.completed ? "line-through text-gray-500" : "text-inherit"
            }`}
          >
            {todo.title}
          </h3>
          <p className="text-sm text-gray-500 flex items-center justify-start gap-2">
            <FaCalendarAlt />
            {moment(todo.dueDateTime).format("MMM D, YYYY")}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <ReminderIndicator todo={todo} reminder={reminder} />
        <Button variant="ghost" size="sm" onClick={() => onSelect(todo._id)}>
          <MoreHorizontal size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(todo)}>
          <Edit size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(todo._id)}>
          <Trash2 size={18} />
        </Button>
      </div>
    </li>
  );
};

interface CategoriesProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryClick: (category: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({
  categories,
  selectedCategory,
  onCategoryClick,
}) => {
  return (
    <Card className="flex-grow border border-gray-200 dark:border-gray-600">
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category}>
              <Button
                variant={selectedCategory === category ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => onCategoryClick(category)}
              >
                {category}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

interface UpcomingTodosProps {
  todos: ITodo[];
  onSelectTodo: (todoId: string) => void;
}

const UpcomingTodos: React.FC<UpcomingTodosProps> = ({
  todos,
  onSelectTodo,
}) => {
  return (
    <Card className="mb-4 border border-gray-200 dark:border-gray-600">
      <CardHeader>
        <CardTitle>Upcoming Todos</CardTitle>
      </CardHeader>
      <CardContent>
        {todos.length === 0 ? (
          <p className="text-sm text-gray-500">
            No upcoming todos in the next 2 hours.
          </p>
        ) : (
          <ul className="space-y-2">
            {todos.slice(0, 3).map((todo) => (
              <li
                key={todo._id}
                className="flex flex-col items-start gap-1 justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSelectTodo(todo._id)}
              >
                <span className="text-sm font-medium">{todo.title}</span>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    {moment(todo.dueDateTime).fromNow()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

interface EnhancedTodoStatsProps {
  stats: {
    total: number;
    completed: number;
    active: number;
    completionPercentage: number;
  };
}
const EnhancedTodoStats: React.FC<EnhancedTodoStatsProps> = ({ stats }) => {
  return (
    <Card className="mb-4 border border-gray-200 dark:border-gray-600">
      <CardHeader>
        <CardTitle>Todo Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total</span>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Completed</span>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-2xl font-bold text-green-500">
                {stats.completed}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Active</span>
            <div className="flex items-center">
              <Circle className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-2xl font-bold text-blue-500">
                {stats.active}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">
                {stats.completionPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={stats.completionPercentage} className="w-full" />
          </div>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  );
};

export default TodoList;
