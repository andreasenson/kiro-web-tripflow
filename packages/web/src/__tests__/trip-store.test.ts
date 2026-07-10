import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  findAll,
  findOne,
  create,
  update,
  remove,
  switchMode,
  clear,
} from '../lib/trip-store';
import type { CreateTrip } from '@tripflow/shared';

const validTrip: CreateTrip = {
  title: 'Test Trip',
  destination: 'Tokyo, Japan',
  startDate: '2025-03-01',
  endDate: '2025-03-10',
  currency: 'USD',
  status: 'planning',
};

describe('trip-store', () => {
  beforeEach(() => {
    clear();
  });

  describe('create', () => {
    it('should create a trip with generated id, createdAt, updatedAt', () => {
      const trip = create(validTrip);
      expect(trip.id).toBeDefined();
      expect(trip.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(trip.title).toBe('Test Trip');
      expect(trip.destination).toBe('Tokyo, Japan');
      expect(trip.startDate).toBe('2025-03-01');
      expect(trip.endDate).toBe('2025-03-10');
      expect(trip.currency).toBe('USD');
      expect(trip.status).toBe('planning');
      expect(trip.createdAt).toBeDefined();
      expect(trip.updatedAt).toBeDefined();
    });

    it('should throw on invalid data', () => {
      expect(() =>
        create({ ...validTrip, title: '' }),
      ).toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no trips', () => {
      expect(findAll()).toEqual([]);
    });

    it('should return all created trips', () => {
      create(validTrip);
      create({ ...validTrip, title: 'Second Trip' });
      expect(findAll()).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a trip by id', () => {
      const trip = create(validTrip);
      const found = findOne(trip.id);
      expect(found).toEqual(trip);
    });

    it('should return undefined for non-existent id', () => {
      expect(findOne('non-existent-id')).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update specified fields', () => {
      const trip = create(validTrip);
      // Advance time to ensure updatedAt differs
      vi.useFakeTimers();
      vi.setSystemTime(new Date(Date.now() + 1000));
      const updated = update(trip.id, { title: 'Updated Title' });
      vi.useRealTimers();
      expect(updated).toBeDefined();
      expect(updated!.title).toBe('Updated Title');
      expect(updated!.destination).toBe('Tokyo, Japan');
      expect(updated!.updatedAt).not.toBe(trip.updatedAt);
    });

    it('should not allow overriding id or createdAt', () => {
      const trip = create(validTrip);
      const updated = update(trip.id, {
        id: 'hacked-id',
        createdAt: '2000-01-01T00:00:00.000Z',
      } as any);
      expect(updated!.id).toBe(trip.id);
      expect(updated!.createdAt).toBe(trip.createdAt);
    });

    it('should throw on invalid field values', () => {
      const trip = create(validTrip);
      // title must be non-empty string with min 1
      expect(() => update(trip.id, { title: '' })).toThrow();
    });

    it('should throw on invalid currency length', () => {
      const trip = create(validTrip);
      // currency must be exactly 3 characters
      expect(() => update(trip.id, { currency: 'ABCD' })).toThrow();
    });

    it('should throw on invalid status value', () => {
      const trip = create(validTrip);
      expect(() => update(trip.id, { status: 'invalid' as any })).toThrow();
    });

    it('should strip unknown fields via schema validation', () => {
      const trip = create(validTrip);
      // Unknown fields should be stripped by the schema (strict parsing removes them)
      const updated = update(trip.id, { title: 'New Title', unknownField: 'bad' } as any);
      expect(updated!.title).toBe('New Title');
      expect((updated as any).unknownField).toBeUndefined();
    });

    it('should return undefined for non-existent id', () => {
      expect(update('non-existent', { title: 'X' })).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should delete a trip and return true', () => {
      const trip = create(validTrip);
      expect(remove(trip.id)).toBe(true);
      expect(findOne(trip.id)).toBeUndefined();
    });

    it('should return false for non-existent id', () => {
      expect(remove('non-existent')).toBe(false);
    });
  });

  describe('switchMode', () => {
    it('should update the status field', () => {
      const trip = create(validTrip);
      const updated = switchMode(trip.id, 'travelling');
      expect(updated).toBeDefined();
      expect(updated!.status).toBe('travelling');
    });

    it('should throw for invalid status', () => {
      const trip = create(validTrip);
      expect(() => switchMode(trip.id, 'invalid' as any)).toThrow();
    });

    it('should return undefined for non-existent id', () => {
      expect(switchMode('non-existent', 'completed')).toBeUndefined();
    });
  });
});
