import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean().default(true),
      date: z.coerce.date(),
    });

    const { name, description, isOnDiet, date } = createMealBodySchema.parse(
      request.body
    );

    const meal = await knex('meals')
      .insert({
        id: crypto.randomUUID(),
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.toISOString(),
      })
      .returning(['name', 'description', 'is_on_diet', 'date']);

    return reply.status(201).send(meal);
  });

  app.get('/', async (request, reply) => {
    const meals = await knex('meals').select('*');

    return reply.status(200).send(meals);
  });
}
