'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import type { ItineraryEntry } from '@tripflow/shared';
import { aiApi, itineraryApi } from '../../../../lib/api-client';
import { AiGenerationForm } from '../../../../components/ai/AiGenerationForm';
import { AiItineraryReview } from '../../../../components/ai/AiItineraryReview';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';

export default function AiAssistPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [generatedEntries, setGeneratedEntries] = useState<ItineraryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (preferences: {
    interests: string[];
    pace: 'relaxed' | 'moderate' | 'busy';
    budgetLevel: 'budget' | 'mid-range' | 'luxury';
    notes?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.generateItinerary(tripId, preferences);
      setGeneratedEntries(result.entries);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (entry: ItineraryEntry) => {
    try {
      setError(null);
      await itineraryApi.create(tripId, {
        tripId: entry.tripId,
        dayNumber: entry.dayNumber,
        title: entry.title,
        startTime: entry.startTime,
        endTime: entry.endTime,
        location: entry.location,
        latitude: entry.latitude,
        longitude: entry.longitude,
        notes: entry.notes,
        sortOrder: entry.sortOrder,
        isAiGenerated: true,
      });
      setGeneratedEntries((prev) => prev.filter((e) => e.id !== entry.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept entry');
    }
  };

  const handleEdit = (entry: ItineraryEntry) => {
    // For now, accept as-is. A full implementation would open an edit form.
    handleAccept(entry);
  };

  const handleRegenerate = async (entryId: string) => {
    setRegeneratingId(entryId);
    try {
      setError(null);
      const result = await aiApi.regenerateItem(tripId, entryId);
      setGeneratedEntries((prev) =>
        prev.map((e) => (e.id === entryId ? result.entry : e)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate item');
    } finally {
      setRegeneratingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">AI Itinerary Assistant</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Preferences</h2>
          <AiGenerationForm onGenerate={handleGenerate} loading={loading} />
        </div>

        <div>
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-500">Generating your itinerary...</p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && generatedEntries.length > 0 && (
            <AiItineraryReview
              entries={generatedEntries}
              onAccept={handleAccept}
              onEdit={handleEdit}
              onRegenerate={handleRegenerate}
              regeneratingId={regeneratingId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
