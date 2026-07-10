'use client';

import { useState } from 'react';
import type { ItineraryEntry } from '@tripflow/shared';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ItineraryEntryFormProps {
  tripId: string;
  dayNumber: number;
  entry?: ItineraryEntry;
  onSubmit: (data: {
    tripId: string;
    dayNumber: number;
    title: string;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    notes: string | null;
    sortOrder: number;
    isAiGenerated: boolean;
    latitude: number | null;
    longitude: number | null;
  }) => void;
  onCancel?: () => void;
}

export function ItineraryEntryForm({
  tripId,
  dayNumber,
  entry,
  onSubmit,
  onCancel,
}: ItineraryEntryFormProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [startTime, setStartTime] = useState(entry?.startTime || '');
  const [endTime, setEndTime] = useState(entry?.endTime || '');
  const [location, setLocation] = useState(entry?.location || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      tripId,
      dayNumber,
      title: title.trim(),
      startTime: startTime || null,
      endTime: endTime || null,
      location: location || null,
      notes: notes || null,
      sortOrder: entry?.sortOrder ?? 0,
      isAiGenerated: entry?.isAiGenerated ?? false,
      latitude: entry?.latitude ?? null,
      longitude: entry?.longitude ?? null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <Input
          label="End Time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <Input
        label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{entry ? 'Update' : 'Add Entry'}</Button>
      </div>
    </form>
  );
}
