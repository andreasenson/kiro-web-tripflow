import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('sync_operations')
export class SyncOperationEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  entityType!: string;

  @Column({ type: 'uuid' })
  entityId!: string;

  @Column({ type: 'varchar' })
  operationType!: string;

  @Column({ type: 'simple-json' })
  changedFields!: Record<string, unknown>;

  @Column({ type: 'varchar' })
  clientTimestamp!: string;

  @Column({ type: 'int', nullable: true })
  serverSequence!: number | null;

  @Column({ type: 'uuid' })
  clientId!: string;

  @Column({ type: 'varchar', nullable: true })
  batchTimestamp!: string;
}
