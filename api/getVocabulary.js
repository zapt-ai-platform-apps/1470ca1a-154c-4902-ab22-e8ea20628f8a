import { authenticateUser, sentryWrapper } from './_apiUtils.js';
import { vocabulary } from '../drizzle/schema.js';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';

export default sentryWrapper(async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const user = await authenticateUser(req);

  const sql = neon(process.env.NEON_DB_URL);
  const db = drizzle(sql);

  const result = await db.select()
    .from(vocabulary)
    .where(eq(vocabulary.userId, user.id));

  res.status(200).json(result);
});