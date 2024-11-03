import React from "react";
import { EventApi } from "@fullcalendar/core";
import { Clock } from "lucide-react";

interface AppointmentEventProps {
  event: EventApi;
}

const AppointmentEvent: React.FC<AppointmentEventProps> = ({ event }) => {
  const statusColors: { [key: string]: string } = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const colorClass =
    statusColors[event.extendedProps.status] || statusColors.PENDING;

  return (
    <div className={`p-2 rounded-md ${colorClass} flex flex-col h-full`}>
      <div className="font-semibold text-sm truncate mb-1">{event.title}</div>
      <div className="text-xs mb-1">
        {event.start?.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <div className="mt-auto flex items-center space-x-2 text-xs">
        <span className="flex items-center">
          <Clock size={12} className="mr-1" />
          {event.extendedProps.status}
        </span>
      </div>
    </div>
  );
};

export default AppointmentEvent;
