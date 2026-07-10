import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import {
  buildItineraryPrompt,
  buildRegenerateItemPrompt,
  ItineraryPromptInput,
} from './prompts/itinerary-generation.prompt';
import { TripsService } from '../trips/trips.service';

export interface GenerateItineraryInput {
  interests?: string[];
  pace?: 'relaxed' | 'moderate' | 'packed';
  budgetLevel?: 'budget' | 'moderate' | 'luxury';
  notes?: string;
}

export interface ItineraryItem {
  dayNumber: number;
  title: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
}

export interface GenerateItineraryResponse {
  entries: Array<{
    id: string;
    tripId: string;
    dayNumber: number;
    title: string;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
    sortOrder: number;
    isAiGenerated: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface AiClient {
  generateCompletion(prompt: string): Promise<string>;
}

// Zod schema for validating AI-generated itinerary items
const AiItineraryItemSchema = z.object({
  dayNumber: z.number().int().positive(),
  title: z.string().min(1),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  notes: z.string().nullable().optional(),
});

const AiItineraryResponseSchema = z.array(AiItineraryItemSchema);

@Injectable()
export class AiService {
  private client: AiClient;

  constructor(private readonly tripsService: TripsService) {
    // Default client that calls Anthropic API
    // In tests, this is replaced via setClient()
    this.client = {
      async generateCompletion(prompt: string): Promise<string> {
        // In production, this would call the Anthropic Claude API
        // For now, return realistic mock data as a fallback
        return JSON.stringify([
          {
            dayNumber: 1,
            title: 'Morning City Exploration',
            startTime: '09:00',
            endTime: '12:00',
            location: 'City Center',
            latitude: 40.4168,
            longitude: -3.7038,
            notes: 'Start with the main landmarks and popular attractions',
          },
          {
            dayNumber: 1,
            title: 'Local Cuisine Experience',
            startTime: '13:00',
            endTime: '15:00',
            location: 'Old Town District',
            latitude: 40.4155,
            longitude: -3.7074,
            notes: 'Try the local specialties at a well-reviewed restaurant',
          },
          {
            dayNumber: 2,
            title: 'Cultural District Visit',
            startTime: '10:00',
            endTime: '13:00',
            location: 'Museum Quarter',
            latitude: 40.4138,
            longitude: -3.6921,
            notes: 'Explore museums and galleries in the area',
          },
        ]);
      },
    };
  }

  setClient(client: AiClient) {
    this.client = client;
  }

  async generateItinerary(tripId: string, input: GenerateItineraryInput): Promise<GenerateItineraryResponse> {
    const trip = await this.tripsService.findOne(tripId);

    const promptInput: ItineraryPromptInput = {
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      interests: input.interests,
      pace: input.pace,
      budgetLevel: input.budgetLevel,
      notes: input.notes,
    };

    const prompt = buildItineraryPrompt(promptInput);
    const response = await this.client.generateCompletion(prompt);

    let parsed: unknown;
    try {
      parsed = JSON.parse(response);
    } catch {
      throw new Error('Failed to parse AI response as valid JSON');
    }

    const validationResult = AiItineraryResponseSchema.safeParse(parsed);
    if (!validationResult.success) {
      const issues = validationResult.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new Error(`AI response failed schema validation: ${issues}`);
    }

    const now = new Date().toISOString();
    const entries = validationResult.data.map((item, index) => ({
      id: uuidv4(),
      tripId,
      dayNumber: item.dayNumber,
      title: item.title,
      startTime: item.startTime || null,
      endTime: item.endTime || null,
      location: item.location || null,
      latitude: item.latitude || null,
      longitude: item.longitude || null,
      notes: item.notes || null,
      sortOrder: index,
      isAiGenerated: true,
      createdAt: now,
      updatedAt: now,
    }));

    return { entries };
  }

  async regenerateItem(
    tripId: string,
    currentItem: { title: string; dayNumber: number; startTime?: string | null; endTime?: string | null },
    destination: string,
  ): Promise<ItineraryItem> {
    const prompt = buildRegenerateItemPrompt(destination, currentItem);
    const response = await this.client.generateCompletion(prompt);

    let parsed: unknown;
    try {
      parsed = JSON.parse(response);
    } catch {
      throw new Error('Failed to parse AI response as valid JSON');
    }

    const validationResult = AiItineraryItemSchema.safeParse(parsed);
    if (!validationResult.success) {
      const issues = validationResult.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new Error(`AI response failed schema validation: ${issues}`);
    }

    const item = validationResult.data;
    return {
      dayNumber: item.dayNumber,
      title: item.title,
      startTime: item.startTime || null,
      endTime: item.endTime || null,
      location: item.location || null,
      latitude: item.latitude || null,
      longitude: item.longitude || null,
      notes: item.notes || null,
    };
  }
}
