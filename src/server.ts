import fastify from 'fastify';
import { mealsRoutes } from './routes/mealsRoutes';

const app = fastify();

app.register(mealsRoutes, {
  prefix: 'meals',
});

app.listen({ port: 3333 }, () => {
  console.log('HTTP server is running!');
});
