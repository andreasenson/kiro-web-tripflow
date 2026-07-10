import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('budget_categories')
export class BudgetCategoryEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  tripId!: string;

  @Column({ length: 100 })
  name!: string;

  @Column('float', { default: 0 })
  allocatedAmount!: number;
}
