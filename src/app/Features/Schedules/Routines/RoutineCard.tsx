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
  CircleCheck,
  Circle,
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
  updateRoutineStatus,
  selectRoutineById,
  selectTodayCompletionStatus,
  RoutineStatus,
  Frequency,
} from "@/store/scheduleSlice/routineSlice";
import RoutineForm from "./RoutineForm";
import moment from "moment";
import { FaFire } from "react-icons/fa";
import ReminderIndicator from "@/app/reminder-component/ReminderIndicator";
import { deleteReminder, selectAllReminders } from "@/store/reminderSlice";
import { ENTITY_TYPES } from "@/constants/entityTypes";
import { useAppSelector } from "@/store/hooks";
import { toast } from "@/components/ui/use-toast";
import { IRoutine } from "@/store/type/routine";

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

interface RoutineCardProps {
  routineId: string;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routineId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const routine = useSelector((state: RootState) =>
    selectRoutineById(state, routineId)
  );
  const todayCompletionStatus = useSelector((state: RootState) =>
    selectTodayCompletionStatus(state, routineId)
  );

  const reminder = useAppSelector((state) =>
    selectAllReminders(state).find(
      (r) => r.entityType === ENTITY_TYPES.ROUTINE && r.entityId === routineId
    )
  );

  const toggleExpand = () => setExpanded(!expanded);
  const allReminders = useAppSelector(selectAllReminders);

  if (!routine) {
    return null;
  }

