import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Itinerary (e2e)', () => {
  let app: INestApplication;
  let tripId: string;

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

    // Create a trip first
    const tripRes = await request(app.getHttpServer())
      .post('/trips')
      .send({
        title: 'Test Trip',
        destination: 'Tokyo, Japan',
        startDate: '2025-07-01',
        endDate: '2025-07-05',
        currency: 'JPY',
      });
    tripId = tripRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  let entryId1: string;
  let entryId2: string;

  it('POST /trips/:tripId/itinerary - should create an itinerary entry', async () => {
    const res = await request(app.getHttpServer())
      .post(`/trips/${tripId}/itinerary`)
      .send({
        dayNumber: 1,
        title: 'Visit Senso-ji Temple',
        startTime: '09:00',
        endTime: '11:00',
        location: 'Asakusa, Tokyo',
        latitude: 35.7148,
        longitude: 139.7967,
        notes: 'Free entry, arrive early',
        sortOrder: 0,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Visit Senso-ji Temple');
    expect(res.body.tripId).toBe(tripId);
    expect(res.body.dayNumber).toBe(1);
    entryId1 = res.body.id;
  });

  it('POST /trips/:tripId/itinerary - should create second entry', async () => {
    const res = await request(app.getHttpServer())
      .post(`/trips/${tripId}/itinerary`)
      .send({
        dayNumber: 1,
        title: 'Lunch at Ramen Street',
        startTime: '12:00',
        endTime: '13:00',
        location: 'Tokyo Station',
        sortOrder: 1,
      })
      .expect(201);

    entryId2 = res.body.id;
  });

  it('GET /trips/:tripId/itinerary - should return entries grouped by day', async () => {
    const res = await request(app.getHttpServer())
      .get(`/trips/${tripId}/itinerary`)
      .expect(200);

    expect(res.body).toHaveProperty('1');
    expect(Array.isArray(res.body['1'])).toBe(true);
    expect(res.body['1'].length).toBe(2);
  });

  it('GET /trips/:tripId/itinerary/:id - should return a single entry', async () => {
    const res = await request(app.getHttpServer())
      .get(`/trips/${tripId}/itinerary/${entryId1}`)
      .expect(200);

    expect(res.body.id).toBe(entryId1);
    expect(res.body.title).toBe('Visit Senso-ji Temple');
  });

  it('PATCH /trips/:tripId/itinerary/reorder - should reorder entries', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/trips/${tripId}/itinerary/reorder`)
      .send({
        items: [
          { id: entryId1, sortOrder: 2 },
          { id: entryId2, sortOrder: 0 },
        ],
      })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const reordered1 = res.body.find((e: any) => e.id === entryId1);
    const reordered2 = res.body.find((e: any) => e.id === entryId2);
    expect(reordered1.sortOrder).toBe(2);
    expect(reordered2.sortOrder).toBe(0);
  });

  it('PATCH /trips/:tripId/itinerary/:id - should update an entry', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/trips/${tripId}/itinerary/${entryId1}`)
      .send({ title: 'Visit Meiji Shrine' })
      .expect(200);

    expect(res.body.title).toBe('Visit Meiji Shrine');
  });

  it('DELETE /trips/:tripId/itinerary/:id - should delete an entry', async () => {
    await request(app.getHttpServer())
      .delete(`/trips/${tripId}/itinerary/${entryId1}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/trips/${tripId}/itinerary/${entryId1}`)
      .expect(404);
  });
});
