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

    const meals = await knex('meals').where({ user_id: user.id }).select('*');

    return reply.status(200).send(meals);
  });

  app.get(
    '/:mealId',
    { preHandler: [checkIfUserExists] },
    async (request, reply) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() });

      const sessionId = request.cookies.sessionId;

      const user = await knex('users')
        .where({ session_id: sessionId })
        .select('id')
        .first();

      const { mealId } = paramsSchema.parse(request.params);

      const meal = await knex('meals')
        .where({ user_id: user.id, id: mealId })
        .select('*')
        .first();

      if (!meal) {
        return reply.status(404).send('Meal not found');
      }

      return reply.status(200).send(meal);
    }
  );

  app.put(
    '/:mealId',
    { preHandler: [checkIfUserExists] },
    async (request, reply) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() });

      const putMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isOnDiet: z.boolean().optional(),
        date: z.coerce.date().optional(),
      });

      const { mealId } = paramsSchema.parse(request.params);

      const { name, description, isOnDiet, date } = putMealBodySchema.parse(
        request.body
      );

      const meal = await knex('meals').where({ id: mealId }).first();

      if (!meal) {
        return reply.status(404).send('Meal not found');
      }

      const updatedMeal = {
        ...meal,
        name: name ?? meal.name,
        description: description ?? meal.description,
        is_on_diet: isOnDiet ?? meal.is_on_diet,
        date: date ?? meal.date,
        updated_at: new Date().toLocaleString('pt-BR'),
      };

      await knex('meals').where('id', mealId).update(updatedMeal);

      return reply.status(200).send(updatedMeal);
    }
  );

  app.delete(
    '/:mealId',
    { preHandler: [checkIfUserExists] },
    async (request, reply) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() });

      const { mealId } = paramsSchema.parse(request.params);

      const meal = await knex('meals').where('id', mealId).first();

      if (!meal) {
        return reply.status(404).send('Meal not found');
      }

      await knex('meals').where('id', mealId).del();

      return reply.status(204).send();
    }
  );
}