  const handleDelete = async () => {
    try {
      const reminder = allReminders.find(
        (r) =>
          r.entityType === ENTITY_TYPES.ROUTINE &&
          r?.entityId?.toString() === routineId
      );
      await dispatch(deleteRoutine(routineId)).unwrap();
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
      setError(null);
    } catch (error) {
      setError("Failed to delete routine. Please try again.");
      toast({
        title: "Failed to delete task",
        description:
          "Error deleting task and/or its reminder. Please try again!",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: RoutineStatus) => {
    try {
      await dispatch(
        updateRoutineStatus({ routineId, status: newStatus })
      ).unwrap();
      setError(null);
    } catch (error) {
      setError("Failed to update routine status. Please try again.");
    }
  };

  const handleCompletionToggle = async () => {
    try {
      await dispatch(
        updateCompletionStatus({
          routineId,
          date: new Date(),
        })
      ).unwrap();
      setError(null);
    } catch (error) {
      setError("Failed to update completion status. Please try again.");
    }
  };

  const handleFormSubmit = async (updatedData: IRoutine) => {
    try {
      setIsUpdating(true);
      await dispatch(
        updateRoutine({
          ...routine,
          ...updatedData,
          _id: routineId,
        })
      ).unwrap();
      setIsDialogOpen(false);
      setError(null);
    } catch (error) {
      setError("Failed to update routine. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderFrequency = () => {
    switch (routine.frequency) {
      case Frequency.DAILY:
        return "Daily";
      case Frequency.WEEKLY:
        return (
          <div className="flex items-center space-x-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <DayBadge
                key={day}
                day={day}
                active={routine.daysOfWeek?.includes(index) || false}
              />
            ))}
          </div>
        );
      case Frequency.MONTHLY:
        const dayOfMonth = routine.monthlyDate || 1;
        const ordinal = (n: number) => {
          const s = ["th", "st", "nd", "rd"];
          const v = n % 100;
          return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        return `${ordinal(dayOfMonth)} day of every month`;
      case Frequency.BIWEEKLY:
        return "Every two weeks";
      case Frequency.CUSTOM:
        return "Custom schedule";
      default:
        return routine.frequency;
    }
  };

  const getCardBorderColor = () => {
    switch (routine.status) {
      case RoutineStatus.ACTIVE:
        return todayCompletionStatus
          ? "border-l-green-500 dark:border-l-green-400"
          : "border-l-blue-500 dark:border-l-blue-400";
      case RoutineStatus.PAUSED:
        return "border-l-yellow-500 dark:border-l-yellow-400";
      case RoutineStatus.COMPLETED:
        return "border-l-green-700 dark:border-l-green-600";
      case RoutineStatus.INACTIVE:
        return "border-l-gray-500 dark:border-l-gray-400";
      default:
        return "border-l-gray-500 dark:border-l-gray-400";
    }
  };

  // Helper function to determine badge styles based on status
  const getStatusBadgeVariant = () => {
    switch (routine.status) {
      case RoutineStatus.ACTIVE:
        return "default";
      case RoutineStatus.PAUSED:
        return "destructive";
      case RoutineStatus.COMPLETED:
        return "default";
      case RoutineStatus.INACTIVE:
        return "default";
      default:
        return "default";
    }
  };

  const getNextStatus = () => {
    switch (routine.status) {
      case RoutineStatus.ACTIVE:
        return RoutineStatus.PAUSED;
      case RoutineStatus.PAUSED:
        return RoutineStatus.ACTIVE;
      case RoutineStatus.COMPLETED:
        return RoutineStatus.ACTIVE;
      case RoutineStatus.INACTIVE:
        return RoutineStatus.ACTIVE;
      default:
        return RoutineStatus.ACTIVE;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card
        className={`
          relative overflow-hidden 
          border-l-2 ${getCardBorderColor()}
          hover:shadow-sm transition-all duration-300
          dark:bg-gray-900/95 backdrop-blur-sm
          ${routine.status !== RoutineStatus.ACTIVE ? "opacity-75" : ""}
          transform hover:-translate-y-1
        `}
      >
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-transparent to-transparent group-hover:from-primary/5 transition-all duration-300" />

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {routine.reminderMinutes > 0 &&
                routine.status === RoutineStatus.ACTIVE && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="relative">
                          <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-pulse" />
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <small>
                          Reminder set for {routine.reminderMinutes} minutes
                          before
                        </small>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

              <div className="space-y-1 mt-2 capitalize">
                <CardTitle className="text-xl font-semibold dark:text-white flex items-center gap-2">
                  {routine.title}
                  {routine.streak > 0 &&
                    routine.status === RoutineStatus.ACTIVE && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center px-2 py-1 bg-orange-500/10 rounded-full">
                              <FaFire className="w-4 h-4 text-orange-500" />
                              <span className="text-sm ml-1 text-orange-600 font-bold">
                                {routine.streak}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <small>🎯 {routine.streak} day streak!</small>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                </CardTitle>
              </div>
            </div>

            <Badge
              variant={getStatusBadgeVariant()}
              className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
              onClick={() => handleStatusChange(getNextStatus())}
            >
              {routine.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="font-medium">
                  {moment(routine.startTime).format("hh:mm a")} -{" "}
                  {moment(routine.endTime).format("hh:mm a")}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Repeat className="w-4 h-4" />
                <span className="font-medium">{renderFrequency()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {routine.category && (
                <Badge
                  variant="outline"
                  className="hover:bg-primary/10 transition-colors"
                >
                  {routine.category}
                </Badge>
              )}
              {routine.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs hover:bg-secondary/80 transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 space-y-4 capitalize"
              >
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {routine.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:border-primary/50"
                      >
                        <Edit size={18} />
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Routine</DialogTitle>
                        <DialogDescription>
                          {` Make changes to your routine here. Click save when
                          you're done.`}
                        </DialogDescription>
                      </DialogHeader>
                      <RoutineForm
                        initialData={routine}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsDialogOpen(false)}
                        isSubmitting={isUpdating}
                        error={error}
                      />
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="destructive"
                    size="icon"
                    className="hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    <Trash2 size={18} />
                  </Button>

                  {routine.status === RoutineStatus.ACTIVE && (
                    <Button
                      variant={todayCompletionStatus ? "default" : "outline"}
                      size="icon"
                      className={`
                        ${
                          todayCompletionStatus
                            ? "bg-green-500 hover:bg-green-600"
                            : "hover:border-green-500/50"
                        }
                      `}
                      onClick={handleCompletionToggle}
                    >
                      {todayCompletionStatus ? (
                        <CircleCheck size={18} />
                      ) : (
                        <Circle size={18} />
                      )}
                    </Button>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                {routine.status === RoutineStatus.ACTIVE && (
                  <div className="pt-4">
                    <CompletionHistory routineId={routineId} days={7} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <div className="absolute bottom-16 right-3">
          <ReminderIndicator
            routine={{
              ...routine,
              _id: routineId,
              title: routine.title,
              description: routine.description || routine.title,
            }}
            reminder={reminder}
          />
        </div>

        <CardFooter className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            className="w-full justify-center hover:bg-primary/5 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show More
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

interface CompletionHistoryProps {
  routineId: string;
  days: number;
}

const CompletionHistory: React.FC<CompletionHistoryProps> = ({
  routineId,
  days,
}) => {
  const routine = useSelector((state: RootState) =>
    selectRoutineById(state, routineId)
  );

  if (!routine?.dailyCompletionStatus) {
    return null;
  }

  const today = new Date();
  const history = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const status = routine.dailyCompletionStatus.find(
      (s) => new Date(s.date).toISOString().split("T")[0] === dateStr
    );
    return {
      date: date,
      completed: status?.completed || false,
    };
  }).reverse();

  return (
    <div className="flex space-x-1 mt-4">
      {history.map(({ date, completed }) => (
        <TooltipProvider key={date.toISOString()}>
          <Tooltip>
            <TooltipTrigger>
              <div
                className={`w-6 h-6 rounded-full ${
                  completed
                    ? "bg-green-500 dark:bg-green-600"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="flex items-center gap-2">
                <span>{moment(date).format("DD/MMM")}</span>
                <span>{completed ? "Completed" : "Missed"}</span>
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default RoutineCard;
