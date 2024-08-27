import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean().default(true),
      date: z.coerce.date().default(new Date()),
    });

    const { name, description, date, isOnDiet } = createMealBodySchema.parse(
      request.body
    );

    const meal = {
      id: crypto.randomUUID(),
      name,
      description,
      isOnDiet,
      date,
    };

    return reply.status(201).send(meal);
  });

  app.get('/', async (request, reply) => {
    reply.status(200).send('Hello World !');
  });
}
