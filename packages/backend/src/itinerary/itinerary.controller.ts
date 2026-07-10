import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ItineraryService } from './itinerary.service';
import { CreateItineraryEntryDto } from './dto/create-itinerary-entry.dto';
import { UpdateItineraryEntryDto } from './dto/update-itinerary-entry.dto';
import { ReorderDto } from './dto/reorder.dto';

@Controller('trips/:tripId/itinerary')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Param('tripId') tripId: string, @Body() dto: CreateItineraryEntryDto) {
    return this.itineraryService.create(tripId, dto);
  }

  @Get()
  findAll(@Param('tripId') tripId: string) {
    return this.itineraryService.findAllByTrip(tripId);
  }

  @Get(':id')
  findOne(@Param('tripId') tripId: string, @Param('id') id: string) {
    return this.itineraryService.findOne(tripId, id);
  }

  @Patch('reorder')
  reorder(@Param('tripId') tripId: string, @Body() dto: ReorderDto) {
    return this.itineraryService.reorder(tripId, dto);
  }

  @Patch(':id')
  update(
    @Param('tripId') tripId: string,
    @Param('id') id: string,
    @Body() dto: UpdateItineraryEntryDto,
  ) {
    return this.itineraryService.update(tripId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('tripId') tripId: string, @Param('id') id: string) {
    return this.itineraryService.remove(tripId, id);
  }
}
