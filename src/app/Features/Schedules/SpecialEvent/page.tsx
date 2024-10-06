"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEvents,
  addEvent,
  updateEvent,
  selectFilteredAndSortedEvents,
  setSearchTerm,
  setSortBy,
  setSortOrder,
  setFilterType,
  setFilterStatus,
  EventType,
  EventStatus,
  eventTypes,
  eventStatuses,
  EventDocument,
} from "@/store/schedule/eventSlice";
import { AppDispatch, RootState } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortAsc, SortDesc, Grid, List, Plus } from "lucide-react";
import EventForm from "./EventForm";
import EventCard from "./EventCard";
import EventDashboard from "./EventDashboard";

const ITEMS_PER_PAGE = 5;

const EventList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector((state: RootState) =>
    selectFilteredAndSortedEvents(state)
  );
  const sortOrder = useSelector((state: RootState) => state.events.sortOrder);

  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDocument | null>(
    null
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
    setCurrentPage(1);
  };

  const handleSortBy = (value: keyof EventDocument) => {
    dispatch(setSortBy(value));
  };

  const handleSortOrder = () => {
    dispatch(setSortOrder(sortOrder === "asc" ? "desc" : "asc"));
  };

  const handleFilterType = (value: EventType | "all") => {
    dispatch(setFilterType(value));
    setCurrentPage(1);
  };

  const handleFilterStatus = (value: EventStatus | "all") => {
    dispatch(setFilterStatus(value));
    setCurrentPage(1);
  };

  const handleSubmit = (data: EventDocument) => {
    if (selectedEvent) {
      dispatch(updateEvent({ ...data, _id: selectedEvent._id }));
    } else {
      dispatch(addEvent(data));
    }
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEdit = (event: EventDocument) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const paginatedEvents = events.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderEventCards = () => (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-4"
      }
    >
      {paginatedEvents.map((event) => (
        <EventCard key={event._id} event={event} onEdit={handleEdit} />
      ))}
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
    <div className="container mx-auto p-6 flex flex-col gap-3">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Events Dashboard
        </h1>

        <div className="flex flex-wrap items-center gap-4 mb-6 mt-8">
          <Input
            type="text"
            placeholder="Search events..."
            onChange={handleSearch}
            className="flex-grow max-w-md"
          />
          <Select
            onValueChange={(value) =>
              handleSortBy(value as keyof EventDocument)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startTime">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSortOrder} variant="outline" className="p-2">
            {sortOrder === "asc" ? (
              <SortAsc size={20} />
            ) : (
              <SortDesc size={20} />
            )}
          </Button>
          <Select
            onValueChange={(value) =>
              handleFilterType(value as EventType | "all")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              handleFilterStatus(value as EventStatus | "all")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {eventStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setSelectedEvent(null)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus size={20} className="mr-2" /> New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="border-none">
              <DialogHeader>
                <DialogTitle>
                  {selectedEvent ? "Edit Event" : "Add New Event"}
                </DialogTitle>
              </DialogHeader>
              <EventForm event={selectedEvent} onSubmit={handleSubmit} />
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <div className="flex-1 w-full flex gap-3 h-full">
        <div className="flex-1 h-full ">
          <Tabs
            defaultValue="grid"
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
            <TabsContent value="list">{renderEventCards()}</TabsContent>
            <TabsContent value="grid">{renderEventCards()}</TabsContent>
          </Tabs>
          {renderPagination()}
        </div>
        <aside className="w-72 h-full overflow-auto">
          <EventDashboard />
        </aside>
      </div>
    </div>
  );
};

export default EventList;
