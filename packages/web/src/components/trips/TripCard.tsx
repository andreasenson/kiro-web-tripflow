'use client';

import type { Trip } from '@tripflow/shared';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface TripCardProps {
  trip: Trip;
  onClick?: (trip: Trip) => void;
}

const statusVariant = {
  planning: 'info' as const,
  travelling: 'success' as const,
  completed: 'default' as const,
};

export function TripCard({ trip, onClick }: TripCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(trip)}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{trip.title}</h3>
          <p className="text-sm text-gray-600">{trip.destination}</p>
        </div>
        <Badge variant={statusVariant[trip.status]}>{trip.status}</Badge>
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
        <span>{trip.startDate} - {trip.endDate}</span>
        <span>{trip.currency}</span>
      </div>
    </Card>
  );
}
