// Schemas
export {
  TripSchema,
  TripStatusSchema,
  CreateTripSchema,
  UpdateTripSchema,
} from './schemas/trip.schema';
export {
  ItineraryEntrySchema,
  CreateItineraryEntrySchema,
  UpdateItineraryEntrySchema,
} from './schemas/itinerary.schema';
export {
  BudgetCategorySchema,
  CreateBudgetCategorySchema,
  ExpenseSchema,
  CreateExpenseSchema,
  UpdateExpenseSchema,
} from './schemas/budget.schema';
export {
  SyncOperationSchema,
  SyncBatchSchema,
  ConflictLogSchema,
  OperationTypeSchema,
  EntityTypeSchema,
} from './schemas/sync.schema';

// Types
export type {
  Trip,
  TripStatus,
  CreateTrip,
  UpdateTrip,
  ItineraryEntry,
  CreateItineraryEntry,
  UpdateItineraryEntry,
  BudgetCategory,
  CreateBudgetCategory,
  Expense,
  CreateExpense,
  UpdateExpense,
  SyncOperation,
  SyncBatch,
  ConflictLog,
  OperationType,
  EntityType,
} from './types';

// Utilities
export { fieldLevelMerge, resolveConflict } from './utils/sync.utils';
export type { FieldVersion, MergeResult } from './utils/sync.utils';
