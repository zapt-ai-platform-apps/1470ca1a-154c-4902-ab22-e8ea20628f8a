import { authenticateUser, sentryWrapper } from './_apiUtils.js';
import { vocabulary } from '../drizzle/schema.js';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export default sentryWrapper(async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const user = await authenticateUser(req);
  const { word, definition, partOfSpeech, example, note } = req.body;

  if (!word || !definition) {
    return res.status(400).json({ error: 'Word and definition are required' });
  }

  const sql = neon(process.env.NEON_DB_URL);
  const db = drizzle(sql);

  const result = await db.insert(vocabulary).values({
    word,
    definition,
    partOfSpeech,
    example,
    note,
    userId: user.id,
  }).returning();

  res.status(201).json(result[0]);
});