import React from "react";
import { EventApi } from "@fullcalendar/core";

interface SpecialEventContentProps {
  event: EventApi;
}

const SpecialEventContent: React.FC<SpecialEventContentProps> = ({ event }) => {
  const typeColors: { [key: string]: string } = {
    conference: "bg-blue-100 text-blue-800",
    workshop: "bg-green-100 text-green-800",
    meetup: "bg-purple-100 text-purple-800",
    party: "bg-pink-100 text-pink-800",
  };

  const colorClass =
    typeColors[event.extendedProps.type] || typeColors.conference;

  return (
    <div className={`p-2 rounded-md ${colorClass} flex flex-col h-full`}>
      <div className="font-semibold text-sm truncate mb-1">{event.title}</div>
      <div className="text-xs mb-1">
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
      <div className="mt-auto text-xs capitalize">
        {event.extendedProps.type}
      </div>
    </div>
  );
};

export default SpecialEventContent;
