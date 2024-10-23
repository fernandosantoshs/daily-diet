import { it, describe, beforeAll, afterAll, beforeEach } from 'vitest';
import { app } from '../src/app';
import request from 'supertest';
import { execSync } from 'child_process';

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync('npm run knex --- migrate:rollback --all');
    execSync('npm run knex --- migrate:latest');
  });

  it('should be able to create an user', async () => {
    await request(app.server)
      .post('/users')
      .send({ name: 'John Wick', email: 'johnwick@continentalhotel.com' })
      .expect(201);
  });
});
