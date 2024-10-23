import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { execSync } from 'child_process';

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  execSync('npm run knex -- migrate:rollback --all');
  execSync('npm run knex -- migrate:latest');
});

describe('Meals Routes', () => {
  it('should be able to post a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Wick', email: 'johnwick@continentalhotel.com' })
      .expect(201);

    const sessionCookie = createUserResponse.get('Set-Cookie') ?? [];

    await await request(app.server)
      .post('/meals')
      .set('Cookie', sessionCookie)
      .send({
        name: 'Café da manhã',
        description: 'Bauru',
        date: '2024-10-01 07:00:00',
        isOnDiet: false,
      })
      .expect(201);
  });
});
