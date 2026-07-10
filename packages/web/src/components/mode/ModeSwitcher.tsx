'use client';

import { useState, useEffect } from 'react';
import type { Trip, TripStatus } from '@tripflow/shared';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ModeSwitcherProps {
  trip: Trip;
  onModeChange: (newMode: TripStatus) => void;
}

export function ModeSwitcher({ trip, onModeChange }: ModeSwitcherProps) {
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    if (trip.status === 'planning') {
      const today = new Date().toISOString().split('T')[0];
      if (trip.startDate <= today) {
        setShowSuggestion(true);
      }
    }
  }, [trip.status, trip.startDate]);

  const isPlanning = trip.status === 'planning';
  const isTravelling = trip.status === 'travelling';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Mode:</span>
        <Badge variant={isPlanning ? 'info' : isTravelling ? 'success' : 'default'}>
          {trip.status}
        </Badge>
        {isPlanning && (
          <Button size="sm" variant="secondary" onClick={() => onModeChange('travelling')}>
            Switch to Travelling
          </Button>
        )}
        {isTravelling && (
          <Button size="sm" variant="secondary" onClick={() => onModeChange('completed')}>
            Mark Completed
          </Button>
        )}
      </div>
      {showSuggestion && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            Your trip start date has arrived! Would you like to switch to Travelling mode?
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onModeChange('travelling');
                setShowSuggestion(false);
              }}
            >
              Switch Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSuggestion(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
