'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { SyncOperation, SyncBatch } from '@tripflow/shared';
import { createOfflineQueue, type OfflineQueue } from './offline-queue';
import { syncApi } from './api-client';

export type SyncStatus = 'synced' | 'syncing' | 'pending';

const CLIENT_ID_KEY = 'tripflow_client_id';
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

function getClientId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

function calculateBackoff(attempt: number): number {
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempt), 30000);
}

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [pendingCount, setPendingCount] = useState(0);

  return { status, setStatus, pendingCount, setPendingCount };
}

export function useOfflineQueue() {
  const queueRef = useRef<OfflineQueue | null>(null);
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [pendingCount, setPendingCount] = useState(0);
  const retryCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    queueRef.current = createOfflineQueue();
    const count = queueRef.current.size();
    setPendingCount(count);
    if (count > 0) {
      setStatus('pending');
    }
  }, []);

  const addOperation = useCallback((operation: SyncOperation) => {
    if (!queueRef.current) return;
    queueRef.current.add(operation);
    const count = queueRef.current.size();
    setPendingCount(count);
    setStatus('pending');
  }, []);

  const flush = useCallback(async (): Promise<boolean> => {
    if (!queueRef.current) return false;
    const operations = queueRef.current.getAll();
    if (operations.length === 0) {
      setStatus('synced');
      return true;
    }

    setStatus('syncing');

    const batch: SyncBatch = {
      operations,
      clientId: getClientId(),
      batchTimestamp: new Date().toISOString(),
    };

    try {
      await syncApi.push(batch);
      queueRef.current.clear();
      setPendingCount(0);
      setStatus('synced');
      retryCountRef.current = 0;
      return true;
    } catch {
      setStatus('pending');
      retryCountRef.current += 1;

      if (retryCountRef.current < MAX_RETRIES) {
        const delay = calculateBackoff(retryCountRef.current);
        timerRef.current = setTimeout(() => {
          flush();
        }, delay);
      }
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      flush();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [flush]);

  return {
    status,
    pendingCount,
    addOperation,
    flush,
    queue: queueRef,
  };
}
