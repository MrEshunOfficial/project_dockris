import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  selectAllEvents,
  deleteEvent,
  EventDocument,
} from "@/store/schedule/eventSlice";
import { AppDispatch, RootState } from "@/store";
import moment from "moment";

const EventDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector(selectAllEvents);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<EventDocument[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: Date }>({});

  useEffect(() => {
    const now = new Date();
    const upcoming = events.filter((event) => new Date(event.startTime) > now);
    const past = events.filter((event) => new Date(event.startTime) <= now);

    setStats({
      total: events.length,
      upcoming: upcoming.length,
      past: past.length,
    });

    setUpcomingEvents(upcoming.slice(0, 5)); // Show only the next 5 upcoming events

    const newCategories: { [key: string]: Date } = {};
    events.forEach((event) => {
      if (
        !newCategories[event.type] ||
        new Date(event.startTime) < newCategories[event.type]
      ) {
        newCategories[event.type] = new Date(event.startTime);
      }
    });
    setCategories(newCategories);

    // Remove past events
    past.forEach((event) => {
      dispatch(deleteEvent(event._id));
    });
  }, [events, dispatch]);

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <Card>
        <CardHeader>
          <CardTitle>Event Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>Total Events: {stats.total}</li>
            <li>Upcoming Events: {stats.upcoming}</li>
            <li>Past Events: {stats.past}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {upcomingEvents.map((event) => (
              <li key={event._id} className="flex justify-between items-center">
                <span>{event.name}</span>
                <Badge>
                  {format(new Date(event.startTime), "MMM d, yyyy")}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 flex flex-col gap-2">
            {Object.entries(categories).map(([category, dueDate]) => (
              <li
                key={category}
                className="flex gap-3 justify-between items-start"
              >
                <span>{category}</span>
                <Badge>{moment(dueDate).format("MM/DD YYYY, HH:mm A")}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDashboard;
