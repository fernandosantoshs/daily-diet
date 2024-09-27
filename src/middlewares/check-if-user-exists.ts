import { FastifyReply, FastifyRequest } from 'fastify';
import { knex } from '../database';

export async function checkIfUserExists(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return reply.status(401).send('Unauthorized! Please login');
  }

  const user = await knex('users').where({ session_id: sessionId }).first();

  if (!user) {
    return reply.status(404).send('User not Found.');
  }

  request.user = user;
}
