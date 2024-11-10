import { authenticateUser, sentryWrapper } from './_apiUtils.js';
import formidable from 'formidable';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';
import fs from 'fs';

const supabaseStorage = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default sentryWrapper(async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const user = await authenticateUser(req);

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      Sentry.captureException(err);
      return res.status(500).json({ error: 'Error parsing the file' });
    }

    const file = files.file;
    const fileData = await fs.promises.readFile(file.filepath);

    // Upload to Supabase Storage
    const { data, error } = await supabaseStorage.storage
      .from('uploads')
      .upload(`documents/${user.id}/${file.originalFilename}`, fileData, {
        contentType: file.mimetype,
      });

    if (error) {
      Sentry.captureException(error);
      return res.status(500).json({ error: 'Error uploading the file' });
    }

    res.status(200).json({ message: 'File uploaded successfully', path: data.path });
  });
});

export const config = {
  api: {
    bodyParser: false,
  },
};