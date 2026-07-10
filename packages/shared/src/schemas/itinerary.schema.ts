import { z } from 'zod';

export const ItineraryEntrySchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  dayNumber: z.number().int().positive(),
  title: z.string().min(1).max(300),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  location: z.string().max(500).nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  notes: z.string().max(2000).nullable(),
  sortOrder: z.number().int().nonnegative(),
  isAiGenerated: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateItineraryEntrySchema = ItineraryEntrySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateItineraryEntrySchema = ItineraryEntrySchema.partial().required({ id: true });
