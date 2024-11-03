import React from "react";
import { EventApi } from "@fullcalendar/core";
import { AlertCircle, Users } from "lucide-react";

interface EventContentProps {
  event: EventApi;
}

const TodoEventContent: React.FC<EventContentProps> = ({ event }) => {
  const categoryColors: { [key: string]: string } = {
    work: "bg-orange-100 text-orange-800",
    personal: "bg-blue-100 text-blue-800",
    other: "bg-gray-100 text-gray-800",
  };

  const colorClass =
    categoryColors[event.extendedProps.category] || categoryColors.other;

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
          <AlertCircle size={12} className="mr-1" />
          {event.extendedProps.priority}
        </span>
        <span className="flex items-center">
          <Users size={12} className="mr-1" />
          {event.extendedProps.subtasks.length}
        </span>
      </div>
    </div>
  );
};

export default TodoEventContent;
