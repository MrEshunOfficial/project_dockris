import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, BarChart2 } from "lucide-react";
import {
  Appointment,
  AppointmentStatus,
} from "@/store/schedule/appointmentSlice";

interface AppointmentAsideProps {
  appointments: Appointment[];
}

const AppointmentAside: React.FC<AppointmentAsideProps> = ({
  appointments,
}) => {
  const upcomingAppointments = appointments
    .filter((apt) => new Date(apt.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  const appointmentStats = {
    total: appointments.length,
    pending: appointments.filter(
      (apt) => apt.status === AppointmentStatus.PENDING
    ).length,
    confirmed: appointments.filter(
      (apt) => apt.status === AppointmentStatus.CONFIRMED
    ).length,
    cancelled: appointments.filter(
      (apt) => apt.status === AppointmentStatus.CANCELLED
    ).length,
  };

  return (
    <aside className="h-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold">
            <CalendarDays size={20} className="mr-2" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="max-w-3/4 space-y-2">
            {upcomingAppointments.map((apt) => (
              <li key={apt._id} className="flex justify-between items-center">
                <span className="font-medium max-w-[10rem] truncate">
                  {apt.title}
                </span>
                <span className="text-sm text-gray-600">
                  {format(new Date(apt.start), "PP")}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold">
            <BarChart2 size={20} className="mr-2" />
            Appointment Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">{appointmentStats.total}</span>
            </p>
            <p className="flex justify-between">
              <span>Pending:</span>
              <span className="font-semibold text-yellow-600">
                {appointmentStats.pending}
              </span>
            </p>
            <p className="flex justify-between">
              <span>Confirmed:</span>
              <span className="font-semibold text-green-600">
                {appointmentStats.confirmed}
              </span>
            </p>
            <p className="flex justify-between">
              <span>Cancelled:</span>
              <span className="font-semibold text-red-600">
                {appointmentStats.cancelled}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default AppointmentAside;
