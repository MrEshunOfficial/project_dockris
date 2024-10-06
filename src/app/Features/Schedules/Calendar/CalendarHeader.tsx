import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SlidersVertical,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Plus,
  Sun,
  CalendarIcon,
  List,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import ScheduleForm from "./ScheduleForm";
import { RootState } from "@/store";
import { searchTodos, setSelectedCategory } from "@/store/schedule/todoSlice";

interface CalendarHeaderProps {
  handleViewChange: (view: string) => void;
  handlePrevClick: () => void;
  handleNextClick: () => void;
  handleTodayClick: () => void;
  setIsEventFormOpen: (isOpen: boolean) => void;
  currentView: string;
  calendarRef: React.RefObject<any>;
}

const currentDate = `${new Date().toDateString()}`;

const viewOptions = [
  { name: "Year", icon: Calendar, value: "multiMonthYear" },
  { name: "Month", icon: CalendarIcon, value: "dayGridMonth" },
  { name: "Week", icon: Clock, value: "timeGridWeek" },
  { name: "Day", icon: Sun, value: "timeGridDay" },
  { name: `${currentDate}`, icon: List, value: "listWeek" },
];

export default function CalendarHeader({
  handleViewChange,
  handlePrevClick,
  handleNextClick,
  handleTodayClick,
  currentView,
  setIsEventFormOpen,
}: CalendarHeaderProps) {
  const dispatch = useDispatch();
  const categories = useSelector((state: RootState) => state.todos.categories);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    dispatch(searchTodos(term));
  };

  const handleFilterChange = (category: string | null) => {
    dispatch(setSelectedCategory(category));
  };

  return (
    <header className="w-full p-3 flex flex-col items-start justify-center gap-2">
      <TooltipProvider>
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-2">
                {viewOptions.map((view) => (
                  <Tooltip key={view.name}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          currentView === view.value ? "secondary" : "ghost"
                        }
                        onClick={() => handleViewChange(view.value)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200"
                      >
                        <view.icon size={16} />
                        <span>{view.name}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        View{" "}
                        {view.name === currentDate ? "Agenda" : `${view.name}`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
          <div className="w-max flex items-center justify-end gap-3">
            <Input
              type="text"
              id="search"
              placeholder="Search Schedules"
              className="bg-inherit rounded-full"
              value={searchTerm}
              onChange={handleSearch}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default">
                  Filter
                  <SlidersVertical size={18} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Category:</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFilterChange(null)}>
                  All Categories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => handleFilterChange(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => setIsScheduleFormOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus size={16} />
              <span>New Schedule</span>
            </Button>

            <ScheduleForm
              isOpen={isScheduleFormOpen}
              onClose={() => setIsScheduleFormOpen(false)}
            />
          </div>
        </div>

        <div className="w-full flex items-center justify-start space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handlePrevClick}
                className="p-2 rounded-full"
              >
                <ArrowLeft size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Previous
                {currentView === "multiMonthYear"
                  ? "Year"
                  : currentView.replace("timeGrid", "").replace("dayGrid", "")}
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handleNextClick}
                className="p-2 rounded-full"
              >
                <ArrowRight size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Next
                {currentView === "multiMonthYear"
                  ? "Year"
                  : currentView.replace("timeGrid", "").replace("dayGrid", "")}
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handleTodayClick}
                className="px-4 py-2 rounded-lg"
              >
                Today
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go to Today</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </header>
  );
}
