import { SyncOperation } from '../types';

/**
 * Represents a versioned field value with metadata for conflict resolution.
 */
export interface FieldVersion {
  value: unknown;
  timestamp: string;
  serverSequence: number | null;
}

/**
 * Represents the result of a field-level merge operation.
 */
export interface MergeResult {
  mergedFields: Record<string, unknown>;
  conflicts: Array<{
    field: string;
    localValue: unknown;
    remoteValue: unknown;
    resolvedValue: unknown;
  }>;
}

/**
 * Resolves a conflict between a local and remote value for a single field.
 * Uses server sequence number as the primary resolution strategy (higher wins).
 * If server sequences are equal or both null, uses timestamp comparison.
 */
export function resolveConflict(
  localField: FieldVersion,
  remoteField: FieldVersion,
): { resolvedValue: unknown; winner: 'local' | 'remote' } {
  // If one has a server sequence and the other doesn't, server-assigned wins
  if (localField.serverSequence !== null && remoteField.serverSequence === null) {
    return { resolvedValue: localField.value, winner: 'local' };
  }
  if (remoteField.serverSequence !== null && localField.serverSequence === null) {
    return { resolvedValue: remoteField.value, winner: 'remote' };
  }

  // Both have server sequences - higher wins
  if (localField.serverSequence !== null && remoteField.serverSequence !== null) {
    if (localField.serverSequence >= remoteField.serverSequence) {
      return { resolvedValue: localField.value, winner: 'local' };
    }
    return { resolvedValue: remoteField.value, winner: 'remote' };
  }

  // Both null server sequences - use timestamp (later wins)
  if (localField.timestamp >= remoteField.timestamp) {
    return { resolvedValue: localField.value, winner: 'local' };
  }
  return { resolvedValue: remoteField.value, winner: 'remote' };
}

/**
 * Performs a field-level merge between a local and remote operation on the same entity.
 * Different fields from both operations are merged together.
 * Same fields are resolved using the resolveConflict function (LWW by server sequence).
 */
export function fieldLevelMerge(
  localOp: SyncOperation,
  remoteOp: SyncOperation,
): MergeResult {
  const mergedFields: Record<string, unknown> = {};
  const conflicts: MergeResult['conflicts'] = [];

  const localFields = localOp.changedFields;
  const remoteFields = remoteOp.changedFields;

  // Collect all field names from both operations
  const allFields = new Set([...Object.keys(localFields), ...Object.keys(remoteFields)]);

  for (const field of allFields) {
    const hasLocal = field in localFields;
    const hasRemote = field in remoteFields;

    if (hasLocal && !hasRemote) {
      // Only local changed this field - take local value
      mergedFields[field] = localFields[field];
    } else if (!hasLocal && hasRemote) {
      // Only remote changed this field - take remote value
      mergedFields[field] = remoteFields[field];
    } else {
      // Both changed the same field - resolve conflict
      const localFieldVersion: FieldVersion = {
        value: localFields[field],
        timestamp: localOp.clientTimestamp,
        serverSequence: localOp.serverSequence,
      };
      const remoteFieldVersion: FieldVersion = {
        value: remoteFields[field],
        timestamp: remoteOp.clientTimestamp,
        serverSequence: remoteOp.serverSequence,
      };

      const { resolvedValue } = resolveConflict(localFieldVersion, remoteFieldVersion);
      mergedFields[field] = resolvedValue;

      // Log conflict if values actually differ
      if (localFields[field] !== remoteFields[field]) {
        conflicts.push({
          field,
          localValue: localFields[field],
          remoteValue: remoteFields[field],
          resolvedValue,
        });
      }
    }
  }

  return { mergedFields, conflicts };
}
