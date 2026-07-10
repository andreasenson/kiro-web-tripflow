'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { BudgetCategory, Expense, Trip } from '@tripflow/shared';
import { budgetApi, tripsApi } from '../../../../lib/api-client';
import { BudgetSummaryBar } from '../../../../components/budget/BudgetSummaryBar';
import { ExpenseForm } from '../../../../components/budget/ExpenseForm';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Card } from '../../../../components/ui/Card';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';

export default function BudgetPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [tripData, categoriesData, expensesData] = await Promise.all([
        tripsApi.get(tripId),
        budgetApi.listCategories(tripId),
        budgetApi.listExpenses(tripId),
      ]);
      setTrip(tripData);
      setCategories(categoriesData);
      setExpenses(expensesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !newCategoryAmount) return;

    try {
      setError(null);
      await budgetApi.createCategory(tripId, {
        tripId,
        name: newCategoryName.trim(),
        allocatedAmount: parseFloat(newCategoryAmount),
      });
      setNewCategoryName('');
      setNewCategoryAmount('');
      setShowCategoryForm(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
    }
  };

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
      await budgetApi.createExpense(tripId, data);
      setShowExpenseForm(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setError(null);
      await budgetApi.deleteCategory(tripId, id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  const totalAllocated = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowCategoryForm(true)}>
            Add Category
          </Button>
          <Button onClick={() => setShowExpenseForm(true)}>Add Expense</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-6">
        <BudgetSummaryBar
          allocated={totalAllocated}
          spent={totalSpent}
          currency={trip?.currency}
        />
      </div>

      {showCategoryForm && (
        <Card className="mb-6">
          <h3 className="mb-3 font-medium text-gray-900">New Category</h3>
          <form onSubmit={handleAddCategory} className="flex gap-3">
            <Input
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Budget amount"
              value={newCategoryAmount}
              onChange={(e) => setNewCategoryAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
            <Button type="submit" size="sm">Add</Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowCategoryForm(false)}
            >
              Cancel
            </Button>
          </form>
        </Card>
      )}

      {showExpenseForm && categories.length > 0 && trip && (
        <Card className="mb-6">
          <h3 className="mb-3 font-medium text-gray-900">New Expense</h3>
          <ExpenseForm
            tripId={tripId}
            categories={categories}
            currency={trip.currency}
            onSubmit={handleAddExpense}
            onCancel={() => setShowExpenseForm(false)}
          />
        </Card>
      )}

      <div className="space-y-4">
        {categories.map((category) => {
          const categoryExpenses = expenses.filter((e) => e.categoryId === category.id);
          const categorySpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

          return (
            <Card key={category.id}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600"
                >
                  Delete
                </Button>
              </div>
              <BudgetSummaryBar
                allocated={category.allocatedAmount}
                spent={categorySpent}
                currency={trip?.currency}
              />
              {categoryExpenses.length > 0 && (
                <div className="mt-3 space-y-1">
                  {categoryExpenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between text-sm text-gray-600">
                      <span>{expense.note || 'Expense'}</span>
                      <span>{trip?.currency} {expense.amount.toFixed(2)} ({expense.date})</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
