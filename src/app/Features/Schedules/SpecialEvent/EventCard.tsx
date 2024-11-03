import React, { useState } from "react";
import { useDispatch } from "react-redux";
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
  Calendar,
  Tag,
  Globe,
  Video,
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
import {
  updateEvent,
  deleteEvent,
  EventDocument,
  EventStatus,
  eventStatuses,
} from "@/store/scheduleSlice/eventSlice";
import ReminderIndicator from "@/app/reminder-component/ReminderIndicator";
import { useAppSelector } from "@/store/hooks";
import { selectAllReminders } from "@/store/reminderSlice";
import { ENTITY_TYPES } from "@/constants/entityTypes";

interface EventCardProps {
  event: EventDocument;
  onEdit: (event: EventDocument) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<EventStatus>(event.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const reminder = useAppSelector((state) =>
    selectAllReminders(state).find(
      (r) =>
        r.entityType === (ENTITY_TYPES.EVENTS as const) &&
        r.entityId === event._id
    )
  );

  const handleDelete = async () => {
    try {
      await dispatch(deleteEvent(event._id));
      toast({
        title: "Event deleted",
        description: "Event was deleted successfully",
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: EventStatus) => {
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);
    try {
      await dispatch(
        updateEvent({
          id: event._id,
          data: { status: newStatus },
        })
      ).unwrap();

      setCurrentStatus(newStatus);
      toast({
        title: "Status updated",
        description: `Event status changed to ${newStatus}`,
        duration: 3000,
      });
    } catch (error: any) {
      // Revert the status in the UI if the update fails
      setCurrentStatus(event.status);
      toast({
        title: "Error updating status",
        description: error?.message || "Failed to update status",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status: EventStatus) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "pending":
        return "warning";
      case "confirmed":
        return "success";
      case "cancelled":
        return "destructive";
      case "completed":
        return "default";
      default:
        return "default";
    }
  };

  const isEventActive = () => {
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    return startTime <= now && now <= endTime;
  };

  return (
    <Card className="max-w-4xl mx-auto hover:shadow-lg transition-all duration-300 border dark:border-gray-700 border-gray-300">
      <Toaster />
      {/* Header Section */}
      <CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
          {/* Title and Badges Section */}
          <div className="md:col-span-9 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-2xl font-bold">
                {event.title}
              </CardTitle>
              {isEventActive() && (
                <Badge variant="default" className="bg-green-500 text-white">
                  Live Now
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {event.isPublic && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5 px-3 py-1 text-blue-700 border-blue-200"
                >
                  <Globe size={14} />
                  Public
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="px-3 py-1 text-purple-700 border-purple-200"
              >
                {event.type}
              </Badge>
            </div>
          </div>

          {/* Status Select */}
          <div className="md:col-span-3">
            <Select
              value={currentStatus}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger
                className={`w-full border-none ${
                  isUpdating ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <SelectValue>
                  <Badge
                    variant={getStatusBadgeVariant(currentStatus)}
                    className="w-full"
                  >
                    {isUpdating ? "Updating..." : currentStatus}
                  </Badge>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {eventStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    <Badge
                      variant={getStatusBadgeVariant(status)}
                      className="w-full"
                    >
                      {status}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 border dark:border-gray-700 border-gray-300">
        {/* Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Left Column */}
          <div className="space-y-2">
            {/* Date and Time */}
            <div className="rounded-xl p-2">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Starts:{" "}
                    {moment(event.startTime).format("MMM DD YYYY, HH:mm A")}
                  </div>
                  <div className="text-sm text-gray-600">
                    Ends: {moment(event.endTime).format("MMM DD YYYY, HH:mm A")}
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl p-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-orange-600 shrink-0" />
                <span className="text-sm">{event.location}</span>
              </div>
            </div>
            {/* Reminder */}
            <div className="rounded-xl p-2">
              <ReminderIndicator
                specialevent={{
                  ...event,
                  _id: event._id,
                  title: event.title,
                  description: event.description || event.title,
                }}
                reminder={reminder}
              />
            </div>

            {/* Virtual Meeting Link */}
            {event.virtualMeetingUrl && (
              <div className=" rounded-xl p-2">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-purple-600 shrink-0" />
                  <a
                    href={event.virtualMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    Join Virtual Meeting
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            {/* Attendees */}
            <div className="rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-600 shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">Attendees:</span>{" "}
                  <span className="text-gray-700">
                    {event.registeredAttendees ?? 0} /{" "}
                    {event.capacity ? event.capacity : "∞"}
                  </span>
                </div>
              </div>
            </div>

            {/* Organizer */}
            {event.organizer && (
              <div className="rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium">Organizer:</span>{" "}
                    <span className="text-gray-700">{event.organizer}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {/* Description */}
            {event.description && (
              <div className="rounded-xl p-2">
                <h3 className="text-sm font-semibold mb-3">Description</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            {/* Categories */}
            {event?.categories?.length ? (
              <div className="rounded-xl p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold">Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.categories.map((category, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-3 py-1 border-yellow-200 text-yellow-700"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Resources */}
            {event?.eventLinks?.length ? (
              <div className=" rounded-xl p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold">Resources</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {event?.eventLinks?.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Resource {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Map Link */}
            {event.mapLink && (
              <div className=" rounded-xl p-2">
                <a
                  href={event.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-rose-600 hover:text-rose-800 hover:underline"
                >
                  <MapPin className="w-4 h-4" />
                  View on Map
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full sm:w-auto"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 mr-2" />
          ) : (
            <ChevronDown className="w-4 h-4 mr-2" />
          )}
          {isExpanded ? "Show Less" : "Show More"}
        </Button>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(event)}
            className="flex-1 sm:flex-none"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="flex-1 sm:flex-none"
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
