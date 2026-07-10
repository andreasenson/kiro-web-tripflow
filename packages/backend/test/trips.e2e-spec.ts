import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Trips (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  let tripId: string;

  it('POST /trips - should create a trip', async () => {
    const res = await request(app.getHttpServer())
      .post('/trips')
      .send({
        title: 'Paris Getaway',
        destination: 'Paris, France',
        startDate: '2025-06-01',
        endDate: '2025-06-07',
        currency: 'EUR',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Paris Getaway');
    expect(res.body.destination).toBe('Paris, France');
    expect(res.body.status).toBe('planning');
    tripId = res.body.id;
  });

  it('GET /trips - should return all trips', async () => {
    const res = await request(app.getHttpServer())
      .get('/trips')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /trips/:id - should return a single trip', async () => {
    const res = await request(app.getHttpServer())
      .get(`/trips/${tripId}`)
      .expect(200);

    expect(res.body.id).toBe(tripId);
    expect(res.body.title).toBe('Paris Getaway');
  });

  it('GET /trips/:id - should return 404 for non-existent trip', async () => {
    await request(app.getHttpServer())
      .get('/trips/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('PATCH /trips/:id - should update a trip', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/trips/${tripId}`)
      .send({ title: 'Paris Adventure' })
      .expect(200);

    expect(res.body.title).toBe('Paris Adventure');
    expect(res.body.destination).toBe('Paris, France');
  });

  it('PATCH /trips/:id/mode - should switch mode to travelling', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/trips/${tripId}/mode`)
      .send({ status: 'travelling' })
      .expect(200);

    expect(res.body.status).toBe('travelling');
  });

  it('PATCH /trips/:id/mode - should switch mode to completed', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/trips/${tripId}/mode`)
      .send({ status: 'completed' })
      .expect(200);

    expect(res.body.status).toBe('completed');
  });

  it('DELETE /trips/:id - should delete a trip', async () => {
    await request(app.getHttpServer())
      .delete(`/trips/${tripId}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/trips/${tripId}`)
      .expect(404);
  });
});
