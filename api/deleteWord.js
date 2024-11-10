import { authenticateUser, sentryWrapper } from './_apiUtils.js';
import { vocabulary } from '../drizzle/schema.js';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';

export default sentryWrapper(async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const user = await authenticateUser(req);
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Word ID is required' });
  }

  const sql = neon(process.env.NEON_DB_URL);
  const db = drizzle(sql);

  await db.delete(vocabulary)
    .where(eq(vocabulary.id, id), eq(vocabulary.userId, user.id));

  res.status(200).json({ success: true });
});