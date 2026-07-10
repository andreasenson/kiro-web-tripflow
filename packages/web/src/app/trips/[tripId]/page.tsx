'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Trip } from '@tripflow/shared';
import { tripsApi } from '../../../lib/api-client';
import { ModeSwitcher } from '../../../components/mode/ModeSwitcher';
import { SyncStatusIndicator } from '../../../components/sync/SyncStatusIndicator';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { useOfflineQueue } from '../../../lib/sync-manager';

type Tab = 'itinerary' | 'budget' | 'ai';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const { status: syncStatus, pendingCount } = useOfflineQueue();

  useEffect(() => {
    tripsApi
      .get(tripId)
      .then(setTrip)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tripId]);

  const handleModeChange = async (newMode: 'planning' | 'travelling' | 'completed') => {
    try {
      const updated = await tripsApi.updateMode(tripId, newMode);
      setTrip(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Failed to load trip: {error || 'Not found'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
            <p className="text-gray-600">{trip.destination}</p>
            <p className="text-sm text-gray-500">{trip.startDate} - {trip.endDate}</p>
          </div>
          <SyncStatusIndicator status={syncStatus} pendingCount={pendingCount} />
        </div>
        <div className="mt-4">
          <ModeSwitcher trip={trip} onModeChange={handleModeChange} />
        </div>
      </div>

      {trip.status === 'travelling' && (
        <div className="mb-4">
          <Button
            variant="secondary"
            onClick={() => router.push(`/trips/${tripId}/today`)}
          >
            View Today
          </Button>
        </div>
      )}

      <div className="mb-6 flex gap-1 border-b border-gray-200">
        {(['itinerary', 'budget', 'ai'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'ai' ? 'AI Assist' : tab}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'itinerary' && (
          <Button onClick={() => router.push(`/trips/${tripId}/itinerary`)}>
            Go to Itinerary
          </Button>
        )}
        {activeTab === 'budget' && (
          <Button onClick={() => router.push(`/trips/${tripId}/budget`)}>
            Go to Budget
          </Button>
        )}
        {activeTab === 'ai' && (
          <Button onClick={() => router.push(`/trips/${tripId}/ai`)}>
            Go to AI Assist
          </Button>
        )}
      </div>
    </div>
  );
}
