import React from "react";
import { EventApi } from "@fullcalendar/core";

interface RoutineContentProps {
  event: EventApi;
}

const RoutineContent: React.FC<RoutineContentProps> = ({ event }) => {
  const categoryColors: { [key: string]: string } = {
    work: "bg-purple-50 text-purple-600",
    personal: "bg-green-50 text-green-600",
    health: "bg-red-50 text-red-600",
    other: "bg-gray-50 text-gray-600",
  };

  const colorClass =
    categoryColors[event.extendedProps.category] || categoryColors.other;

  return (
    <div className={`p-2 rounded-md ${colorClass} flex flex-col h-full`}>
      <div className="font-semibold text-sm truncate mb-1 capitalize">
        {event.title}
      </div>
      <div className="text-xs">
        {event.start?.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        -
        {event.end?.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
};

export default RoutineContent;
