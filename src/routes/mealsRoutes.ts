import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { checkIfUserExists } from '../middlewares/check-if-user-exists';

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: checkIfUserExists }, async (request, reply) => {
    const sessionId = request.cookies.sessionId;

    const user = await knex('users')
      .where({ session_id: sessionId })
      .select('id')
      .first();

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
        user_id: user.id,
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.toISOString(),
      })
      .returning(['name', 'description', 'is_on_diet', 'date']);

    return reply.status(201).send(meal);
  });

  app.get('/', { preHandler: [checkIfUserExists] }, async (request, reply) => {
    const sessionId = request.cookies.sessionId;
    const user = await knex('users')
      .where({ session_id: sessionId })
      .select('id')
      .first();

    console.log(user.id);

    const meals = await knex('meals').where({ user_id: user.id }).select('*');

    return reply.status(200).send(meals);
  });
}
