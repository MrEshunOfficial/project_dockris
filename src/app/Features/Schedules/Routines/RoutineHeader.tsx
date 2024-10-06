import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format, addDays, isSameDay, startOfWeek } from "date-fns";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Grid,
  List,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  setCurrentDate,
  sortOrder,
  searchRoutines,
  filterCategory,
  setViewMode,
  addRoutine,
} from "@/store/schedule/routineSlice";
import { RootState } from "@/store";
import RoutineForm from "./RoutineForm"; // Make sure to import RoutineForm
import { RoutineDocument } from "@/store/types/routine";

interface DayButtonProps {
  day: string;
  isSelected: boolean;
  onClick: () => void;
  date: Date;
}

const DayButton: React.FC<DayButtonProps> = ({
  day,
  isSelected,
  onClick,
  date,
}) => (
  <Button
    variant={isSelected ? "default" : "ghost"}
    size="sm"
    className={`flex flex-col items-center justify-center h-16 w-16 rounded-lg ${
      isSelected
        ? "bg-blue-500 text-white dark:bg-blue-600"
        : "hover:bg-gray-100 dark:hover:bg-gray-700"
    }`}
    onClick={onClick}
  >
    <span className="text-xs font-medium dark:text-gray-300">
      {format(date, "EEE")}
    </span>
    <span className="text-lg font-bold dark:text-gray-300">
      {format(date, "d")}
    </span>
  </Button>
);

const RoutineHeader: React.FC = () => {
  const dispatch = useDispatch();
  const currentDate = useSelector(
    (state: RootState) => state.routines.currentDate
  );
  const viewMode = useSelector((state: RootState) => state.routines.viewMode);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRoutineFormOpen, setIsRoutineFormOpen] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setCurrentDate(new Date()));
  }, [dispatch]);

  const weekStart = startOfWeek(currentDate || new Date());
  const weekDays: Date[] = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const handleDateChange = (date: Date) => {
    dispatch(setCurrentDate(date));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    dispatch(searchRoutines(term));
  };

  const handleSort = (field: "name" | "startTime" | "status") => {
    dispatch(sortOrder(field));
  };

  const handleCategoryFilter = (category: string) => {
    dispatch(filterCategory(category));
  };

  const handleViewModeChange = (mode: "list" | "grid") => {
    dispatch(setViewMode(mode));
  };

  const handleFormSubmit = async (data: RoutineDocument) => {
    dispatch(addRoutine(data));
    setIsRoutineFormOpen(false);
  };

  const handleFormCancel = () => {
    setIsRoutineFormOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
          {weekDays.map((date, i) => (
            <DayButton
              key={i}
              day={format(date, "EEE")}
              isSelected={isSameDay(currentDate || new Date(), date)}
              onClick={() => handleDateChange(date)}
              date={date}
            />
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2 dark:text-gray-300" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 dark:bg-gray-800" align="end">
              <CalendarComponent
                mode="single"
                selected={currentDate || undefined}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    handleDateChange(date);
                    setIsCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Dialog open={isRoutineFormOpen} onOpenChange={setIsRoutineFormOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Routine
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Routine</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new routine.
                </DialogDescription>
              </DialogHeader>
              <RoutineForm
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow max-w-md">
          <Input
            type="text"
            placeholder="Search routines..."
            className="pl-10 pr-4 py-2 dark:bg-gray-700 dark:text-gray-300"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
        </div>
        <div className="flex items-center space-x-2">
          <Select onValueChange={handleCategoryFilter}>
            <SelectTrigger className="w-[180px] dark:bg-gray-700 dark:text-gray-300">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:text-gray-300">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="health">Health</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => handleSort("startTime")}>
            <ChevronLeft className="w-4 h-4 mr-1 dark:text-gray-300" />
            Earliest
          </Button>
          <Button size="sm" onClick={() => handleSort("startTime")}>
            <ChevronRight className="w-4 h-4 mr-1 dark:text-gray-300" />
            Latest
          </Button>
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-md">
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("list")}
              className="rounded-r-none"
            >
              <List className="w-4 h-4 mr-1 dark:text-gray-300" />
              List
            </Button>
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("grid")}
              className="rounded-l-none"
            >
              <Grid className="w-4 h-4 mr-1 dark:text-gray-300" />
              Grid
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineHeader;
