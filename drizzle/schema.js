import { pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const vocabulary = pgTable('vocabulary', {
  id: serial('id').primaryKey(),
  word: text('word').notNull(),
  definition: text('definition').notNull(),
  partOfSpeech: text('part_of_speech'),
  example: text('example'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
  userId: uuid('user_id').notNull(),
});