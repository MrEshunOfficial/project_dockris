"use client";
import React, { useRef, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import CalendarHeader from "./xtrasofcalendar/CalendarHeader";
import MainCalendar from "./xtrasofcalendar/MainCalendar";

// Define types for the calendar view
type CalendarView =
  | "dayGridMonth"
  | "timeGridWeek"
  | "timeGridDay"
  | "listWeek";

export default function CalendarPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const [isEventFormOpen, setIsEventFormOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<CalendarView>("dayGridMonth");
  const { error, status } = useAppSelector((state: RootState) => state.todos);

  const handleViewChange = (view: CalendarView) => {
    setCurrentView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  const handlePrevClick = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
    }
  };

  const handleNextClick = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
    }
  };

  const handleTodayClick = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
    }
  };

  return (
    <section className="w-full h-full flex flex-col">
      <div className="w-full flex items-center justify-center">
        <CalendarHeader
          handleViewChange={handleViewChange}
          handlePrevClick={handlePrevClick}
          handleNextClick={handleNextClick}
          handleTodayClick={handleTodayClick}
          currentView={currentView}
          calendarRef={calendarRef}
          isEventFormOpen={isEventFormOpen}
          setIsEventFormOpen={setIsEventFormOpen}
        />
      </div>
      <div className="w-full flex-1">
        <MainCalendar
          currentView={currentView}
          setCurrentView={setCurrentView}
          calendarRef={calendarRef}
          isEventFormOpen={isEventFormOpen}
          setIsEventFormOpen={setIsEventFormOpen}
        />
      </div>
    </section>
  );
}
