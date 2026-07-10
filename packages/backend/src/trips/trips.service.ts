import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TripEntity } from './entities/trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(TripEntity)
    private readonly tripRepository: Repository<TripEntity>,
  ) {}

  async create(dto: CreateTripDto): Promise<TripEntity> {
    const trip = this.tripRepository.create({
      id: uuidv4(),
      title: dto.title,
      destination: dto.destination,
      startDate: dto.startDate,
      endDate: dto.endDate,
      currency: dto.currency,
      status: dto.status || 'planning',
    });
    return this.tripRepository.save(trip);
  }

  async findAll(): Promise<TripEntity[]> {
    return this.tripRepository.find();
  }

  async findOne(id: string): Promise<TripEntity> {
    const trip = await this.tripRepository.findOne({ where: { id } });
    if (!trip) {
      throw new NotFoundException(`Trip with id ${id} not found`);
    }
    return trip;
  }

  async update(id: string, dto: UpdateTripDto): Promise<TripEntity> {
    const trip = await this.findOne(id);
    Object.assign(trip, dto);
    await this.tripRepository.save(trip);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const trip = await this.findOne(id);
    await this.tripRepository.remove(trip);
  }

  async switchMode(id: string, status: 'planning' | 'travelling' | 'completed'): Promise<TripEntity> {
    const trip = await this.findOne(id);
    trip.status = status;
    return this.tripRepository.save(trip);
  }
}
