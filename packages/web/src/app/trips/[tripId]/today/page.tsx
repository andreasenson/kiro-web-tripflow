'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { ItineraryEntry, Trip, BudgetCategory, SyncOperation } from '@tripflow/shared';
import { itineraryApi, tripsApi, budgetApi } from '../../../../lib/api-client';
import { ItineraryDayView } from '../../../../components/itinerary/ItineraryDayView';
import { ExpenseForm } from '../../../../components/budget/ExpenseForm';
import { SyncStatusIndicator } from '../../../../components/sync/SyncStatusIndicator';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Card } from '../../../../components/ui/Card';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';
import { useOfflineQueue } from '../../../../lib/sync-manager';

export default function TodayPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [entries, setEntries] = useState<ItineraryEntry[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const { status: syncStatus, pendingCount, addOperation, flush } = useOfflineQueue();

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [tripData, entryData, categoriesData] = await Promise.all([
        tripsApi.get(tripId),
        itineraryApi.list(tripId),
        budgetApi.listCategories(tripId),
      ]);
      setTrip(tripData);
      setEntries(entryData);
      setCategories(categoriesData);

      // Calculate current day based on trip start date
      const start = new Date(tripData.startDate);
      const today = new Date();
      const diffDays = Math.floor(
        (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      setCurrentDay(Math.max(1, diffDays + 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddExpense = async (data: {
    tripId: string;
    categoryId: string;
    amount: number;
    currency: string;
    note: string | null;
    date: string;
  }) => {
    try {
      setError(null);
      const expenseId = crypto.randomUUID();

      // Route through offline queue for offline-first behavior
      const operation: SyncOperation = {
        id: crypto.randomUUID(),
        entityType: 'expense',
        entityId: expenseId,
        operationType: 'create',
        changedFields: {
          tripId: data.tripId,
          categoryId: data.categoryId,
          amount: data.amount,
          currency: data.currency,
          note: data.note,
          date: data.date,
        },
        clientTimestamp: new Date().toISOString(),
        serverSequence: null,
      };

      addOperation(operation);

      // Also attempt direct API call if online for immediate server state
      if (isOnline) {
        try {
          await budgetApi.createExpense(tripId, data);
          await loadData();
        } catch {
          // Direct API failed but operation is queued for sync - this is fine
        }
      }

      // Attempt to flush the queue if online
      if (isOnline) {
        flush();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  const todayEntries = entries.filter((e) => e.dayNumber === currentDay);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Today</h1>
        <div className="flex items-center gap-3">
          {!isOnline && <Badge variant="warning">Offline</Badge>}
          <SyncStatusIndicator status={syncStatus} pendingCount={pendingCount} />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentDay((d) => Math.max(1, d - 1))}
          disabled={currentDay <= 1}
        >
          Previous Day
        </Button>
        <span className="font-medium text-gray-700">Day {currentDay}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentDay((d) => d + 1)}
        >
          Next Day
        </Button>
      </div>

      <ItineraryDayView dayNumber={currentDay} entries={todayEntries} />

      {trip && categories.length > 0 && (
        <Card className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Quick Expense</h2>
          <ExpenseForm
            tripId={tripId}
            categories={categories}
            currency={trip.currency}
            onSubmit={handleAddExpense}
          />
        </Card>
      )}
    </div>
  );
}
