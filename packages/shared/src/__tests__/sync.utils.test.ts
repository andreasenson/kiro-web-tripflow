import { fieldLevelMerge, resolveConflict } from '../utils/sync.utils';
import type { FieldVersion } from '../utils/sync.utils';
import type { SyncOperation } from '../types';

describe('resolveConflict', () => {
  it('should resolve in favor of higher serverSequence', () => {
    const local: FieldVersion = {
      value: 'local-value',
      timestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: 5,
    };
    const remote: FieldVersion = {
      value: 'remote-value',
      timestamp: '2024-01-01T09:00:00.000Z',
      serverSequence: 10,
    };

    const result = resolveConflict(local, remote);
    expect(result.resolvedValue).toBe('remote-value');
    expect(result.winner).toBe('remote');
  });

  it('should resolve in favor of local when local has higher serverSequence', () => {
    const local: FieldVersion = {
      value: 'local-value',
      timestamp: '2024-01-01T09:00:00.000Z',
      serverSequence: 15,
    };
    const remote: FieldVersion = {
      value: 'remote-value',
      timestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: 10,
    };

    const result = resolveConflict(local, remote);
    expect(result.resolvedValue).toBe('local-value');
    expect(result.winner).toBe('local');
  });

  it('should prefer server-sequenced value over null sequence', () => {
    const local: FieldVersion = {
      value: 'local-value',
      timestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: null,
    };
    const remote: FieldVersion = {
      value: 'remote-value',
      timestamp: '2024-01-01T09:00:00.000Z',
      serverSequence: 5,
    };

    const result = resolveConflict(local, remote);
    expect(result.resolvedValue).toBe('remote-value');
    expect(result.winner).toBe('remote');
  });

  it('should prefer local when local has serverSequence and remote does not', () => {
    const local: FieldVersion = {
      value: 'local-value',
      timestamp: '2024-01-01T08:00:00.000Z',
      serverSequence: 3,
    };
    const remote: FieldVersion = {
      value: 'remote-value',
      timestamp: '2024-01-01T11:00:00.000Z',
      serverSequence: null,
    };

    const result = resolveConflict(local, remote);
    expect(result.resolvedValue).toBe('local-value');
    expect(result.winner).toBe('local');
  });

  it('should use timestamp when both serverSequences are null (later wins)', () => {
    const local: FieldVersion = {
      value: 'local-value',
      timestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: null,
    };
    const remote: FieldVersion = {
      value: 'remote-value',
      timestamp: '2024-01-01T09:00:00.000Z',
      serverSequence: null,
    };

    const result = resolveConflict(local, remote);
    expect(result.resolvedValue).toBe('local-value');
    expect(result.winner).toBe('local');
  });

  it('should use timestamp when both serverSequences are null (remote later)', () => {
    const local: FieldVersion = {
      value: 'local-value',
      timestamp: '2024-01-01T09:00:00.000Z',
      serverSequence: null,
    };
    const remote: FieldVersion = {
      value: 'remote-value',
      timestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: null,
    };

    const result = resolveConflict(local, remote);
    expect(result.resolvedValue).toBe('remote-value');
    expect(result.winner).toBe('remote');
  });

  it('should resolve in favor of local when serverSequences are equal', () => {
    const local: FieldVersion = {
      value: 'local-value',
      timestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: 5,
    };
    const remote: FieldVersion = {
      value: 'remote-value',
      timestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: 5,
    };

    const result = resolveConflict(local, remote);
    expect(result.resolvedValue).toBe('local-value');
    expect(result.winner).toBe('local');
  });
});

describe('fieldLevelMerge', () => {
  const baseOperation: Omit<SyncOperation, 'changedFields' | 'clientTimestamp' | 'serverSequence'> = {
    id: '00000000-0000-0000-0000-000000000001',
    entityType: 'itineraryEntry',
    entityId: '00000000-0000-0000-0000-000000000010',
    operationType: 'update',
  };

  it('should merge different fields from both operations without conflicts', () => {
    const localOp: SyncOperation = {
      ...baseOperation,
      changedFields: { title: 'New Title' },
      clientTimestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: 1,
    };
    const remoteOp: SyncOperation = {
      ...baseOperation,
      changedFields: { notes: 'Updated notes' },
      clientTimestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: 2,
    };

    const result = fieldLevelMerge(localOp, remoteOp);
    expect(result.mergedFields).toEqual({
      title: 'New Title',
      notes: 'Updated notes',
    });
    expect(result.conflicts).toHaveLength(0);
  });

  it('should resolve same field conflict using serverSequence (higher wins)', () => {
    const localOp: SyncOperation = {
      ...baseOperation,
      changedFields: { title: 'Local Title' },
      clientTimestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: 5,
    };
    const remoteOp: SyncOperation = {
      ...baseOperation,
      changedFields: { title: 'Remote Title' },
      clientTimestamp: '2024-01-01T09:00:00.000Z',
      serverSequence: 10,
    };

    const result = fieldLevelMerge(localOp, remoteOp);
    expect(result.mergedFields.title).toBe('Remote Title');
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]).toEqual({
      field: 'title',
      localValue: 'Local Title',
      remoteValue: 'Remote Title',
      resolvedValue: 'Remote Title',
    });
  });

  it('should handle multiple fields where some conflict and some do not', () => {
    const localOp: SyncOperation = {
      ...baseOperation,
      changedFields: { title: 'Local Title', location: 'Paris' },
      clientTimestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: 3,
    };
    const remoteOp: SyncOperation = {
      ...baseOperation,
      changedFields: { title: 'Remote Title', notes: 'Remote Notes' },
      clientTimestamp: '2024-01-01T11:00:00.000Z',
      serverSequence: 7,
    };

    const result = fieldLevelMerge(localOp, remoteOp);
    expect(result.mergedFields).toEqual({
      title: 'Remote Title',
      location: 'Paris',
      notes: 'Remote Notes',
    });
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].field).toBe('title');
  });

  it('should not report conflict when both operations set same value for same field', () => {
    const localOp: SyncOperation = {
      ...baseOperation,
      changedFields: { title: 'Same Title' },
      clientTimestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: 3,
    };
    const remoteOp: SyncOperation = {
      ...baseOperation,
      changedFields: { title: 'Same Title' },
      clientTimestamp: '2024-01-01T11:00:00.000Z',
      serverSequence: 7,
    };

    const result = fieldLevelMerge(localOp, remoteOp);
    expect(result.mergedFields.title).toBe('Same Title');
    expect(result.conflicts).toHaveLength(0);
  });

  it('should handle empty changedFields from one operation', () => {
    const localOp: SyncOperation = {
      ...baseOperation,
      changedFields: { title: 'Updated Title', notes: 'New notes' },
      clientTimestamp: '2024-01-01T10:00:00.000Z',
      serverSequence: 3,
    };
    const remoteOp: SyncOperation = {
      ...baseOperation,
      changedFields: {},
      clientTimestamp: '2024-01-01T11:00:00.000Z',
      serverSequence: 7,
    };

    const result = fieldLevelMerge(localOp, remoteOp);
    expect(result.mergedFields).toEqual({
      title: 'Updated Title',
      notes: 'New notes',
    });
    expect(result.conflicts).toHaveLength(0);
  });
});
