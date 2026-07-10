import type { SyncOperation } from '@tripflow/shared';

const STORAGE_KEY = 'tripflow_offline_queue';

export interface OfflineQueue {
  add(operation: SyncOperation): void;
  getAll(): SyncOperation[];
  clear(): void;
  remove(operationId: string): void;
  size(): number;
  getLastError(): string | null;
}

export function createOfflineQueue(storage?: Storage): OfflineQueue {
  const store = storage || (typeof window !== 'undefined' ? window.localStorage : undefined);

  // In-memory fallback for when localStorage is unavailable or full
  let inMemoryOperations: SyncOperation[] | null = null;
  let lastError: string | null = null;

  function getOperations(): SyncOperation[] {
    // If we're in fallback mode, use in-memory operations
    if (inMemoryOperations !== null) {
      return [...inMemoryOperations];
    }
    if (!store) return [];
    try {
      const data = store.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as SyncOperation[];
    } catch {
      return [];
    }
  }

  function saveOperations(operations: SyncOperation[]): void {
    if (!store) {
      // No storage available, keep in memory
      inMemoryOperations = operations;
      lastError = 'localStorage is unavailable - operations stored in memory only';
      return;
    }
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(operations));
      // If we were in fallback mode and save succeeded, exit fallback
      if (inMemoryOperations !== null) {
        inMemoryOperations = null;
        lastError = null;
      }
    } catch (err: unknown) {
      // Storage full or unavailable - switch to in-memory fallback
      inMemoryOperations = operations;
      const errorMessage = err instanceof Error ? err.message : 'Unknown storage error';
      lastError = `Failed to persist to localStorage: ${errorMessage}. Operations stored in memory only and will be lost on page reload.`;
    }
  }

  return {
    add(operation: SyncOperation): void {
      const operations = getOperations();
      operations.push(operation);
      saveOperations(operations);
    },

    getAll(): SyncOperation[] {
      return getOperations();
    },

    clear(): void {
      if (inMemoryOperations !== null) {
        inMemoryOperations = null;
        lastError = null;
      }
      if (store) {
        store.removeItem(STORAGE_KEY);
      }
    },

    remove(operationId: string): void {
      const operations = getOperations().filter((op) => op.id !== operationId);
      saveOperations(operations);
    },

    size(): number {
      return getOperations().length;
    },

    getLastError(): string | null {
      return lastError;
    },
  };
}
