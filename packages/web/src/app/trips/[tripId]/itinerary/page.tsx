'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { ItineraryEntry, Trip } from '@tripflow/shared';
import { itineraryApi, tripsApi } from '../../../../lib/api-client';
import { ItineraryDayView } from '../../../../components/itinerary/ItineraryDayView';
import { ItineraryEntryForm } from '../../../../components/itinerary/ItineraryEntryForm';
import { Button } from '../../../../components/ui/Button';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';

export default function ItineraryPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [entries, setEntries] = useState<ItineraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ItineraryEntry | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [tripData, entryData] = await Promise.all([
        tripsApi.get(tripId),
        itineraryApi.list(tripId),
      ]);
      setTrip(tripData);
      setEntries(entryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load itinerary data');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddEntry = async (data: Parameters<typeof itineraryApi.create>[1]) => {
    try {
      setError(null);
      await itineraryApi.create(tripId, data);
      await loadData();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry');
    }
  };

  const handleEditEntry = async (data: Parameters<typeof itineraryApi.create>[1]) => {
    if (!editingEntry) return;
    try {
      setError(null);
      await itineraryApi.update(tripId, editingEntry.id, data);
      await loadData();
      setEditingEntry(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      setError(null);
      await itineraryApi.delete(tripId, entryId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  const handleMoveUp = async (entryId: string) => {
    const dayEntries = entries
      .filter((e) => e.dayNumber === selectedDay)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const index = dayEntries.findIndex((e) => e.id === entryId);
    if (index <= 0) return;

    const items = dayEntries.map((e, i) => ({
      id: e.id,
      sortOrder: i === index ? dayEntries[index - 1].sortOrder : i === index - 1 ? dayEntries[index].sortOrder : e.sortOrder,
    }));

    try {
      setError(null);
      await itineraryApi.reorder(tripId, items);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder entries');
    }
  };

  const handleMoveDown = async (entryId: string) => {
    const dayEntries = entries
      .filter((e) => e.dayNumber === selectedDay)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const index = dayEntries.findIndex((e) => e.id === entryId);
    if (index >= dayEntries.length - 1) return;

    const items = dayEntries.map((e, i) => ({
      id: e.id,
      sortOrder: i === index ? dayEntries[index + 1].sortOrder : i === index + 1 ? dayEntries[index].sortOrder : e.sortOrder,
    }));

    try {
      setError(null);
      await itineraryApi.reorder(tripId, items);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder entries');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  const totalDays = trip
    ? Math.ceil(
        (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1
    : 1;
  const dayEntries = entries.filter((e) => e.dayNumber === selectedDay);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Itinerary</h1>
        <Button onClick={() => setShowForm(true)}>Add Entry</Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              selectedDay === day
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day {day}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 font-medium text-gray-900">Add Entry to Day {selectedDay}</h3>
          <ItineraryEntryForm
            tripId={tripId}
            dayNumber={selectedDay}
            onSubmit={handleAddEntry}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingEntry && (
        <div className="mb-6 rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 font-medium text-gray-900">Edit Entry</h3>
          <ItineraryEntryForm
            tripId={tripId}
            dayNumber={editingEntry.dayNumber}
            entry={editingEntry}
            onSubmit={handleEditEntry}
            onCancel={() => setEditingEntry(null)}
          />
        </div>
      )}

      <ItineraryDayView
        dayNumber={selectedDay}
        entries={dayEntries}
        onEdit={(entry) => setEditingEntry(entry)}
        onDelete={handleDeleteEntry}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />
    </div>
  );
}
