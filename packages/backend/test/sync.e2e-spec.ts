import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../src/app.module';

describe('Sync (e2e)', () => {
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

  const clientId = uuidv4();
  const entityId = uuidv4();

  it('POST /sync/push - should assign server sequence numbers', async () => {
    const batch = {
      operations: [
        {
          id: uuidv4(),
          entityType: 'trip',
          entityId,
          operationType: 'create',
          changedFields: { title: 'New Trip', destination: 'Berlin' },
          clientTimestamp: new Date().toISOString(),
          serverSequence: null,
        },
      ],
      clientId,
      batchTimestamp: new Date().toISOString(),
    };

    const res = await request(app.getHttpServer())
      .post('/sync/push')
      .send(batch)
      .expect(201);

    expect(res.body).toHaveProperty('operations');
    expect(res.body.operations.length).toBe(1);
    expect(res.body.operations[0].serverSequence).toBe(1);
    expect(res.body).toHaveProperty('conflicts');
    expect(res.body.conflicts).toHaveLength(0);
  });

  it('POST /sync/push - should assign monotonically increasing sequence numbers', async () => {
    const batch = {
      operations: [
        {
          id: uuidv4(),
          entityType: 'trip',
          entityId: uuidv4(),
          operationType: 'create',
          changedFields: { title: 'Second Trip' },
          clientTimestamp: new Date().toISOString(),
          serverSequence: null,
        },
        {
          id: uuidv4(),
          entityType: 'trip',
          entityId: uuidv4(),
          operationType: 'create',
          changedFields: { title: 'Third Trip' },
          clientTimestamp: new Date().toISOString(),
          serverSequence: null,
        },
      ],
      clientId,
      batchTimestamp: new Date().toISOString(),
    };

    const res = await request(app.getHttpServer())
      .post('/sync/push')
      .send(batch)
      .expect(201);

    expect(res.body.operations[0].serverSequence).toBe(2);
    expect(res.body.operations[1].serverSequence).toBe(3);
  });

  it('POST /sync/push - should merge field-level changes (different fields preserved)', async () => {
    const sharedEntityId = uuidv4();

    // First operation: update title
    const batch1 = {
      operations: [
        {
          id: uuidv4(),
          entityType: 'itineraryEntry',
          entityId: sharedEntityId,
          operationType: 'update',
          changedFields: { title: 'Updated Title' },
          clientTimestamp: '2025-01-01T10:00:00.000Z',
          serverSequence: null,
        },
      ],
      clientId,
      batchTimestamp: new Date().toISOString(),
    };

    await request(app.getHttpServer())
      .post('/sync/push')
      .send(batch1)
      .expect(201);

    // Second operation from another device: update notes on the same entity
    const batch2 = {
      operations: [
        {
          id: uuidv4(),
          entityType: 'itineraryEntry',
          entityId: sharedEntityId,
          operationType: 'update',
          changedFields: { notes: 'Updated Notes' },
          clientTimestamp: '2025-01-01T10:01:00.000Z',
          serverSequence: null,
        },
      ],
      clientId: uuidv4(),
      batchTimestamp: new Date().toISOString(),
    };

    const res = await request(app.getHttpServer())
      .post('/sync/push')
      .send(batch2)
      .expect(201);

    // Both fields should be preserved in the merged result
    expect(res.body.operations[0].changedFields).toHaveProperty('title', 'Updated Title');
    expect(res.body.operations[0].changedFields).toHaveProperty('notes', 'Updated Notes');
    expect(res.body.conflicts).toHaveLength(0);
  });

  it('POST /sync/push - should resolve same-field conflict using LWW and log conflict', async () => {
    const sharedEntityId = uuidv4();

    // First operation: set title to "Original"
    const batch1 = {
      operations: [
        {
          id: uuidv4(),
          entityType: 'itineraryEntry',
          entityId: sharedEntityId,
          operationType: 'update',
          changedFields: { title: 'Title from Device A' },
          clientTimestamp: '2025-01-01T10:00:00.000Z',
          serverSequence: null,
        },
      ],
      clientId,
      batchTimestamp: new Date().toISOString(),
    };

    await request(app.getHttpServer())
      .post('/sync/push')
      .send(batch1)
      .expect(201);

    // Second operation: same field, different value
    const batch2 = {
      operations: [
        {
          id: uuidv4(),
          entityType: 'itineraryEntry',
          entityId: sharedEntityId,
          operationType: 'update',
          changedFields: { title: 'Title from Device B' },
          clientTimestamp: '2025-01-01T10:02:00.000Z',
          serverSequence: null,
        },
      ],
      clientId: uuidv4(),
      batchTimestamp: new Date().toISOString(),
    };

    const res = await request(app.getHttpServer())
      .post('/sync/push')
      .send(batch2)
      .expect(201);

    // The new operation has higher server sequence, so it wins (LWW)
    expect(res.body.operations[0].changedFields.title).toBe('Title from Device B');
    // Should log a conflict
    expect(res.body.conflicts.length).toBeGreaterThanOrEqual(1);
    const conflict = res.body.conflicts[0];
    expect(conflict.field).toBe('title');
    expect(conflict.localValue).toBe('Title from Device A');
    expect(conflict.remoteValue).toBe('Title from Device B');
    expect(conflict.resolvedValue).toBe('Title from Device B');
  });

  it('GET /sync/pull?since=<sequence> - should return operations since given sequence', async () => {
    const res = await request(app.getHttpServer())
      .get('/sync/pull?since=2')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    // All operations after sequence 2 should be returned
    for (const op of res.body) {
      expect(op.serverSequence).toBeGreaterThan(2);
    }
  });

  it('GET /sync/pull?since=0 - should return all operations', async () => {
    const res = await request(app.getHttpServer())
      .get('/sync/pull?since=0')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
  });
});
