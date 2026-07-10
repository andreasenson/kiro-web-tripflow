import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TripCard } from '../../components/trips/TripCard';
import type { Trip } from '@tripflow/shared';

const mockTrip: Trip = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Summer in Tokyo',
  destination: 'Tokyo, Japan',
  startDate: '2025-07-01',
  endDate: '2025-07-14',
  currency: 'JPY',
  status: 'planning',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('TripCard', () => {
  it('renders trip title and destination', () => {
    render(<TripCard trip={mockTrip} />);

    expect(screen.getByText('Summer in Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument();
  });

  it('renders trip dates', () => {
    render(<TripCard trip={mockTrip} />);

    expect(screen.getByText('2025-07-01 - 2025-07-14')).toBeInTheDocument();
  });

  it('renders trip currency', () => {
    render(<TripCard trip={mockTrip} />);

    expect(screen.getByText('JPY')).toBeInTheDocument();
  });

  it('renders trip status badge', () => {
    render(<TripCard trip={mockTrip} />);

    expect(screen.getByText('planning')).toBeInTheDocument();
  });

  it('renders travelling status badge for travelling trips', () => {
    const travellingTrip: Trip = { ...mockTrip, status: 'travelling' };
    render(<TripCard trip={travellingTrip} />);

    expect(screen.getByText('travelling')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<TripCard trip={mockTrip} onClick={handleClick} />);

    const card = screen.getByText('Summer in Tokyo').closest('div');
    if (card) fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledWith(mockTrip);
  });
});
