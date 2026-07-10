'use client';

import type { ItineraryEntry } from '@tripflow/shared';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ItineraryDayViewProps {
  dayNumber: number;
  entries: ItineraryEntry[];
  onEdit?: (entry: ItineraryEntry) => void;
  onDelete?: (entryId: string) => void;
  onMoveUp?: (entryId: string) => void;
  onMoveDown?: (entryId: string) => void;
}

export function ItineraryDayView({
  dayNumber,
  entries,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ItineraryDayViewProps) {
  const sortedEntries = [...entries].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold text-gray-800">Day {dayNumber}</h3>
      <div className="space-y-3">
        {sortedEntries.length === 0 && (
          <p className="text-sm text-gray-500 italic">No entries for this day yet.</p>
        )}
        {sortedEntries.map((entry, index) => (
          <Card key={entry.id} className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{entry.title}</h4>
                {entry.isAiGenerated && (
                  <Badge variant="info">AI generated</Badge>
                )}
              </div>
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
            <div className="ml-4 flex items-center gap-1">
              {onMoveUp && index > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveUp(entry.id)}
                  aria-label="Move up"
                >
                  &#8593;
                </Button>
              )}
              {onMoveDown && index < sortedEntries.length - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveDown(entry.id)}
                  aria-label="Move down"
                >
                  &#8595;
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(entry)}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(entry.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
