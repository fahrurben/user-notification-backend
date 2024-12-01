import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("notification_logs", (table) => {
    table.bigIncrements("id").primary().unique();
    table.integer("type").notNullable();
    table.bigint("userId").unsigned().notNullable();
    table.string("status").notNullable();
    table.timestamp("sentTime").notNullable();
    table.foreign("userId").references("users.id");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("notification_logs");
}
