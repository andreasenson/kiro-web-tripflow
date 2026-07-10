import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SyncOperationEntity } from './entities/sync-operation.entity';
import { ConflictLogEntity } from './entities/conflict-log.entity';
import { fieldLevelMerge } from '@tripflow/shared';
import { SyncOperation } from '@tripflow/shared';

export interface SyncBatchInput {
  operations: Array<{
    id: string;
    entityType: string;
    entityId: string;
    operationType: string;
    changedFields: Record<string, unknown>;
    clientTimestamp: string;
    serverSequence: number | null;
  }>;
  clientId: string;
  batchTimestamp: string;
}

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SyncOperationEntity)
    private readonly syncOpRepository: Repository<SyncOperationEntity>,
    @InjectRepository(ConflictLogEntity)
    private readonly conflictLogRepository: Repository<ConflictLogEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private async getNextSequenceInTransaction(
    syncOpRepo: Repository<SyncOperationEntity>,
  ): Promise<number> {
    // Within a serialized transaction, read the current max and increment.
    // SQLite serializes all write transactions, so this is safe from race conditions.
    const result = await syncOpRepo
      .createQueryBuilder('op')
      .select('MAX(op.serverSequence)', 'maxSeq')
      .getRawOne();
    const maxSeq = result?.maxSeq ?? 0;
    return maxSeq + 1;
  }

  async pushBatch(batch: SyncBatchInput) {
    // Use a transaction to ensure sequence assignment is atomic.
    // SQLite serializes write transactions, preventing duplicate sequences.
    return this.dataSource.transaction(async (manager) => {
      const syncOpRepo = manager.getRepository(SyncOperationEntity);
      const conflictLogRepo = manager.getRepository(ConflictLogEntity);

      const processedOps: SyncOperationEntity[] = [];
      const conflicts: ConflictLogEntity[] = [];

      for (const op of batch.operations) {
        const serverSequence = await this.getNextSequenceInTransaction(syncOpRepo);

        // Check for conflicts: find existing operations on the same entity
        const existingOps = await syncOpRepo.find({
          where: {
            entityId: op.entityId,
            entityType: op.entityType,
            operationType: 'update',
          },
          order: { serverSequence: 'DESC' },
          take: 1,
        });

        let mergedFields = op.changedFields;

        if (existingOps.length > 0 && op.operationType === 'update') {
          const existingOp = existingOps[0];

          // Use the shared fieldLevelMerge utility
          const localSyncOp: SyncOperation = {
            id: existingOp.id,
            entityType: existingOp.entityType as SyncOperation['entityType'],
            entityId: existingOp.entityId,
            operationType: existingOp.operationType as SyncOperation['operationType'],
            changedFields: existingOp.changedFields,
            clientTimestamp: existingOp.clientTimestamp,
            serverSequence: existingOp.serverSequence,
          };

          const remoteSyncOp: SyncOperation = {
            id: op.id,
            entityType: op.entityType as SyncOperation['entityType'],
            entityId: op.entityId,
            operationType: op.operationType as SyncOperation['operationType'],
            changedFields: op.changedFields,
            clientTimestamp: op.clientTimestamp,
            serverSequence: serverSequence,
          };

          const mergeResult = fieldLevelMerge(localSyncOp, remoteSyncOp);
          mergedFields = mergeResult.mergedFields;

          // Log conflicts
          for (const conflict of mergeResult.conflicts) {
            const conflictLog = conflictLogRepo.create({
              id: uuidv4(),
              entityType: op.entityType,
              entityId: op.entityId,
              field: conflict.field,
              localValue: conflict.localValue,
              remoteValue: conflict.remoteValue,
              resolvedValue: conflict.resolvedValue,
              resolvedAt: new Date().toISOString(),
            });
            const savedConflict = await conflictLogRepo.save(conflictLog);
            conflicts.push(savedConflict);
          }
        }

        // Save the operation with the assigned server sequence
        const syncOp = syncOpRepo.create({
          id: op.id,
          entityType: op.entityType,
          entityId: op.entityId,
          operationType: op.operationType,
          changedFields: mergedFields,
          clientTimestamp: op.clientTimestamp,
          serverSequence,
          clientId: batch.clientId,
          batchTimestamp: batch.batchTimestamp,
        });

        const savedOp = await syncOpRepo.save(syncOp);
        processedOps.push(savedOp);
      }

      return {
        operations: processedOps,
        conflicts,
      };
    });
  }

  async pullChanges(since: number) {
    return this.syncOpRepository.find({
      where: {
        serverSequence: MoreThan(since),
      },
      order: { serverSequence: 'ASC' },
    });
  }
}
