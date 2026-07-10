'use client';

import type { ItineraryEntry } from '@tripflow/shared';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AiItineraryReviewProps {
  entries: ItineraryEntry[];
  onAccept: (entry: ItineraryEntry) => void;
  onEdit: (entry: ItineraryEntry) => void;
  onRegenerate: (entryId: string) => void;
  regeneratingId?: string | null;
}

export function AiItineraryReview({
  entries,
  onAccept,
  onEdit,
  onRegenerate,
  regeneratingId,
}: AiItineraryReviewProps) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-gray-500 italic">
        No AI-generated entries yet. Use the form to generate an itinerary.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">AI-Generated Itinerary</h3>
      {entries.map((entry) => (
        <Card key={entry.id}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{entry.title}</h4>
                <Badge variant="info">AI generated</Badge>
              </div>
              <p className="text-sm text-gray-500">Day {entry.dayNumber}</p>
              {entry.startTime && (
                <p className="text-sm text-gray-500">
                  {entry.startTime}
                  {entry.endTime && ` - ${entry.endTime}`}
                </p>
              )}
              {entry.location && (
                <p className="text-sm text-gray-600">{entry.location}</p>
              )}
              {entry.notes && (
                <p className="mt-1 text-sm text-gray-500">{entry.notes}</p>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => onAccept(entry)}>
              Accept
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onEdit(entry)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRegenerate(entry.id)}
              loading={regeneratingId === entry.id}
            >
              Regenerate
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
