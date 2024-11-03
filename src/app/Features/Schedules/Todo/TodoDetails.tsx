import React from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  toggleSubtaskCompletion,
  toggleTodoCompletion,
  deleteSubtask,
} from "@/store/scheduleSlice/todoSlice";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CalendarIcon,
  Star,
  Tag,
  List,
  Clock,
  Circle,
  CheckCircle,
  Square,
  SquareCheck,
  Trash2,
  LinkIcon,
  X,
} from "lucide-react";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ITodo } from "@/models/scheduleModel/todoModel";
import Link from "next/link";

interface TodoDetailsProps {
  todo: ITodo | null;
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

  const completedSubtasks =
    todo?.subtasks?.filter((subtask) => subtask.completed).length || 0;
  const totalSubtasks = todo?.subtasks?.length || 0;
  const progress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md max-h-[90vh] overflow-auto my-2">
      <div className="p-3">
        <div className="space-y-4">
          <Section title="Description">
            <p className="text-gray-600 dark:text-gray-300">
              {todo.description}
            </p>
          </Section>

          <Section title="Details">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem icon={<Star className="w-5 h-5" />} label="Priority">
                <Badge
                  variant="outline"
                  className={`${getPriorityColor(todo.priority)}`}
                >
                  {todo.priority}
                </Badge>
              </DetailItem>
              <DetailItem icon={<List className="w-5 h-5" />} label="Category">
                <Badge className="bg-blue-500 text-white">
                  {todo.category}
                </Badge>
              </DetailItem>
              <DetailItem
                icon={<CalendarIcon className="w-5 h-5" />}
                label="Due Date"
              >
                {moment(todo.dueDateTime).format("MMM D, YYYY")}
              </DetailItem>
              <DetailItem icon={<Clock className="w-5 h-5" />} label="Due Time">
                {moment(todo.dueDateTime).format("h:mm A")}
              </DetailItem>
            </div>
          </Section>

          <Section title="Tags">
            <div className="flex flex-wrap gap-2">
              {todo.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                >
                  <Tag className="w-3 h-3" /> {tag}
                </Badge>
              ))}
            </div>
          </Section>

          <Section title="Subtasks">
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {completedSubtasks} of {totalSubtasks} completed
              </p>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {todo?.subtasks?.map((subtask) => (
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

          {todo.links && todo.links.length > 0 && (
            <Section title="Links">
              <ul className="space-y-2">
                {todo.links.map((link, index) => (
                  <li key={index} className="flex items-center">
                    <LinkIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                    <Link
                      href={link}
                      target="_blank"
                      className="text-blue-500 hover:underline truncate"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
        <div className="flex justify-between gap-4">
          <Button
            onClick={handleToggleTodoCompletion}
            variant={todo.completed ? "outline" : "default"}
            className="flex-1"
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
          <Button variant="destructive" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{
  title?: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section>
    {title && (
      <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">
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
  <div className="flex items-center space-x-3">
    <div className="text-gray-400">{icon}</div>
    <div>
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <div className="font-medium text-gray-700 dark:text-gray-200">
        {children}
      </div>
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
    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
  >
    <button
      onClick={onToggle}
      className="flex items-center space-x-3 flex-grow"
    >
      {subtask.completed ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <Circle className="w-5 h-5 text-gray-300 dark:text-gray-500" />
      )}
      <span
        className={`transition-colors duration-300 max-w-[15rem] truncate hover:w-max hover:text-wrap hover:text-start capitalize ${
          subtask.completed
            ? "line-through text-gray-400 dark:text-gray-500"
            : "text-gray-700 dark:text-gray-200"
        }`}
      >
        {subtask.title}
      </span>
    </button>
    <button
      onClick={onDelete}
      className="text-red-500 hover:text-red-700 transition-colors duration-200"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </motion.div>
);

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
