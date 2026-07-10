import { z } from 'zod';

export const OperationTypeSchema = z.enum(['create', 'update', 'delete']);

export const EntityTypeSchema = z.enum(['trip', 'itineraryEntry', 'budgetCategory', 'expense']);

export const SyncOperationSchema = z.object({
  id: z.string().uuid(),
  entityType: EntityTypeSchema,
  entityId: z.string().uuid(),
  operationType: OperationTypeSchema,
  changedFields: z.record(z.string(), z.unknown()),
  clientTimestamp: z.string().datetime(),
  serverSequence: z.number().int().nonnegative().nullable(),
});

export const SyncBatchSchema = z.object({
  operations: z.array(SyncOperationSchema),
  clientId: z.string().uuid(),
  batchTimestamp: z.string().datetime(),
});

export const ConflictLogSchema = z.object({
  id: z.string().uuid(),
  entityType: EntityTypeSchema,
  entityId: z.string().uuid(),
  field: z.string(),
  localValue: z.unknown(),
  remoteValue: z.unknown(),
  resolvedValue: z.unknown(),
  resolvedAt: z.string().datetime(),
});
