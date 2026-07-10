import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpenseForm } from '../../components/budget/ExpenseForm';
import type { BudgetCategory } from '@tripflow/shared';

const mockCategories: BudgetCategory[] = [
  {
    id: 'cat-1',
    tripId: 'trip-1',
    name: 'Food',
    allocatedAmount: 500,
  },
  {
    id: 'cat-2',
    tripId: 'trip-1',
    name: 'Transport',
    allocatedAmount: 300,
  },
];

describe('ExpenseForm', () => {
  it('renders amount, category, date, and note fields', () => {
    render(
      <ExpenseForm
        tripId="trip-1"
        categories={mockCategories}
        currency="USD"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
  });

  it('renders category options from props', () => {
    render(
      <ExpenseForm
        tripId="trip-1"
        categories={mockCategories}
        currency="USD"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Transport' })).toBeInTheDocument();
  });

  it('calls onSubmit with correct data when form is valid', () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseForm
        tripId="trip-1"
        categories={mockCategories}
        currency="USD"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '25.50' },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'cat-2' },
    });
    fireEvent.change(screen.getByLabelText(/note/i), {
      target: { value: 'Taxi ride' },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2025-07-05' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      tripId: 'trip-1',
      categoryId: 'cat-2',
      amount: 25.5,
      currency: 'USD',
      note: 'Taxi ride',
      date: '2025-07-05',
    });
  });

  it('shows validation error for invalid amount', () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseForm
        tripId="trip-1"
        categories={mockCategories}
        currency="USD"
        onSubmit={onSubmit}
      />,
    );

    // Submit without filling amount
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument();
  });

  it('shows cancel button when onCancel is provided', () => {
    const onCancel = vi.fn();
    render(
      <ExpenseForm
        tripId="trip-1"
        categories={mockCategories}
        currency="USD"
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalled();
  });

  it('clears form after successful submission', () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseForm
        tripId="trip-1"
        categories={mockCategories}
        currency="USD"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/note/i), {
      target: { value: 'Coffee' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

    expect((screen.getByLabelText(/amount/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/note/i) as HTMLInputElement).value).toBe('');
  });
});
