import { Controller, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService, GenerateItineraryInput, GenerateItineraryResponse } from './ai.service';

@Controller('trips/:tripId/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-itinerary')
  @HttpCode(HttpStatus.OK)
  generateItinerary(
    @Param('tripId') tripId: string,
    @Body() input: GenerateItineraryInput,
  ): Promise<GenerateItineraryResponse> {
    return this.aiService.generateItinerary(tripId, input);
  }

  @Post('regenerate-item/:itemId')
  @HttpCode(HttpStatus.OK)
  regenerateItem(
    @Param('tripId') tripId: string,
    @Param('itemId') itemId: string,
    @Body() body: { title: string; dayNumber: number; startTime?: string | null; endTime?: string | null; destination: string },
  ) {
    return this.aiService.regenerateItem(
      tripId,
      { title: body.title, dayNumber: body.dayNumber, startTime: body.startTime, endTime: body.endTime },
      body.destination,
    );
  }
}
