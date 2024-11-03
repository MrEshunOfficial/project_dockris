import React from "react";
import { EventApi } from "@fullcalendar/core";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventDetailsProps {
  event: EventApi;
  onClose: () => void;
  onEdit: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose }) => {
  const { extendedProps } = event;

  const renderEventSpecificDetails = () => {
    switch (extendedProps.type) {
      case "todo":
        return (
          <>
            <p>
              <strong>Priority:</strong> {extendedProps.priority}
            </p>
            <p>
              <strong>Status:</strong> {extendedProps.status}
            </p>
            <p>
              <strong>Subtasks:</strong> {extendedProps.subtasks.length}
            </p>
          </>
        );
      case "appointment":
        return (
          <>
            <p>
              <strong>Status:</strong> {extendedProps.status}
            </p>
            <p>
              <strong>Location:</strong> {extendedProps.location}
            </p>
            <p>
              <strong>Reminder:</strong> {extendedProps.reminder.type} (
              {extendedProps.reminder.interval})
            </p>
          </>
        );
      case "specialEvent":
        return (
          <>
            <p>
              <strong>Type:</strong> {extendedProps.type}
            </p>
            <p>
              <strong>Location:</strong> {extendedProps.location}
            </p>
            <p>
              <strong>Organizer:</strong> {extendedProps.organizer}
            </p>
          </>
        );
      case "routine":
        return (
          <>
            <p>
              <strong>Category:</strong> {extendedProps.category}
            </p>
            <p>
              <strong>Frequency:</strong> {extendedProps.frequency}
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100 text-black dark:bg-gray-950 dark:text-white">
      <div className="rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{event.title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        <div className="mb-4">
          <p>
            <strong>Start:</strong> {event.start?.toLocaleString()}
          </p>
          <p>
            <strong>End:</strong> {event.end?.toLocaleString()}
          </p>
          {renderEventSpecificDetails()}
        </div>
        {extendedProps.description && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p>{extendedProps.description}</p>
          </div>
        )}
        {extendedProps.tags && extendedProps.tags.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {extendedProps.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className=" text-blue-800 px-2 py-0.5 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
