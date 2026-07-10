'use client';

import type { SyncStatus } from '../../lib/sync-manager';
import { Badge } from '../ui/Badge';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  pendingCount?: number;
}

const statusConfig: Record<SyncStatus, { label: string; variant: 'success' | 'warning' | 'info' }> = {
  synced: { label: 'Synced', variant: 'success' },
  syncing: { label: 'Syncing...', variant: 'info' },
  pending: { label: 'Offline - Pending', variant: 'warning' },
};

export function SyncStatusIndicator({ status, pendingCount }: SyncStatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant}>
        {config.label}
        {status === 'pending' && pendingCount !== undefined && pendingCount > 0 && (
          <span className="ml-1">({pendingCount})</span>
        )}
      </Badge>
    </div>
  );
}
