import { z } from 'zod';

export const TripStatusSchema = z.enum(['planning', 'travelling', 'completed']);

export const TripSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  destination: z.string().min(1).max(500),
  startDate: z.string().date(),
  endDate: z.string().date(),
  currency: z.string().length(3),
  status: TripStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateTripSchema = TripSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTripSchema = TripSchema.partial().required({ id: true });
