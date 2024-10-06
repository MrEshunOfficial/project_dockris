import React from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  toggleSubtaskCompletion,
  toggleTodoCompletion,
  deleteSubtask,
  Todo,
} from "@/store/schedule/todoSlice";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CalendarIcon,
  Lightbulb,
  Link,
  Star,
  Tag,
  List,
  Clock,
  Circle,
  CheckCircle,
  Square,
  SquareCheck,
  Trash2,
} from "lucide-react";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface TodoDetailsProps {
  todo: Todo | null;
  onClose: () => void;
}

const TodoDetails: React.FC<TodoDetailsProps> = ({ todo, onClose }) => {
  const dispatch = useAppDispatch();

  if (!todo) return null;

  const handleToggleSubtaskCompletion = (subtaskId: string) => {
    dispatch(toggleSubtaskCompletion({ todoId: todo._id, subtaskId }));
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    dispatch(deleteSubtask({ todoId: todo._id, subtaskId }));
  };

  const handleToggleTodoCompletion = () => {
    dispatch(toggleTodoCompletion(todo._id));
  };

  const completedSubtasks = todo.subtasks.filter(
    (subtask) => subtask.completed
  ).length;
  const totalSubtasks = todo.subtasks.length;
  const progress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <SheetContent className="flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl">
      <SheetHeader className="flex-shrink-0 pb-4 border-b border-gray-200 dark:border-gray-700">
        <SheetTitle className="flex items-center space-x-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
          <Lightbulb className="text-yellow-500 w-6 h-6 animate-pulse" />
          <h1>{todo.title}</h1>
        </SheetTitle>
        <p className="text-sm text-blue-500 font-semibold mt-2">
          {getMotivationalText()}
        </p>
      </SheetHeader>

      <div className="flex-grow overflow-y-auto py-4 space-y-6">
        <Section title="Description">
          <p className="text-gray-600 dark:text-gray-400">{todo.description}</p>
        </Section>

        <Section title="Details" className="grid grid-cols-2 gap-4">
          <DetailItem icon={<Star className="w-4 h-4" />} label="Priority">
            <Badge
              variant="outline"
              className={`${getPriorityColor(todo.priority)}`}
            >
              {todo.priority}
            </Badge>
          </DetailItem>
          <DetailItem icon={<List className="w-4 h-4" />} label="Category">
            <Badge className="bg-blue-500 text-white">{todo.category}</Badge>
          </DetailItem>
          <DetailItem
            icon={<CalendarIcon className="w-4 h-4" />}
            label="Due Date"
          >
            {moment(todo.dueDateTime).format("MMM D, YYYY")}
          </DetailItem>
          <DetailItem icon={<Clock className="w-4 h-4" />} label="Due Time">
            {moment(todo.dueDateTime).format("h:mm A")}
          </DetailItem>
        </Section>

        <Section title="Tags">
          <div className="flex flex-wrap gap-2">
            {todo.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 bg-gray-200 text-gray-700"
              >
                <Tag className="w-3 h-3" /> {tag}
              </Badge>
            ))}
          </div>
        </Section>

        <Section
          title="Focus Period"
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Duration:{" "}
            <span className="text-blue-500 font-semibold">
              {todo.estimatedDuration}
            </span>{" "}
            minutes
          </p>
          <div className="h-2 rounded-full bg-gray-300 dark:bg-gray-600">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(todo.estimatedDuration / 60) * 100}%` }}
            ></div>
          </div>
        </Section>

        <Section title="Subtasks">
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {completedSubtasks} of {totalSubtasks} completed
          </p>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
            <AnimatePresence>
              {todo.subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  onToggle={() => handleToggleSubtaskCompletion(subtask.id)}
                  onDelete={() => handleDeleteSubtask(subtask.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </Section>

        {todo.links.length > 0 && (
          <Section title="Links">
            <ul className="space-y-1 max-h-24 overflow-y-auto">
              {todo.links.map((link, index) => (
                <li key={index} className="flex items-center">
                  <Link className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Created: {moment(todo.createdAt).format("MMMM D, YYYY")}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Updated: {moment(todo.updatedAt).format("MMMM D, YYYY")}
          </p>
        </Section>
      </div>

      <div className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between gap-3">
          <Button
            onClick={handleToggleTodoCompletion}
            variant={todo.completed ? "outline" : "default"}
            className="flex-1 rounded-full"
          >
            {todo.completed ? (
              <span className="flex items-center justify-center gap-2">
                <SquareCheck size={18} /> Uncheck All
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Square size={18} /> Mark Completed
              </span>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={onClose}
            className="flex-1 rounded-full"
          >
            Close
          </Button>
        </div>
      </div>
    </SheetContent>
  );
};

const Section: React.FC<{
  title?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <section className={className}>
    {title && (
      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
        {title}
      </h3>
    )}
    {children}
  </section>
);

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}> = ({ icon, label, children }) => (
  <div className="flex items-center space-x-2">
    <div className="text-gray-400">{icon}</div>
    <div className="text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}:</span>{" "}
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {children}
      </span>
    </div>
  </div>
);

const SubtaskItem: React.FC<{
  subtask: { id: string; title: string; completed: boolean };
  onToggle: () => void;
  onDelete: () => void;
}> = ({ subtask, onToggle, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.2 }}
    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"
  >
    <button
      onClick={onToggle}
      className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
    >
      {subtask.completed ? (
        <CheckCircle className="text-green-500 w-5 h-5" />
      ) : (
        <Circle className="text-gray-300 dark:text-gray-600 w-5 h-5" />
      )}
    </button>
    <span
      className={`flex-grow transition-colors duration-300 ${
        subtask.completed
          ? "line-through text-gray-400 dark:text-gray-500"
          : "text-gray-700 dark:text-gray-300"
      }`}
    >
      {subtask.title}
    </span>
    <button
      onClick={onDelete}
      className="text-red-500 hover:text-red-700 transition-colors duration-200"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </motion.div>
);

// Helper functions (unchanged)
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

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-500 text-white";
    case "medium":
      return "bg-yellow-400 text-white";
    case "low":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-300 text-gray-700";
  }
};

export default TodoDetails;
