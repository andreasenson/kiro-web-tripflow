import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import {
  buildItineraryPrompt,
  buildRegenerateItemPrompt,
  ItineraryPromptInput,
} from './prompts/itinerary-generation.prompt';

export interface GenerateItineraryInput {
  destination: string;
  startDate: string;
  endDate: string;
  interests?: string[];
  pace?: 'relaxed' | 'moderate' | 'packed';
  budgetLevel?: 'budget' | 'moderate' | 'luxury';
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

  constructor() {
    // Default client that calls Anthropic API
    // In tests, this is replaced via setClient()
    this.client = {
      async generateCompletion(prompt: string): Promise<string> {
        // In production, this would call the Anthropic Claude API
        // For now, return empty array as a fallback
        return '[]';
      },
    };
  }

  setClient(client: AiClient) {
    this.client = client;
  }

  async generateItinerary(tripId: string, input: GenerateItineraryInput): Promise<ItineraryItem[]> {
    const promptInput: ItineraryPromptInput = {
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      interests: input.interests,
      pace: input.pace,
      budgetLevel: input.budgetLevel,
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

    return validationResult.data.map((item) => ({
      dayNumber: item.dayNumber,
      title: item.title,
      startTime: item.startTime || null,
      endTime: item.endTime || null,
      location: item.location || null,
      latitude: item.latitude || null,
      longitude: item.longitude || null,
      notes: item.notes || null,
    }));
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
