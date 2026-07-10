import { describe, it, expect, beforeEach } from 'vitest';
import { createOfflineQueue } from '../lib/offline-queue';
import type { SyncOperation } from '@tripflow/shared';

function createMockStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

function createMockOperation(id: string): SyncOperation {
  return {
    id,
    entityType: 'trip',
    entityId: 'entity-1',
    operationType: 'create',
    changedFields: { title: 'Test Trip' },
    clientTimestamp: new Date().toISOString(),
    serverSequence: null,
  };
}

describe('Offline Queue', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMockStorage();
  });

  it('should add operations to the queue', () => {
    const queue = createOfflineQueue(storage);
    const op = createMockOperation('op-1');

    queue.add(op);

    expect(queue.size()).toBe(1);
    expect(queue.getAll()).toEqual([op]);
  });

  it('should store multiple operations', () => {
    const queue = createOfflineQueue(storage);
    const op1 = createMockOperation('op-1');
    const op2 = createMockOperation('op-2');

    queue.add(op1);
    queue.add(op2);

    expect(queue.size()).toBe(2);
    expect(queue.getAll()).toEqual([op1, op2]);
  });

  it('should clear all operations', () => {
    const queue = createOfflineQueue(storage);
    queue.add(createMockOperation('op-1'));
    queue.add(createMockOperation('op-2'));

    queue.clear();

    expect(queue.size()).toBe(0);
    expect(queue.getAll()).toEqual([]);
  });

  it('should remove a specific operation by id', () => {
    const queue = createOfflineQueue(storage);
    const op1 = createMockOperation('op-1');
    const op2 = createMockOperation('op-2');
    queue.add(op1);
    queue.add(op2);

    queue.remove('op-1');

    expect(queue.size()).toBe(1);
    expect(queue.getAll()).toEqual([op2]);
  });

  it('should persist operations across queue instances (simulating reload)', () => {
    const queue1 = createOfflineQueue(storage);
    const op = createMockOperation('op-1');
    queue1.add(op);

    // Create a new queue instance with the same storage (simulating page reload)
    const queue2 = createOfflineQueue(storage);

    expect(queue2.size()).toBe(1);
    expect(queue2.getAll()).toEqual([op]);
  });

  it('should not lose data when storage getItem returns corrupted data', () => {
    storage.setItem('tripflow_offline_queue', 'invalid-json');
    const queue = createOfflineQueue(storage);

    expect(queue.size()).toBe(0);
    expect(queue.getAll()).toEqual([]);
  });

  it('should handle empty storage gracefully', () => {
    const queue = createOfflineQueue(storage);

    expect(queue.size()).toBe(0);
    expect(queue.getAll()).toEqual([]);
  });

  it('should preserve operation order', () => {
    const queue = createOfflineQueue(storage);
    const ops = Array.from({ length: 5 }, (_, i) => createMockOperation(`op-${i}`));

    ops.forEach((op) => queue.add(op));

    expect(queue.getAll()).toEqual(ops);
  });
});
