import { usersRoutes } from './routes/usersRoutes';
import { mealsRoutes } from './routes/mealsRoutes';
import fastify from 'fastify';
import cookie from '@fastify/cookie';

export const app = fastify();

app.register(cookie);

app.register(usersRoutes, {
  prefix: 'users',
});

app.register(mealsRoutes, {
  prefix: 'meals',
});
