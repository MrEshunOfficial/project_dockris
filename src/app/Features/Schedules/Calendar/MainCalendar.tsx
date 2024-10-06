import React, { useState } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { EventContentArg, EventApi } from "@fullcalendar/core";
import { selectFilteredTodos } from "@/store/schedule/todoSlice";
import { selectAppointments } from "@/store/schedule/appointmentSlice";
import { selectAllEvents } from "@/store/schedule/eventSlice";
import { RootState } from "@/store";
import TodoEventContent from "./TodoEventContent";
import AppointmentEvent from "./AppointmentEvent";
import SpecialEventContent from "./SpecialEventContent";
import RoutineContent from "./RoutineContent";
import EventDetails from "./EventDetails";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import moment from "moment";

type CalendarView =
  | "dayGridMonth"
  | "timeGridWeek"
  | "timeGridDay"
  | "listWeek"
  | "multiMonthYear";

interface CalendarProps {
  currentView: CalendarView;
  calendarRef: React.RefObject<FullCalendar>;
}

const MainCalendar: React.FC<CalendarProps> = ({
  currentView,
  calendarRef,
}) => {
  const todos = useSelector((state: RootState) => selectFilteredTodos(state));
  const appointments = useSelector((state: RootState) =>
    selectAppointments(state)
  );
  const specialEvents = useSelector((state: RootState) =>
    selectAllEvents(state)
  );
  const routines = useSelector((state: RootState) => state.routines.routines);

  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const handleEventClick = (clickInfo: { event: EventApi }) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleCloseEvent = () => {
    setSelectedEvent(null);
  };

  const handleEditEvent = () => {
    setIsUpdateDialogOpen(true);
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const event = eventInfo.event;
    switch (event.extendedProps.type) {
      case "todo":
        return <TodoEventContent event={event} />;
      case "appointment":
        return <AppointmentEvent event={event} />;
      case "special event":
        return <SpecialEventContent event={event} />;
      case "routine":
        return <RoutineContent event={event} />;
      default:
        return <div>{event.title}</div>;
    }
  };

  const events = [
    ...todos.map((todo) => ({
      id: todo._id,
      title: todo.title,
      start: new Date(todo.dueDateTime),
      end: new Date(
        new Date(todo.dueDateTime).getTime() + todo.estimatedDuration * 60000
      ),
      extendedProps: { ...todo, type: "todo" },
    })),
    ...appointments.map((appointment) => ({
      id: appointment._id,
      title: appointment.title,
      start: moment(appointment.start).format("HH:mm a"),
      end: moment(appointment.end).format("HH:mm a"),
      extendedProps: { ...appointment, type: "appointment" },
    })),
    ...specialEvents.map((specialEvent) => ({
      id: specialEvent._id,
      title: specialEvent.name,
      start: new Date(specialEvent.startTime),
      end: new Date(specialEvent.endTime),
      extendedProps: { ...specialEvent, type: "special event" },
    })),
    ...routines.map((routine) => ({
      id: routine._id,
      title: routine.name,
      start: new Date(routine.startTime),
      end: new Date(routine.endTime),
      extendedProps: { ...routine, type: "routine" },
    })),
  ];

  return (
    <main className="w-full h-full p-2">
      <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="h-[calc(95vh-200px)]">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              interactionPlugin,
              multiMonthPlugin,
            ]}
            initialView={currentView}
            views={{
              multiMonthYear: { type: "multiMonth", duration: { years: 1 } },
              dayGridMonth: { buttonText: "Month" },
              timeGridWeek: { buttonText: "Week" },
              timeGridDay: { buttonText: "Day" },
              listWeek: { buttonText: "Agenda" },
            }}
            events={events}
            headerToolbar={false}
            eventContent={renderEventContent}
            height="100%"
            slotEventOverlap={false}
            allDaySlot={false}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
            }}
            eventClick={handleEventClick}
          />
        </div>
      </div>
      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={handleCloseEvent}
          onEdit={handleEditEvent}
        />
      )}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Event</DialogTitle>
            <DialogDescription>
              {`Make changes to your event here. Click save when you're done.`}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default MainCalendar;
