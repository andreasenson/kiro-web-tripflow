import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('itinerary_entries')
export class ItineraryEntryEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  tripId!: string;

  @Column('int')
  dayNumber!: number;

  @Column({ type: 'varchar', length: 300 })
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  startTime!: string | null;

  @Column({ type: 'varchar', nullable: true })
  endTime!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location!: string | null;

  @Column({ type: 'float', nullable: true })
  latitude!: number | null;

  @Column({ type: 'float', nullable: true })
  longitude!: number | null;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  notes!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: false })
  isAiGenerated!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
