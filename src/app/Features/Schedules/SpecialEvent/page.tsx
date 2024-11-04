"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateEvent,
  selectFilteredEvents,
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
  addEvent,
} from "@/store/scheduleSlice/eventSlice";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
  const events = useSelector((state: RootState) => selectFilteredEvents(state));
  const sortOrder = useSelector((state: RootState) => state.events.sortOrder);

  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDocument | undefined>(
    undefined
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

  const handleSubmit = (
    data: Omit<EventDocument, "_id" | "createdAt" | "updatedAt" | "userId">
  ) => {
    if (selectedEvent) {
      dispatch(updateEvent({ id: selectedEvent._id, data }));
    } else {
      dispatch(addEvent(data));
    }
    setIsEventDialogOpen(false);
    setSelectedEvent(undefined);
  };

  const handleEdit = (event: EventDocument) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
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
          ? "grid grid-cols-1 md:grid-cols-2 gap-4"
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Events Overview</h1>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Event Overview</Button>
            </DrawerTrigger>
            <DrawerContent className="p-3 border dark:border-gray-700 border-gray-300 bg-opacity-25">
              <DrawerHeader>
                <DrawerTitle>Event Overview</DrawerTitle>
                <DrawerDescription>
                  Overview of your events and categories
                </DrawerDescription>
              </DrawerHeader>
              <EventDashboard />
            </DrawerContent>
          </Drawer>
        </div>

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
              <SelectItem value="title">Title</SelectItem>
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
          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setSelectedEvent(undefined)}
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
      <div className="flex-1 w-full">
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
    </div>
  );
};

export default EventList;
