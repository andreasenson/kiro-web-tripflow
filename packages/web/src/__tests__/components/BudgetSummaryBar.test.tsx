import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetSummaryBar } from '../../components/budget/BudgetSummaryBar';

describe('BudgetSummaryBar', () => {
  it('renders spent and budget amounts', () => {
    render(<BudgetSummaryBar allocated={1000} spent={250} currency="USD" />);

    expect(screen.getByText('Spent: USD 250.00')).toBeInTheDocument();
    expect(screen.getByText('Budget: USD 1000.00')).toBeInTheDocument();
  });

  it('shows correct percentage used', () => {
    render(<BudgetSummaryBar allocated={1000} spent={250} />);

    expect(screen.getByText('25% used')).toBeInTheDocument();
  });

  it('shows 50% for half budget used', () => {
    render(<BudgetSummaryBar allocated={200} spent={100} />);

    expect(screen.getByText('50% used')).toBeInTheDocument();
  });

  it('shows over budget message when spent exceeds allocated', () => {
    render(<BudgetSummaryBar allocated={500} spent={750} currency="EUR" />);

    expect(screen.getByText(/Over budget by EUR 250.00/)).toBeInTheDocument();
  });

  it('caps the percentage at 100% visually', () => {
    const { container } = render(
      <BudgetSummaryBar allocated={500} spent={750} />,
    );

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('handles zero allocated budget without errors', () => {
    render(<BudgetSummaryBar allocated={0} spent={0} />);

    expect(screen.getByText('0% used')).toBeInTheDocument();
  });

  it('uses USD as default currency', () => {
    render(<BudgetSummaryBar allocated={100} spent={50} />);

    expect(screen.getByText('Spent: USD 50.00')).toBeInTheDocument();
    expect(screen.getByText('Budget: USD 100.00')).toBeInTheDocument();
  });
});
