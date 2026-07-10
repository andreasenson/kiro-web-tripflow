export interface ItineraryPromptInput {
  destination: string;
  startDate: string;
  endDate: string;
  interests?: string[];
  pace?: 'relaxed' | 'moderate' | 'packed';
  budgetLevel?: 'budget' | 'moderate' | 'luxury';
  notes?: string;
}

export function buildItineraryPrompt(input: ItineraryPromptInput): string {
  const { destination, startDate, endDate, interests, pace, budgetLevel, notes } = input;

  const interestsStr = interests?.length ? interests.join(', ') : 'general sightseeing';
  const paceStr = pace || 'moderate';
  const budgetStr = budgetLevel || 'moderate';
  const notesStr = notes ? `\n- Additional Notes: ${notes}` : '';

  return `You are a travel planning assistant. Generate a detailed day-by-day itinerary for a trip.

Trip Details:
- Destination: ${destination}
- Start Date: ${startDate}
- End Date: ${endDate}
- Interests: ${interestsStr}
- Pace: ${paceStr} (relaxed = 2-3 activities/day, moderate = 3-4, packed = 5-6)
- Budget Level: ${budgetStr}${notesStr}

Generate the itinerary as a JSON array of entries. Each entry should have:
- dayNumber (integer, starting at 1)
- title (short descriptive name of the activity)
- startTime (HH:MM format or null)
- endTime (HH:MM format or null)
- location (name of place/venue)
- latitude (approximate latitude)
- longitude (approximate longitude)
- notes (brief tips or details, max 200 chars)

Return ONLY valid JSON array, no other text. Example format:
[
  {
    "dayNumber": 1,
    "title": "Visit the Eiffel Tower",
    "startTime": "09:00",
    "endTime": "11:00",
    "location": "Eiffel Tower, Paris",
    "latitude": 48.8584,
    "longitude": 2.2945,
    "notes": "Book tickets online in advance to skip the queue"
  }
]`;
}

export function buildRegenerateItemPrompt(
  destination: string,
  currentItem: { title: string; dayNumber: number; startTime?: string | null; endTime?: string | null },
  context?: string,
): string {
  return `You are a travel planning assistant. Suggest an alternative activity to replace the following item in an itinerary for ${destination}.

Current item:
- Day ${currentItem.dayNumber}: "${currentItem.title}" (${currentItem.startTime || 'flexible'} - ${currentItem.endTime || 'flexible'})
${context ? `Additional context: ${context}` : ''}

Provide ONE alternative activity as a JSON object with the same format:
{
  "dayNumber": ${currentItem.dayNumber},
  "title": "...",
  "startTime": "...",
  "endTime": "...",
  "location": "...",
  "latitude": ...,
  "longitude": ...,
  "notes": "..."
}

The suggestion should be different from "${currentItem.title}" but suitable for the same time slot and destination.
Return ONLY valid JSON, no other text.`;
}
