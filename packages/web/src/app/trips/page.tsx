'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Trip } from '@tripflow/shared';
import { tripsApi } from '../../lib/api-client';
import { TripCard } from '../../components/trips/TripCard';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function TripsListPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tripsApi
      .list()
      .then(setTrips)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Failed to load trips: {error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
        <Button onClick={() => router.push('/trips/new')}>New Trip</Button>
      </div>
      {trips.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>No trips yet. Create your first trip to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onClick={() => router.push(`/trips/${trip.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
