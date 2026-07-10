import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('trips')
export class TripEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  title!: string;

  @Column({ length: 500 })
  destination!: string;

  @Column()
  startDate!: string;

  @Column()
  endDate!: string;

  @Column({ length: 3 })
  currency!: string;

  @Column({ default: 'planning' })
  status!: 'planning' | 'travelling' | 'completed';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
