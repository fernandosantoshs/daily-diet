import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_time: z.coerce.date().default(new Date()),
      isOnDiet: z.boolean().default(true),
    });

    const { name, description, date_time, isOnDiet } =
      createMealBodySchema.parse(request.body);

    const meal = {
      id: crypto.randomUUID(),
      name,
      description,
      date_time,
      isOnDiet,
    };

    return reply.status(201).send(meal);
  });

  app.get('/', async (request, reply) => {
    reply.status(200).send('Hello World !');
  });
}
