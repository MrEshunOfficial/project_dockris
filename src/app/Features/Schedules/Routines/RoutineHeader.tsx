import React, { useEffect, useState } from "react";
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
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppDispatch, RootState } from "@/store";
import RoutineForm from "./RoutineForm";
import {
  setCurrentDate,
  sortRoutines,
  searchRoutines,
  filterByCategory,
  filterByFrequency,
  filterByStatus,
  setViewMode,
  addRoutine,
  clearFilters,
  Frequency,
  RoutineStatus,
} from "@/store/scheduleSlice/routineSlice";
import { IRoutine } from "@/store/type/routine";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import RoutineAside from "./RoutineAside";

// DayButton Component
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
        ? "bg-indigo-500 text-white hover:bg-indigo-600"
        : "hover:bg-gray-100 dark:hover:bg-gray-700"
    }`}
    onClick={onClick}
  >
    <span className="text-xs font-medium">{format(date, "EEE")}</span>
    <span className="text-lg font-bold">{format(date, "d")}</span>
  </Button>
);

// Header Component
export const RoutineHeader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentDate,
    viewMode,
    searchTerm,
    sortField,
    sortDirection,
    categoryFilter,
    frequencyFilter,
    statusFilter,
  } = useSelector((state: RootState) => state.routines);

  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isRoutineFormOpen, setIsRoutineFormOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!currentDate) {
      dispatch(setCurrentDate(new Date()));
    }
  }, [dispatch, currentDate]);

  const weekStart = startOfWeek(currentDate || new Date());
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const handleDateChange = (date: Date) => {
    dispatch(setCurrentDate(date));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(searchRoutines(e.target.value));
  };

  const handleSort = (field: keyof IRoutine) => {
    dispatch(sortRoutines(field));
  };

  const handleCategoryFilter = (category: string) => {
    dispatch(filterByCategory(category === "all" ? null : category));
  };

  const handleFrequencyFilter = (frequency: Frequency | "all") => {
    dispatch(filterByFrequency(frequency === "all" ? null : frequency));
  };

  const handleStatusFilter = (status: RoutineStatus | "all") => {
    dispatch(filterByStatus(status === "all" ? null : status));
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    dispatch(setViewMode(mode));
  };

  const handleFormSubmit = async (
    data: Omit<IRoutine, "_id" | "createdAt" | "updatedAt">
  ) => {
    await dispatch(addRoutine(data));
    setIsRoutineFormOpen(false);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const hasActiveFilters = Boolean(
    searchTerm || categoryFilter || frequencyFilter || statusFilter || sortField
  );

  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className="max-w-7xl mx-auto rounded-lg mb-4 overflow-hidden transition-all duration-500 ease-in-out"
      style={{ height: expanded ? "auto" : "3.5rem" }}
    >
      <div className="flex flex-col space-y-6">
        {/* Header Title and New Routine Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            My Routines
          </h2>
          <Button
            onClick={toggleExpand}
            variant={"ghost"}
            className="w-1/2 rounded"
          >
            {expanded ? (
              <ChevronUp className="dark:text-gray-400" size={18} />
            ) : (
              <ChevronDown className="dark:text-gray-400" size={18} />
            )}
          </Button>
          <Dialog open={isRoutineFormOpen} onOpenChange={setIsRoutineFormOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Routine
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[425px] border-none">
              <DialogHeader>
                <DialogTitle>Create New Routine</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new routine.
                </DialogDescription>
              </DialogHeader>
              <RoutineForm
                onSubmit={handleFormSubmit}
                onCancel={() => setIsRoutineFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Week Days and Calendar */}
        <div className="flex items-center justify-between">
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
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={currentDate || undefined}
                onSelect={(date) => {
                  if (date) {
                    handleDateChange(date);
                    setIsCalendarOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-full flex items-center justify-start">
            <div className="relative flex-grow max-w-md w-full">
              <Input
                type="text"
                placeholder="Search routines..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild className="mx-2">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 flex items-center justify-center">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Categories</h4>
                      <div className="grid gap-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleCategoryFilter("all")}
                        >
                          All Categories
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleCategoryFilter("work")}
                        >
                          Work
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleCategoryFilter("personal")}
                        >
                          Personal
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleCategoryFilter("health")}
                        >
                          Health
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Frequency</h4>
                      <div className="grid gap-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleFrequencyFilter("all")}
                        >
                          All Frequencies
                        </Button>
                        {Object.values(Frequency).map((freq) => (
                          <Button
                            key={freq}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleFrequencyFilter(freq)}
                          >
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSort("startTime")}
                className={
                  sortField === "startTime"
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }
              >
                {sortDirection === "asc" ? (
                  <ChevronLeft className="w-4 h-4 mr-1" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-1" />
                )}
                {sortDirection === "asc" ? "Earliest" : "Latest"}
              </Button>

              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => handleViewModeChange("list")}
                  className="rounded-r-none"
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  onClick={() => handleViewModeChange("grid")}
                  className="rounded-l-none"
                >
                  <Grid className="w-4 h-4 mr-1" />
                  Grid
                </Button>
              </div>
            </div>
          </div>
          <div className="w-max flex items-center justify-end">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Overview</Button>
              </SheetTrigger>
              <SheetContent className="w-[22rem] flex flex-col p-2 my-2 border-gray-300 dark:border-gray-700">
                <SheetHeader className="my-3">
                  <SheetTitle>Routine</SheetTitle>
                  <SheetDescription>
                    Edit routine details and settings.
                  </SheetDescription>
                </SheetHeader>
                <RoutineAside />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Active filters:{" "}
              {[
                searchTerm && "Search",
                categoryFilter && `Category: ${categoryFilter}`,
                frequencyFilter && `Frequency: ${frequencyFilter}`,
                statusFilter && `Status: ${statusFilter}`,
                sortField && `Sorted by: ${sortField}`,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
            <Button size="sm" variant="ghost" onClick={handleClearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
