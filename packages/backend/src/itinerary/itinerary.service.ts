import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ItineraryEntryEntity } from './entities/itinerary-entry.entity';
import { CreateItineraryEntryDto } from './dto/create-itinerary-entry.dto';
import { UpdateItineraryEntryDto } from './dto/update-itinerary-entry.dto';
import { ReorderDto } from './dto/reorder.dto';

@Injectable()
export class ItineraryService {
  constructor(
    @InjectRepository(ItineraryEntryEntity)
    private readonly itineraryRepository: Repository<ItineraryEntryEntity>,
  ) {}

  async create(tripId: string, dto: CreateItineraryEntryDto): Promise<ItineraryEntryEntity> {
    const entry = this.itineraryRepository.create({
      id: uuidv4(),
      tripId,
      dayNumber: dto.dayNumber,
      title: dto.title,
      startTime: dto.startTime ?? null,
      endTime: dto.endTime ?? null,
      location: dto.location ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      notes: dto.notes ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isAiGenerated: dto.isAiGenerated ?? false,
    });
    return this.itineraryRepository.save(entry);
  }

  async findAllByTrip(tripId: string): Promise<Record<number, ItineraryEntryEntity[]>> {
    const entries = await this.itineraryRepository.find({
      where: { tripId },
      order: { dayNumber: 'ASC', sortOrder: 'ASC' },
    });

    const grouped: Record<number, ItineraryEntryEntity[]> = {};
    for (const entry of entries) {
      if (!grouped[entry.dayNumber]) {
        grouped[entry.dayNumber] = [];
      }
      grouped[entry.dayNumber].push(entry);
    }
    return grouped;
  }

  async findOne(tripId: string, id: string): Promise<ItineraryEntryEntity> {
    const entry = await this.itineraryRepository.findOne({ where: { id, tripId } });
    if (!entry) {
      throw new NotFoundException(`Itinerary entry with id ${id} not found`);
    }
    return entry;
  }

  async update(tripId: string, id: string, dto: UpdateItineraryEntryDto): Promise<ItineraryEntryEntity> {
    const entry = await this.findOne(tripId, id);
    Object.assign(entry, dto);
    await this.itineraryRepository.save(entry);
    return this.findOne(tripId, id);
  }

  async remove(tripId: string, id: string): Promise<void> {
    const entry = await this.findOne(tripId, id);
    await this.itineraryRepository.remove(entry);
  }

  async reorder(tripId: string, dto: ReorderDto): Promise<ItineraryEntryEntity[]> {
    const results: ItineraryEntryEntity[] = [];
    for (const item of dto.items) {
      const entry = await this.findOne(tripId, item.id);
      entry.sortOrder = item.sortOrder;
      results.push(await this.itineraryRepository.save(entry));
    }
    return results;
  }
}
