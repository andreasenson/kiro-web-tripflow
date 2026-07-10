'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface AiGenerationFormProps {
  onGenerate: (preferences: {
    interests: string[];
    pace: 'relaxed' | 'moderate' | 'packed';
    budgetLevel: 'budget' | 'moderate' | 'luxury';
    notes?: string;
  }) => void;
  loading?: boolean;
}

const INTEREST_OPTIONS = [
  'Culture',
  'Food',
  'Nature',
  'Adventure',
  'Shopping',
  'History',
  'Nightlife',
  'Art',
  'Architecture',
  'Photography',
  'Relaxation',
  'Sports',
];

export function AiGenerationForm({ onGenerate, loading = false }: AiGenerationFormProps) {
  const [interests, setInterests] = useState<string[]>([]);
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'packed'>('moderate');
  const [budgetLevel, setBudgetLevel] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
  const [notes, setNotes] = useState('');

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      interests,
      pace,
      budgetLevel,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Interests (select multiple)
        </label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                interests.includes(interest)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <Select
        label="Pace"
        value={pace}
        onChange={(e) => setPace(e.target.value as 'relaxed' | 'moderate' | 'packed')}
        options={[
          { value: 'relaxed', label: 'Relaxed - fewer activities, more free time' },
          { value: 'moderate', label: 'Moderate - balanced schedule' },
          { value: 'packed', label: 'Packed - filled with activities' },
        ]}
      />

      <Select
        label="Budget Level"
        value={budgetLevel}
        onChange={(e) => setBudgetLevel(e.target.value as 'budget' | 'moderate' | 'luxury')}
        options={[
          { value: 'budget', label: 'Budget - affordable options' },
          { value: 'moderate', label: 'Moderate - moderate spending' },
          { value: 'luxury', label: 'Luxury - premium experiences' },
        ]}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="ai-notes" className="text-sm font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          id="ai-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any specific requests or constraints..."
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Generate Itinerary
      </Button>
    </form>
  );
}
