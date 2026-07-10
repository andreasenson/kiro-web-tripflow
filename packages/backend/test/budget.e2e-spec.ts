import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Budget (e2e)', () => {
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
        title: 'Budget Test Trip',
        destination: 'Rome, Italy',
        startDate: '2025-09-01',
        endDate: '2025-09-07',
        currency: 'EUR',
      });
    tripId = tripRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  let categoryId: string;
  let expenseId: string;

  it('POST /trips/:tripId/budget/categories - should create a budget category', async () => {
    const res = await request(app.getHttpServer())
      .post(`/trips/${tripId}/budget/categories`)
      .send({
        name: 'Food',
        allocatedAmount: 500,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Food');
    expect(res.body.allocatedAmount).toBe(500);
    expect(res.body.tripId).toBe(tripId);
    categoryId = res.body.id;
  });

  it('GET /trips/:tripId/budget/categories - should return all categories', async () => {
    // Create another category
    await request(app.getHttpServer())
      .post(`/trips/${tripId}/budget/categories`)
      .send({ name: 'Transport', allocatedAmount: 200 });

    const res = await request(app.getHttpServer())
      .get(`/trips/${tripId}/budget/categories`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('PATCH /trips/:tripId/budget/categories/:id - should update a category', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/trips/${tripId}/budget/categories/${categoryId}`)
      .send({ allocatedAmount: 600 })
      .expect(200);

    expect(res.body.allocatedAmount).toBe(600);
    expect(res.body.name).toBe('Food');
  });

  it('POST /trips/:tripId/expenses - should create an expense', async () => {
    const res = await request(app.getHttpServer())
      .post(`/trips/${tripId}/expenses`)
      .send({
        categoryId,
        amount: 45.50,
        currency: 'EUR',
        note: 'Dinner at trattoria',
        date: '2025-09-02',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.amount).toBe(45.50);
    expect(res.body.categoryId).toBe(categoryId);
    expect(res.body.tripId).toBe(tripId);
    expenseId = res.body.id;
  });

  it('GET /trips/:tripId/expenses - should return all expenses', async () => {
    // Create another expense
    await request(app.getHttpServer())
      .post(`/trips/${tripId}/expenses`)
      .send({
        categoryId,
        amount: 12.00,
        currency: 'EUR',
        note: 'Coffee',
        date: '2025-09-02',
      });

    const res = await request(app.getHttpServer())
      .get(`/trips/${tripId}/expenses`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('PATCH /trips/:tripId/expenses/:id - should update an expense', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/trips/${tripId}/expenses/${expenseId}`)
      .send({ amount: 50.00 })
      .expect(200);

    expect(res.body.amount).toBe(50.00);
  });

  it('GET /trips/:tripId/budget/summary - should return budget summary', async () => {
    const res = await request(app.getHttpServer())
      .get(`/trips/${tripId}/budget/summary`)
      .expect(200);

    expect(res.body).toHaveProperty('totalAllocated');
    expect(res.body).toHaveProperty('totalSpent');
    expect(res.body).toHaveProperty('totalRemaining');
    expect(res.body).toHaveProperty('categories');
    expect(res.body.totalAllocated).toBe(800); // 600 + 200
    expect(res.body.totalSpent).toBe(62); // 50 + 12
    expect(res.body.totalRemaining).toBe(738);

    // Check per-category breakdown
    const foodCategory = res.body.categories.find((c: any) => c.name === 'Food');
    expect(foodCategory).toBeDefined();
    expect(foodCategory.allocated).toBe(600);
    expect(foodCategory.spent).toBe(62); // 50 + 12
    expect(foodCategory.remaining).toBe(538);
  });

  it('DELETE /trips/:tripId/expenses/:id - should delete an expense', async () => {
    await request(app.getHttpServer())
      .delete(`/trips/${tripId}/expenses/${expenseId}`)
      .expect(204);
  });

  it('DELETE /trips/:tripId/budget/categories/:id - should delete a category', async () => {
    await request(app.getHttpServer())
      .delete(`/trips/${tripId}/budget/categories/${categoryId}`)
      .expect(204);
  });
});
