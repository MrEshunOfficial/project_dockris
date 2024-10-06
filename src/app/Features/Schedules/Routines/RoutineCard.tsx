import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Repeat,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppDispatch, RootState } from "@/store";

import {
  updateRoutine,
  deleteRoutine,
  updateCompletionStatus,
  handleStatusChange,
  selectRoutineCompletionHistory,
  selectTodayCompletionStatus,
} from "@/store/schedule/routineSlice";

import { RoutineDocument, RoutineStatus } from "@/store/types/routine";
import RoutineForm from "./RoutineForm";
import moment from "moment";

interface RoutineCardProps {
  routine: RoutineDocument;
}

const DayBadge: React.FC<{ day: string; active: boolean }> = ({
  day,
  active,
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <Badge
          variant={active ? "default" : "outline"}
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            active
              ? "bg-blue-500 text-white dark:bg-blue-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {day}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {active ? "Active" : "Inactive"} on{" "}
          {
            [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ][["S", "M", "T", "W", "T", "F", "S"].indexOf(day)]
          }
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const RoutineCard: React.FC<RoutineCardProps> = ({ routine }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const todayCompletionStatus = useSelector((state: RootState) =>
    selectTodayCompletionStatus(state, routine._id as string)
  );

  const toggleExpand = () => setExpanded(!expanded);

  const handleEdit = () => {
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteRoutine(routine._id as string)).unwrap();
    } catch (error) {
      console.error("Failed to delete routine:", error);
      setError("Failed to delete routine. Please try again.");
    }
  };

  const onStatusChange = async (newStatus: RoutineStatus) => {
    try {
      await dispatch(
        handleStatusChange({ routineId: routine._id as string, newStatus })
      ).unwrap();
      setError(null);
    } catch (error) {
      console.error("Failed to update routine status:", error);
      setError("Failed to update routine status. Please try again.");
    }
  };

  const handleCompletionToggle = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await dispatch(
        updateCompletionStatus({
          routineId: routine._id,
          date: today,
          completed: !todayCompletionStatus,
        })
      ).unwrap();
      setError(null);
    } catch (error) {
      console.error("Failed to update completion status:", error);
      setError("Failed to update completion status. Please try again.");
    }
  };

  const renderFrequency = () => {
    switch (routine.frequency) {
      case "daily":
        return "Daily";
      case "weekly":
        return (
          <div className="flex items-center space-x-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <DayBadge
                key={day}
                day={day}
                active={routine.daysOfWeek.includes(index)}
              />
            ))}
          </div>
        );
      case "monthly":
        const dayOfMonth = routine.monthlyDate || 1;
        const ordinal = (n: number) => {
          const s = ["th", "st", "nd", "rd"];
          const v = n % 100;
          return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        return `${ordinal(dayOfMonth)} day of every month`;
      default:
        return routine.frequency;
    }
  };
  const handleFormSubmit = async (updatedRoutine: RoutineDocument) => {
    try {
      await dispatch(updateRoutine(updatedRoutine)).unwrap();
      setIsDialogOpen(false);
      setError(null);
    } catch (error) {
      console.error("Failed to update routine:", error);
      setError("Failed to update routine. Please try again.");
    }
  };

  // Determine card border color based on completion status
  const cardBorderColor = todayCompletionStatus
    ? "border-l-green-500 dark:border-l-green-400"
    : "border-l-blue-500 dark:border-l-blue-400";

  const completionHistory = useSelector((state: RootState) =>
    selectRoutineCompletionHistory(state, routine._id as string, 7)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`overflow-hidden border-l-4 ${cardBorderColor} hover:shadow-lg transition-shadow duration-300 dark:bg-gray-900`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {routine.reminderMinutes > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Reminder set for {routine.reminderMinutes} minutes
                        before
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <CardTitle className="text-xl font-semibold dark:text-white">
                {routine.name}
              </CardTitle>
            </div>
            <Badge
              variant={routine.status === "active" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() =>
                onStatusChange(
                  routine.status === "active" ? "paused" : "active"
                )
              }
            >
              {routine.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>
                {new Date(routine.startTime).toLocaleTimeString()} -{" "}
                {new Date(routine.endTime).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Repeat className="w-4 h-4" />
              <span>{renderFrequency()}</span>
            </div>
            {routine.category && (
              <Badge variant="outline" className="w-fit">
                {routine.category}
              </Badge>
            )}
            {routine.tags && routine.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {routine.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <p className="text-gray-600 dark:text-gray-300">
                  {routine.description}
                </p>
                <div className="mt-4 flex space-x-2">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Routine</DialogTitle>
                        <DialogDescription>
                          {`Make changes to your routine here. Click save when
                          you're done.`}
                        </DialogDescription>
                      </DialogHeader>
                      <RoutineForm
                        existingRoutine={routine}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant={todayCompletionStatus ? "default" : "outline"}
                    size="sm"
                    onClick={handleCompletionToggle}
                  >
                    {todayCompletionStatus ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    {todayCompletionStatus ? "Completed" : "Mark Complete"}
                  </Button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <CompletionHistory history={completionHistory} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            className="w-full justify-center"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                More
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const CompletionHistory: React.FC<{
  history: { date: string; completed: boolean }[];
}> = ({ history }) => (
  <div className="flex space-x-1 mt-4">
    {history.map(({ date, completed }) => (
      <TooltipProvider key={date}>
        <Tooltip>
          <TooltipTrigger>
            <div
              className={`w-6 h-6 rounded-full ${
                completed
                  ? "bg-green-500 border border-white"
                  : "border border-red-600"
              }`}
            ></div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="flex items-center gap-2">
              <span>{moment(date).format("DD/MMM")},</span>
              <span>{completed ? "Completed" : "Missed"}</span>
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ))}
  </div>
);
export default RoutineCard;
