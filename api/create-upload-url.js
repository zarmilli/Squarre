
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, fileType, fileSize } = req.body || {};

    if (fileType !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are accepted.' });
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > 5242880) {
      return res.status(400).json({ error: 'CV must be smaller than 5MB.' });
    }

    if (typeof fileName !== 'string' || fileName.length > 255) {
      return res.status(400).json({ error: 'Invalid filename.' });
    }

    const path = `applications/${randomUUID()}.pdf`;

    const { data, error } = await supabase.storage
      .from('candidate-cvs')
      .createSignedUploadUrl(path);

    if (error) throw error;

    return res.status(200).json({
      path,
      token: data.token
    });

  } catch (error) {
    console.error('Upload URL error:', error.message);
    return res.status(500).json({ error: 'Unable to prepare CV upload.' });
  }
}
