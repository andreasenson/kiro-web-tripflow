import { z } from 'zod';

export const BudgetCategorySchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  name: z.string().min(1).max(100),
  allocatedAmount: z.number().nonnegative(),
});

export const CreateBudgetCategorySchema = BudgetCategorySchema.omit({ id: true });

export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  note: z.string().max(500).nullable(),
  date: z.string().date(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateExpenseSchema = ExpenseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateExpenseSchema = ExpenseSchema.partial().required({ id: true });
