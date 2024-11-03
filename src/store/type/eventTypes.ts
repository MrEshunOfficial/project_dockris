import { z } from 'zod';
import { eventTypes, eventStatuses } from '@/models/scheduleModel/eventsModel';

const eventSchema = z.object({
  title: z.string().min(3).max(100),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(eventTypes),
  organizer: z.string().max(100),
  capacity: z.number().min(0).max(1000000).nullable().optional(),
  eventLinks: z.array(z.string().url()).optional(),
  mapLink: z.string().url().optional(),
  status: z.enum(eventStatuses).optional(),
  tags: z.array(z.string().max(30)).optional(),
  isPublic: z.boolean().optional(),
  categories: z.array(z.string().max(30)).optional(),
  virtualMeetingUrl: z.string().url().optional(),
});

// Helper function to clean null/undefined values from request body
const cleanRequestBody = (body: any) => {
  const cleaned = { ...body };
  for (const key in cleaned) {
    if (cleaned[key] === null || cleaned[key] === undefined) {
      delete cleaned[key];
    }
  }
  return cleaned;
};

export { eventSchema, cleanRequestBody };