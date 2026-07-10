import { z } from 'zod';
import { TripSchema, TripStatusSchema, CreateTripSchema, UpdateTripSchema } from '../schemas/trip.schema';
import {
  ItineraryEntrySchema,
  CreateItineraryEntrySchema,
  UpdateItineraryEntrySchema,
} from '../schemas/itinerary.schema';
import {
  BudgetCategorySchema,
  CreateBudgetCategorySchema,
  ExpenseSchema,
  CreateExpenseSchema,
  UpdateExpenseSchema,
} from '../schemas/budget.schema';
import {
  SyncOperationSchema,
  SyncBatchSchema,
  ConflictLogSchema,
  OperationTypeSchema,
  EntityTypeSchema,
} from '../schemas/sync.schema';

// Trip types
export type Trip = z.infer<typeof TripSchema>;
export type TripStatus = z.infer<typeof TripStatusSchema>;
export type CreateTrip = z.infer<typeof CreateTripSchema>;
export type UpdateTrip = z.infer<typeof UpdateTripSchema>;

// Itinerary types
export type ItineraryEntry = z.infer<typeof ItineraryEntrySchema>;
export type CreateItineraryEntry = z.infer<typeof CreateItineraryEntrySchema>;
export type UpdateItineraryEntry = z.infer<typeof UpdateItineraryEntrySchema>;

// Budget types
export type BudgetCategory = z.infer<typeof BudgetCategorySchema>;
export type CreateBudgetCategory = z.infer<typeof CreateBudgetCategorySchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type CreateExpense = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpense = z.infer<typeof UpdateExpenseSchema>;

// Sync types
export type SyncOperation = z.infer<typeof SyncOperationSchema>;
export type SyncBatch = z.infer<typeof SyncBatchSchema>;
export type ConflictLog = z.infer<typeof ConflictLogSchema>;
export type OperationType = z.infer<typeof OperationTypeSchema>;
export type EntityType = z.infer<typeof EntityTypeSchema>;
