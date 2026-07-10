'use client';

interface BudgetSummaryBarProps {
  allocated: number;
  spent: number;
  currency?: string;
}

export function BudgetSummaryBar({ allocated, spent, currency = 'USD' }: BudgetSummaryBarProps) {
  const percentage = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
  const isOverBudget = spent > allocated;

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-gray-600">
          Spent: {currency} {spent.toFixed(2)}
        </span>
        <span className="text-gray-600">
          Budget: {currency} {allocated.toFixed(2)}
        </span>
      </div>
      <div className="h-4 w-full rounded-full bg-gray-200" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`h-4 rounded-full transition-all ${
            isOverBudget ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {percentage.toFixed(0)}% used
        {isOverBudget && (
          <span className="ml-2 text-red-600 font-medium">
            Over budget by {currency} {(spent - allocated).toFixed(2)}
          </span>
        )}
      </p>
    </div>
  );
}
