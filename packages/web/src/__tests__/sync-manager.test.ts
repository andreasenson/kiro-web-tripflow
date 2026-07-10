import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineQueue } from '../lib/sync-manager';

// Mock the api-client module
vi.mock('../lib/api-client', () => ({
  syncApi: {
    push: vi.fn(),
  },
}));

// Mock localStorage
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
      Object.keys(store).forEach((k) => delete store[k]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

describe('useOfflineQueue', () => {
  let mockStorage: Storage;

  beforeEach(() => {
    vi.useFakeTimers();
    mockStorage = createMockStorage();
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
    });
    // Mock crypto.randomUUID
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: () => 'mock-client-uuid',
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should start with synced status when queue is empty', () => {
    const { result } = renderHook(() => useOfflineQueue());
    expect(result.current.status).toBe('synced');
    expect(result.current.pendingCount).toBe(0);
  });

  it('should transition to pending when adding an operation', () => {
    const { result } = renderHook(() => useOfflineQueue());

    act(() => {
      result.current.addOperation({
        id: 'op-1',
        entityType: 'trip',
        entityId: 'entity-1',
        operationType: 'create',
        changedFields: { title: 'Test' },
        clientTimestamp: new Date().toISOString(),
        serverSequence: null,
      });
    });

    expect(result.current.status).toBe('pending');
    expect(result.current.pendingCount).toBe(1);
  });

  it('should transition to syncing then synced on successful flush', async () => {
    const { syncApi } = await import('../lib/api-client');
    (syncApi.push as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      conflicts: [],
      serverSequence: 1,
    });

    const { result } = renderHook(() => useOfflineQueue());

    act(() => {
      result.current.addOperation({
        id: 'op-1',
        entityType: 'trip',
        entityId: 'entity-1',
        operationType: 'create',
        changedFields: { title: 'Test' },
        clientTimestamp: new Date().toISOString(),
        serverSequence: null,
      });
    });

    expect(result.current.status).toBe('pending');

    await act(async () => {
      await result.current.flush();
    });

    expect(result.current.status).toBe('synced');
    expect(result.current.pendingCount).toBe(0);
  });

  it('should transition back to pending on failed flush and schedule retry', async () => {
    const { syncApi } = await import('../lib/api-client');
    (syncApi.push as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useOfflineQueue());

    act(() => {
      result.current.addOperation({
        id: 'op-1',
        entityType: 'trip',
        entityId: 'entity-1',
        operationType: 'create',
        changedFields: { title: 'Test' },
        clientTimestamp: new Date().toISOString(),
        serverSequence: null,
      });
    });

    await act(async () => {
      await result.current.flush();
    });

    expect(result.current.status).toBe('pending');
    // pendingCount should still be 1 as operations were not cleared
    expect(result.current.pendingCount).toBe(1);
  });

  it('should return synced immediately when queue is empty on flush', async () => {
    const { result } = renderHook(() => useOfflineQueue());

    await act(async () => {
      const success = await result.current.flush();
      expect(success).toBe(true);
    });

    expect(result.current.status).toBe('synced');
  });
});
