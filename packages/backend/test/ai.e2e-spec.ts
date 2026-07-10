import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AiService } from '../src/ai/ai.service';

describe('AI (e2e)', () => {
  let app: INestApplication;
  let tripId: string;
  let aiService: AiService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    aiService = app.get(AiService);

    // Create a trip
    const tripRes = await request(app.getHttpServer())
      .post('/trips')
      .send({
        title: 'AI Test Trip',
        destination: 'Barcelona, Spain',
        startDate: '2025-08-01',
        endDate: '2025-08-04',
        currency: 'EUR',
      });
    tripId = tripRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /trips/:tripId/ai/generate-itinerary - should return structured entries', async () => {
    // Mock the AI client
    const mockResponse = JSON.stringify([
      {
        dayNumber: 1,
        title: 'Visit Sagrada Familia',
        startTime: '09:00',
        endTime: '11:30',
        location: 'Sagrada Familia, Barcelona',
        latitude: 41.4036,
        longitude: 2.1744,
        notes: 'Book tickets in advance',
      },
      {
        dayNumber: 1,
        title: 'Walk Las Ramblas',
        startTime: '14:00',
        endTime: '16:00',
        location: 'Las Ramblas, Barcelona',
        latitude: 41.3809,
        longitude: 2.1734,
        notes: 'Great for people watching',
      },
      {
        dayNumber: 2,
        title: 'Park Guell',
        startTime: '10:00',
        endTime: '12:00',
        location: 'Park Guell, Barcelona',
        latitude: 41.4145,
        longitude: 2.1527,
        notes: 'Wear comfortable shoes',
      },
    ]);

    aiService.setClient({
      async generateCompletion() {
        return mockResponse;
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/trips/${tripId}/ai/generate-itinerary`)
      .send({
        interests: ['architecture', 'food'],
        pace: 'moderate',
        budgetLevel: 'moderate',
      })
      .expect(200);

    expect(res.body).toHaveProperty('entries');
    expect(Array.isArray(res.body.entries)).toBe(true);
    expect(res.body.entries.length).toBe(3);
    expect(res.body.entries[0]).toHaveProperty('id');
    expect(res.body.entries[0]).toHaveProperty('tripId', tripId);
    expect(res.body.entries[0]).toHaveProperty('dayNumber', 1);
    expect(res.body.entries[0]).toHaveProperty('title', 'Visit Sagrada Familia');
    expect(res.body.entries[0]).toHaveProperty('startTime', '09:00');
    expect(res.body.entries[0]).toHaveProperty('location', 'Sagrada Familia, Barcelona');
    expect(res.body.entries[0]).toHaveProperty('latitude', 41.4036);
    expect(res.body.entries[0]).toHaveProperty('longitude', 2.1744);
    expect(res.body.entries[0]).toHaveProperty('notes');
    expect(res.body.entries[0]).toHaveProperty('sortOrder', 0);
    expect(res.body.entries[0]).toHaveProperty('isAiGenerated', true);
    expect(res.body.entries[1]).toHaveProperty('sortOrder', 1);
    expect(res.body.entries[2]).toHaveProperty('sortOrder', 2);
  });

  it('POST /trips/:tripId/ai/regenerate-item/:itemId - should return a different suggestion', async () => {
    aiService.setClient({
      async generateCompletion() {
        return JSON.stringify({
          dayNumber: 1,
          title: 'Visit Casa Batllo',
          startTime: '09:00',
          endTime: '11:00',
          location: 'Casa Batllo, Barcelona',
          latitude: 41.3916,
          longitude: 2.1649,
          notes: 'Beautiful Gaudi building',
        });
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/trips/${tripId}/ai/regenerate-item/some-item-id`)
      .send({
        title: 'Visit Sagrada Familia',
        dayNumber: 1,
        startTime: '09:00',
        endTime: '11:30',
        destination: 'Barcelona, Spain',
      })
      .expect(200);

    expect(res.body).toHaveProperty('title', 'Visit Casa Batllo');
    expect(res.body.title).not.toBe('Visit Sagrada Familia');
    expect(res.body).toHaveProperty('dayNumber', 1);
    expect(res.body).toHaveProperty('location');
    expect(res.body).toHaveProperty('latitude');
    expect(res.body).toHaveProperty('longitude');
  });

  it('POST /trips/:tripId/ai/generate-itinerary - should handle API failure gracefully', async () => {
    aiService.setClient({
      async generateCompletion() {
        throw new Error('Anthropic API rate limit exceeded');
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/trips/${tripId}/ai/generate-itinerary`)
      .send({
        interests: ['architecture'],
        pace: 'moderate',
        budgetLevel: 'moderate',
      })
      .expect(500);

    expect(res.body).toHaveProperty('message');
  });
});
