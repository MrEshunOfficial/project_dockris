"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  deleteAppointment,
  updateAppointment,
  selectAppointments,
  selectSearchTerm,
  selectSortBy,
  selectSortOrder,
  AppointmentStatus,
  Appointment,
  fetchAppointmentById,
} from "@/store/schedule/appointmentSlice";

import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Grid,
  List,
  Edit,
  Trash,
  Users,
  Bell,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppointmentHeader from "./AppointmentHeader";
import AppointmentAside from "./AppointmentAside";
import AppointmentForm from "./AppointmentForm";
import { useAppDispatch } from "@/store/hooks";

const ITEMS_PER_PAGE = 10;

const AppointmentList = () => {
  const appointments = useSelector(selectAppointments);
  const searchTerm = useSelector(selectSearchTerm);
  const sortBy = useSelector(selectSortBy);
  const sortOrder = useSelector(selectSortOrder);
  const dispatch = useAppDispatch();

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedAppointments, setExpandedAppointments] = useState<string[]>(
    []
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditAppointment = async (appointment: Appointment) => {
    setIsLoading(true);
    try {
      const fullAppointment = await dispatch(
        fetchAppointmentById(appointment._id)
      ).unwrap();
      setSelectedAppointment(fullAppointment);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentSuccess = () => {
    setIsDialogOpen(false);
    setSelectedAppointment(null);
  };
  const filteredAppointments = appointments.filter((apt) =>
    apt.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.start).getTime() - new Date(b.start).getTime()
        : new Date(b.start).getTime() - new Date(a.start).getTime();
    } else if (sortBy === "title") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortBy === "status") {
      return sortOrder === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedAppointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = sortedAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      dispatch(deleteAppointment(id));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedAppointments((prev) =>
      prev.includes(id) ? prev.filter((aptId) => aptId !== id) : [...prev, id]
    );
  };

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    dispatch(updateAppointment({ id, data: { status: newStatus } }));
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card
      key={appointment._id}
      className="hover:shadow-md transition-shadow mb-4"
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          {appointment.title}
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditAppointment(appointment)}
          >
            <Edit size={16} className="mr-1" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(appointment._id)}
          >
            <Trash size={16} className="mr-1" /> Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleExpand(appointment._id)}
          >
            {expandedAppointments.includes(appointment._id) ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Start: {format(new Date(appointment.start), "PPpp")}
        </p>
        <p className="text-sm text-gray-600">
          End: {format(new Date(appointment.end), "PPpp")}
        </p>
        <p className="text-sm text-gray-600">
          Location: {appointment.location}
        </p>
        {expandedAppointments.includes(appointment._id) && (
          <>
            {appointment.description && (
              <p className="text-sm text-gray-600 mt-2">
                Description: {appointment.description}
              </p>
            )}
            <div className="flex items-center mt-2">
              <Users size={16} className="mr-2" />
              <span className="text-sm text-gray-600">
                {appointment.attendees.type === "individual"
                  ? `${
                      appointment.attendees.individuals?.length || 0
                    } attendees`
                  : `${appointment.attendees.count || 0} attendees`}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <Bell size={16} className="mr-2" />
              <span className="text-sm text-gray-600">
                Reminder: {appointment.reminder.type} (
                {appointment.reminder.interval} minutes before)
              </span>
            </div>
            <div className="flex items-center mt-1">
              <Lock size={16} className="mr-2" />
              <span className="text-sm text-gray-600">
                Privacy: {appointment.privacy}
              </span>
            </div>
            {appointment.recurring && (
              <p className="text-sm text-gray-600 mt-1">
                Recurring: {appointment.recurrencePattern}
              </p>
            )}
          </>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-medium">
            Status:
            <span
              className={`ml-2 px-2 py-1 rounded-full text-xs ${
                appointment.status === AppointmentStatus.CONFIRMED
                  ? "bg-green-100 text-green-800"
                  : appointment.status === AppointmentStatus.PENDING
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {appointment.status}
            </span>
          </p>
          <div className="flex space-x-2">
            {Object.values(AppointmentStatus).map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(appointment._id, status)}
                disabled={appointment.status === status}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderListView = () => (
    <div className="space-y-4 max-h-[600px] overflow-auto duration-300">
      {paginatedAppointments.map((appointment) =>
        renderAppointmentCard(appointment)
      )}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 duration-300">
      {paginatedAppointments.map((appointment) =>
        renderAppointmentCard(appointment)
      )}
    </div>
  );

  const renderPagination = () => (
    <div className="flex justify-center mt-4 space-x-2">
      <Button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className="py-2">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto p-6 relative">
      <AppointmentHeader
        searchTerm={searchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onNewAppointment={handleCreateAppointment}
      />

      <div className="flex flex-col lg:flex-row gap-8 ">
        <section className="flex-grow">
          <Tabs
            defaultValue="list"
            className="w-full"
            onValueChange={(value) => setViewMode(value as "list" | "grid")}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="list">
                <List size={20} className="mr-2" /> List
              </TabsTrigger>
              <TabsTrigger value="grid">
                <Grid size={20} className="mr-2" /> Grid
              </TabsTrigger>
            </TabsList>
            <TabsContent value="list">{renderListView()}</TabsContent>
            <TabsContent value="grid">{renderGridView()}</TabsContent>
          </Tabs>
        </section>

        <AppointmentAside appointments={appointments} />
      </div>
      <div className="fixed bottom-10 right-20">{renderPagination()}</div>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? "Edit Appointment" : "New Appointment"}
            </DialogTitle>
          </DialogHeader>
          <AppointmentForm
            appointment={selectedAppointment}
            onSuccess={handleAppointmentSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentList;
