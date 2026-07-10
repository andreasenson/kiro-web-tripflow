import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripEntity } from './trips/entities/trip.entity';
import { ItineraryEntryEntity } from './itinerary/entities/itinerary-entry.entity';
import { BudgetCategoryEntity } from './budget/entities/budget-category.entity';
import { ExpenseEntity } from './budget/entities/expense.entity';
import { SyncOperationEntity } from './sync/entities/sync-operation.entity';
import { ConflictLogEntity } from './sync/entities/conflict-log.entity';
import { TripsModule } from './trips/trips.module';
import { ItineraryModule } from './itinerary/itinerary.module';
import { BudgetModule } from './budget/budget.module';
import { SyncModule } from './sync/sync.module';
import { AiModule } from './ai/ai.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Database = require('better-sqlite3');

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.NODE_ENV === 'test' ? ':memory:' : 'tripflow.db',
      driver: Database,
      entities: [
        TripEntity,
        ItineraryEntryEntity,
        BudgetCategoryEntity,
        ExpenseEntity,
        SyncOperationEntity,
        ConflictLogEntity,
      ],
      synchronize: true,
    }),
    TripsModule,
    ItineraryModule,
    BudgetModule,
    SyncModule,
    AiModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    },
  ],
})
export class AppModule {}
