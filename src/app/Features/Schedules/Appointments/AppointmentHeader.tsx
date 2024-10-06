import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import {
  setSearchTerm,
  setSortBy,
  setSortOrder,
} from "@/store/schedule/appointmentSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortAsc, SortDesc, Plus } from "lucide-react";

interface AppointmentHeaderProps {
  searchTerm: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onNewAppointment: () => void;
}

const AppointmentHeader: React.FC<AppointmentHeaderProps> = ({
  searchTerm,
  sortBy,
  sortOrder,
  onNewAppointment,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleSortBy = (value: "date" | "title" | "status") => {
    dispatch(setSortBy(value));
  };

  const handleSortOrder = () => {
    dispatch(setSortOrder(sortOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-500">
        Appointments Dashboard
      </h1>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search appointments..."
          value={searchTerm}
          onChange={handleSearch}
          className="flex-grow max-w-md"
        />
        <Select value={sortBy} onValueChange={handleSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSortOrder} variant="outline" className="p-2">
          {sortOrder === "asc" ? <SortAsc size={20} /> : <SortDesc size={20} />}
        </Button>
        <Button
          onClick={onNewAppointment}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" /> New Appointment
        </Button>
      </div>
    </header>
  );
};

export default AppointmentHeader;
