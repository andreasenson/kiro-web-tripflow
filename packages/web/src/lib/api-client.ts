import type {
  Trip,
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
  SyncBatch,
  SyncOperation,
} from '@tripflow/shared';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => 'Request failed');
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Trip endpoints
export const tripsApi = {
  create(data: CreateTrip): Promise<Trip> {
    return request<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  list(): Promise<Trip[]> {
    return request<Trip[]>('/trips');
  },

  get(id: string): Promise<Trip> {
    return request<Trip>(`/trips/${id}`);
  },

  update(id: string, data: Partial<UpdateTrip>): Promise<Trip> {
    return request<Trip>(`/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete(id: string): Promise<void> {
    return request<void>(`/trips/${id}`, {
      method: 'DELETE',
    });
  },

  updateMode(id: string, status: 'planning' | 'travelling' | 'completed'): Promise<Trip> {
    return request<Trip>(`/trips/${id}/mode`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Itinerary endpoints
export const itineraryApi = {
  create(tripId: string, data: CreateItineraryEntry): Promise<ItineraryEntry> {
    return request<ItineraryEntry>(`/trips/${tripId}/itinerary`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  list(tripId: string): Promise<ItineraryEntry[]> {
    return request<ItineraryEntry[]>(`/trips/${tripId}/itinerary`);
  },

  get(tripId: string, id: string): Promise<ItineraryEntry> {
    return request<ItineraryEntry>(`/trips/${tripId}/itinerary/${id}`);
  },

  update(tripId: string, id: string, data: Partial<UpdateItineraryEntry>): Promise<ItineraryEntry> {
    return request<ItineraryEntry>(`/trips/${tripId}/itinerary/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete(tripId: string, id: string): Promise<void> {
    return request<void>(`/trips/${tripId}/itinerary/${id}`, {
      method: 'DELETE',
    });
  },

  reorder(tripId: string, items: { id: string; sortOrder: number }[]): Promise<void> {
    return request<void>(`/trips/${tripId}/itinerary/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });
  },
};

// Budget endpoints
export const budgetApi = {
  createCategory(tripId: string, data: CreateBudgetCategory): Promise<BudgetCategory> {
    return request<BudgetCategory>(`/trips/${tripId}/budget/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  listCategories(tripId: string): Promise<BudgetCategory[]> {
    return request<BudgetCategory[]>(`/trips/${tripId}/budget/categories`);
  },

  updateCategory(tripId: string, id: string, data: Partial<BudgetCategory>): Promise<BudgetCategory> {
    return request<BudgetCategory>(`/trips/${tripId}/budget/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteCategory(tripId: string, id: string): Promise<void> {
    return request<void>(`/trips/${tripId}/budget/categories/${id}`, {
      method: 'DELETE',
    });
  },

  createExpense(tripId: string, data: CreateExpense): Promise<Expense> {
    return request<Expense>(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  listExpenses(tripId: string): Promise<Expense[]> {
    return request<Expense[]>(`/trips/${tripId}/expenses`);
  },

  updateExpense(tripId: string, id: string, data: Partial<UpdateExpense>): Promise<Expense> {
    return request<Expense>(`/trips/${tripId}/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteExpense(tripId: string, id: string): Promise<void> {
    return request<void>(`/trips/${tripId}/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  getSummary(tripId: string): Promise<{ totalBudget: number; totalSpent: number; categories: Array<{ id: string; name: string; allocated: number; spent: number }> }> {
    return request(`/trips/${tripId}/budget/summary`);
  },
};

// Sync endpoints
export const syncApi = {
  push(batch: SyncBatch): Promise<{ conflicts: Array<unknown>; serverSequence: number }> {
    return request('/sync/push', {
      method: 'POST',
      body: JSON.stringify(batch),
    });
  },

  pull(since: number): Promise<{ operations: SyncOperation[]; lastSequence: number }> {
    return request(`/sync/pull?since=${since}`);
  },
};

// AI endpoints
export const aiApi = {
  generateItinerary(
    tripId: string,
    preferences: {
      interests: string[];
      pace: 'relaxed' | 'moderate' | 'packed';
      budgetLevel: 'budget' | 'moderate' | 'luxury';
      notes?: string;
    },
  ): Promise<{ entries: ItineraryEntry[] }> {
    return request(`/trips/${tripId}/ai/generate-itinerary`, {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  },

  regenerateItem(tripId: string, itemId: string): Promise<{ entry: ItineraryEntry }> {
    return request(`/trips/${tripId}/ai/regenerate-item/${itemId}`, {
      method: 'POST',
    });
  },
};
