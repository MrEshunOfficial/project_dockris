"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  Todo,
  fetchTodos,
  searchTodos,
  setSelectedCategory,
  toggleTodoCompletion,
  updateTodo,
  deleteTodo,
  setSelectedTodo,
  addTodo,
} from "@/store/schedule/todoSlice";
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
  Tag,
  Filter,
  Clock,
  CheckCircle,
  Circle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const TodoList: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: todos,
    filteredItems,
    categories,
    selectedCategory,
    selectedTodo,
  } = useAppSelector((state) => state.todos);
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

  const handleEditTodo = (todo: Todo) => {
    dispatch(setSelectedTodo(todo._id));
    setIsTodoFormOpen(true);
  };

  const handleDeleteTodo = (todoId: string) => {
    dispatch(deleteTodo(todoId));
  };

  const handleToggleCompletion = (todoId: string) => {
    dispatch(toggleTodoCompletion(todoId));
  };

  const handleSaveTodo = async (todoData: Omit<Todo, "_id">) => {
    try {
      if (selectedTodo) {
        await dispatch(updateTodo({ ...todoData, _id: selectedTodo })).unwrap();
      } else {
        await dispatch(addTodo(todoData)).unwrap();
      }
      setIsTodoFormOpen(false);
      toast({
        title: "task updated successfully",
        description: "congratulations! task updated successfully",
        duration: 3000,
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to save todo:", error);
      toast({
        title: "failed to update task",
        description: "error updating task, please try again!",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  const handleSelectTodo = (todoId: string) => {
    dispatch(setSelectedTodo(todoId));
    setIsDetailsOpen(true);
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
          return moment(a.dueDate).valueOf() - moment(b.dueDate).valueOf();
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
        const dueTime = moment(todo.dueDate);
        const timeDiff = dueTime.diff(now, "hours");
        return !todo.completed && timeDiff >= 0 && timeDiff <= 2;
      })
      .sort(
        (a, b) => moment(a.dueDate).valueOf() - moment(b.dueDate).valueOf()
      );
  }, [todos]);

  return (
    <div className="flex h-full ">
      <aside className="w-72 px-2 overflow-auto flex flex-col">
        <EnhancedTodoStats stats={todoStats} />
        <UpcomingTodos todos={upcomingTodos} onSelectTodo={handleSelectTodo} />
        <Categories
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryClick={handleCategoryClick}
        />
      </aside>
      <main className="flex-1 px-2 overflow-auto">
        <Card className="border border-gray-200 dark:border-gray-600">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Todos</CardTitle>
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
          <CardContent>
            <ul className="space-y-4 mt-4">
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
          </CardContent>
        </Card>
      </main>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Todo Details</SheetTitle>
            <SheetDescription>View and edit todo details here</SheetDescription>
          </SheetHeader>
          {selectedTodo && (
            <TodoDetails
              todo={todos.find((t) => t._id === selectedTodo) as Todo}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isTodoFormOpen} onOpenChange={setIsTodoFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTodo ? "Update Todo" : "Add New Todo"}
            </DialogTitle>
          </DialogHeader>
          <TodoForm todoId={selectedTodo} onSubmit={handleSaveTodo} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TodoItemProps {
  todo: Todo;
  onToggleCompletion: (todoId: string) => void;
  onEdit: (todo: Todo) => void;
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
              todo.completed ? "line-through text-gray-500" : ""
            }`}
          >
            {todo.title}
          </h3>
          <p className="text-sm text-gray-500">
            {moment(todo.dueDate).format("MMM D, YYYY")}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge>{todo.category}</Badge>
        <Badge
          variant={
            todo.priority === "high"
              ? "destructive"
              : todo.priority === "medium"
              ? "default"
              : "secondary"
          }
        >
          {todo.priority}
        </Badge>
        {todo.tags && todo.tags.length > 0 && (
          <div className="flex items-center space-x-1">
            <Tag size={14} className="text-gray-500" />
            {todo.tags.map((tag, index) => (
              <span key={index} className="text-xs text-gray-500">
                {tag}
                {index < todo.tags.length - 1 && ","}
              </span>
            ))}
          </div>
        )}
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
  todos: Todo[];
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
            {todos.map((todo) => (
              <li
                key={todo._id}
                className="flex flex-col items-start gap-1 justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSelectTodo(todo._id)}
              >
                <span className="text-sm font-medium">{todo.title}</span>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    {moment(todo.dueDate).fromNow()}
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
