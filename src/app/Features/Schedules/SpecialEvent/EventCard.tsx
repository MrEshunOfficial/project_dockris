import React, { useState } from "react";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import {
  updateEvent,
  deleteEvent,
  EventDocument,
  EventStatus,
} from "@/store/schedule/eventSlice";
import { AppDispatch } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash,
  MapPin,
  Users,
  Link,
  Bell,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import moment from "moment";

interface EventCardProps {
  event: EventDocument;
  onEdit: (event: EventDocument) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = async () => {
    try {
      await dispatch(deleteEvent(event._id));
      setIsExpanded(false);
      toast({
        title: "event deleted",
        description: " event deleted successfully",
        duration: 5000,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete event. Please try again.",
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (newStatus: EventStatus) => {
    dispatch(updateEvent({ ...event, status: newStatus }));
  };

  const getStatusBadgeVariant = (status: EventStatus) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Toaster />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">{event.name}</CardTitle>
          <Select
            defaultValue={event.status}
            onValueChange={(value) => handleStatusChange(value as EventStatus)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue>
                <Badge
                  variant={getStatusBadgeVariant(event.status)}
                  className="px-2 border-none"
                >
                  {event.status}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <div className="flex flex-col gap-1">
              <span className="flex items-center justify-start gap-2 w-full">
                Start Date:
                {moment(event.startTime).format("MM/DD YYYY, HH:mm A")}
              </span>
              <span className="flex items-center justify-start gap-2 w-full">
                End Date: {moment(event.endTime).format("MM/DD YYYY, HH:mm A")}
              </span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-2" />
            <span>{event.location}</span>
          </div>
          {isExpanded && (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <Users size={16} className="mr-2" />
                <span>
                  {event.registeredAttendees ?? 0} / {event.capacity ?? "∞"}
                </span>
              </div>
              <p className="text-sm text-gray-700">{event.description}</p>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{event.type}</Badge>
                {event.reminder && <Bell size={16} className="text-blue-500" />}
              </div>
              {event.eventLinks && event.eventLinks.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Link size={16} className="text-blue-500" />
                  {event.eventLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Link {index + 1}
                    </a>
                  ))}
                </div>
              )}
              {event.mapLink && (
                <a
                  href={event.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center"
                >
                  <MapPin size={16} className="mr-1" /> View Map
                </a>
              )}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp size={16} className="mr-1" />
          ) : (
            <ChevronDown size={16} className="mr-1" />
          )}
          {isExpanded ? "Collapse" : "Expand"}
        </Button>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
            <Edit size={16} />
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash size={16} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
