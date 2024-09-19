import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.uuid('session_id').notNullable();
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.timestamps(true, true); // Adds created_at and updated_at columns on the database
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
