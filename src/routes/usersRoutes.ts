import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { randomUUID } from 'crypto';

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const users = await knex('users').select('*');
    return reply.status(200).send(users);
  });

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string().min(3),
      email: z.string().email({ message: 'Invalid email' }),
    });

    const { email, name } = createUserBodySchema.parse(request.body);

    const userExists = await knex('users').where({ email }).first();

    if (userExists) {
      reply.setCookie('sessionId', userExists.session_id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return reply.status(200).send('User logged in!');
    }

    const sessionId = randomUUID();

    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    await knex('users').insert({
      id: randomUUID(),
      session_id: sessionId,
      name,
      email,
    });

    return reply.status(201).send('Created');
  });
}
