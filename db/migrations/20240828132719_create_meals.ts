import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.boolean('is_on_diet').notNullable();
    table.timestamp('date').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('meals');
}
