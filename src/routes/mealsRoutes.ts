import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { checkIfUserExists } from '../middlewares/check-if-user-exists';
import { parseMeals } from '../utils/meals';

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: checkIfUserExists }, async (request, reply) => {
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
        user_id: request.user?.id,
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.getTime(),
      })
      .returning(['name', 'description', 'is_on_diet', 'date']);

    const parsedMeal = parseMeals(meal);

    return reply.status(201).send(parsedMeal);
  });

  app.get('/', { preHandler: [checkIfUserExists] }, async (request, reply) => {
    const meals = await knex('meals')
      .where({ user_id: request.user?.id })
      .select('*');

    const parsedMeals = parseMeals(meals);

    return reply.status(200).send(parsedMeals);
  });

  app.get(
    '/:mealId',
    { preHandler: [checkIfUserExists] },
    async (request, reply) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() });

      const { mealId } = paramsSchema.parse(request.params);

      const meal = await knex('meals')
        .where({ user_id: request.user?.id, id: mealId })
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

      const meal = await knex('meals').where({ id: mealId }).first();

      if (!meal) {
        return reply.status(404).send('Meal not found');
      }

      const { name, description, isOnDiet, date } = putMealBodySchema.parse(
        request.body
      );

      const updatedMeal = {
        ...meal,
        name: name ?? meal.name,
        description: description ?? meal.description,
        is_on_diet: isOnDiet ?? meal.is_on_diet,
        date: date?.getTime() ?? meal.date,
        updated_at: new Date().getTime(),
      };

      await knex('meals').where('id', mealId).update(updatedMeal);

      const parsedMeal = parseMeals([updatedMeal]);

      return reply.status(200).send(parsedMeal);
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

  app.get(
    '/metrics',
    { preHandler: [checkIfUserExists] },
    async (request, reply) => {
      /**
     * - Quantidade total de refeições registradas
  - Quantidade total de refeições dentro da dieta
  - Quantidade total de refeições fora da dieta
  - Melhor sequência de refeições dentro da dieta
     */

      const meals = await knex('meals').where('user_id', request.user?.id);

      const totalMeals = meals.length;

      const mealsOnDiet = meals.filter((meal) => {
        return meal.is_on_diet == true;
      }).length;

      const mealsNotOnDiet = meals.filter((meal) => {
        return meal.is_on_diet == false;
      }).length;

      const metrics = {
        totalMeals,
        mealsOnDiet,
        mealsNotOnDiet,
      };

      return reply.status(200).send(metrics);
    }
  );
}
