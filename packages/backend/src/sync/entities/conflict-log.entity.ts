import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('conflict_logs')
export class ConflictLogEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  entityType!: string;

  @Column({ type: 'uuid' })
  entityId!: string;

  @Column({ type: 'varchar' })
  field!: string;

  @Column({ type: 'simple-json', nullable: true })
  localValue!: unknown;

  @Column({ type: 'simple-json', nullable: true })
  remoteValue!: unknown;

  @Column({ type: 'simple-json', nullable: true })
  resolvedValue!: unknown;

  @Column({ type: 'varchar' })
  resolvedAt!: string;
}
