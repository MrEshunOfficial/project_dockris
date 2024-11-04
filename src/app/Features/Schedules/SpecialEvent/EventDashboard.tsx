import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  selectAllEvents,
  deleteEvent,
  EventDocument,
} from "@/store/scheduleSlice/eventSlice";
import { AppDispatch } from "@/store";
import moment from "moment";
import { Calendar, Clock, CalendarDays, Tag, ChevronRight } from "lucide-react";

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

    setUpcomingEvents(upcoming.slice(0, 5));

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

    past.forEach((event) => {
      dispatch(deleteEvent(event._id));
    });
  }, [events, dispatch]);

  const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <Card className="border dark:border-gray-700 border-gray-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p
                className={`text-sm ${
                  trend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week
              </p>
            )}
          </div>
          <div className="p-3 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full flex items-center gap-3">
      {/* Stats Row */}
      <div className="h-full w-1/4 flex flex-col item-center gap-2">
        <StatCard
          title="Total Events"
          value={stats.total}
          icon={Calendar}
          trend={12}
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcoming}
          icon={Clock}
          trend={5}
        />
        <StatCard
          title="Past Events"
          value={stats.past}
          icon={CalendarDays}
          trend={-2}
        />
      </div>

      {/* Main Content */}
      <div className="h-auto flex-1 flex items-center justify-center gap-2">
        {/* Upcoming Events */}
        <Card className="flex-1 h-[48vh] border dark:border-gray-700 border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex items-center gap-4 p-3 rounded-lg transition-colors border dark:border-gray-700 border-gray-300"
                >
                  <div className="min-w-[48px] h-12 flex flex-col items-center justify-center rounded text-blue-600">
                    <span className="text-xs font-medium">
                      {format(new Date(event.startTime), "MMM")}
                    </span>
                    <span className="text-lg font-bold">
                      {format(new Date(event.startTime), "dd")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(event.startTime), "h:mm a")}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No upcoming events
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Categories */}
        <Card className="flex-1 h-[48vh] border dark:border-gray-700 border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Event Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-3 rounded-lg transition-colors border dark:border-gray-700 border-gray-300">
              {Object.entries(categories).map(([category, dueDate]) => (
                <div
                  key={category}
                  className="w-full flex items-center justify-between p-3 rounded-lg"
                >
                  <div className="flex-1 flex items-center justify-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-end gap-2">
                    <Badge variant="secondary" className="ml-auto">
                      {moment(dueDate).format("MM/DD")}
                    </Badge>
                  </div>
                </div>
              ))}
              {Object.keys(categories).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No categories found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDashboard;
