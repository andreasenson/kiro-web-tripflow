import type { Trip, CreateTrip, UpdateTrip, TripStatus } from '@tripflow/shared';
import { CreateTripSchema, TripStatusSchema } from '@tripflow/shared';

const trips: Map<string, Trip> = new Map();

export function findAll(): Trip[] {
  return Array.from(trips.values());
}

export function findOne(id: string): Trip | undefined {
  return trips.get(id);
}

export function create(data: CreateTrip): Trip {
  const parsed = CreateTripSchema.parse(data);
  const now = new Date().toISOString();
  const trip: Trip = {
    ...parsed,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  trips.set(trip.id, trip);
  return trip;
}

export function update(id: string, data: Partial<UpdateTrip>): Trip | undefined {
  const existing = trips.get(id);
  if (!existing) return undefined;

  const updated: Trip = {
    ...existing,
    ...data,
    id: existing.id, // prevent id override
    createdAt: existing.createdAt, // prevent createdAt override
    updatedAt: new Date().toISOString(),
  };
  trips.set(id, updated);
  return updated;
}

export function remove(id: string): boolean {
  return trips.delete(id);
}

export function switchMode(id: string, status: TripStatus): Trip | undefined {
  const existing = trips.get(id);
  if (!existing) return undefined;

  const parsed = TripStatusSchema.parse(status);
  const updated: Trip = {
    ...existing,
    status: parsed,
    updatedAt: new Date().toISOString(),
  };
  trips.set(id, updated);
  return updated;
}

/** Clear all trips (useful for testing) */
export function clear(): void {
  trips.clear();
}
