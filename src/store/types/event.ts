// src/types/index.ts
import { EventStatus, EventType } from "@/models/schedulesmodel/event-model/Eventmodel";

export interface CreateEventBody {
  name: string;
  startTime: Date | string;  // Allow both Date and string for flexibility
  endTime: Date | string;
  location: string;
  description?: string;
  type: EventType;
  reminder?: boolean;
  organizer: string;  // Organizer will be a string (user ID)
  capacity?: number;
  registeredAttendees?: number;
  eventLinks?: string[];
  mapLink?: string;
  status?: EventStatus;
}
