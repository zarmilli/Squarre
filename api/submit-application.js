
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      full_name,
      email,
      phone,
      position,
      cover_letter,
      cv_path,
      website
    } = req.body || {};

    // Honeypot field for basic bot detection
    if (website) {
      return res.status(400).json({ error: 'Invalid submission.' });
    }

    if (
      typeof full_name !== 'string' ||
      full_name.trim().length < 2 ||
      full_name.length > 120 ||
      typeof email !== 'string' ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof phone !== 'string' ||
      phone.trim().length < 5 ||
      phone.length > 30 ||
      typeof position !== 'string' ||
      !position.trim() ||
      position.length > 150 ||
      typeof cv_path !== 'string' ||
      !/^applications\/[0-9a-f-]{36}\.pdf$/i.test(cv_path) ||
      (cover_letter !== undefined &&
        (typeof cover_letter !== 'string' || cover_letter.length > 5000))
    ) {
      return res.status(400).json({ error: 'Please check your application details.' });
    }

    // Verify that the uploaded document exists
    const { data: cv, error: cvError } = await supabase.storage
      .from('candidate-cvs')
      .download(cv_path);

    if (cvError || !cv) {
      return res.status(400).json({ error: 'CV upload could not be verified.' });
    }

    if (cv.size > 5242880) {
      return res.status(400).json({ error: 'CV exceeds the 5MB limit.' });
    }

    const header = new Uint8Array(
      await cv.slice(0, 5).arrayBuffer()
    );

    if (new TextDecoder().decode(header) !== '%PDF-') {
      return res.status(400).json({ error: 'The uploaded file is not a valid PDF.' });
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        position: position.trim(),
        cover_letter: cover_letter?.trim() || null,
        cv_path,
        privacy_consent: true,
        privacy_consent_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      application_id: data.id
    });

  } catch (error) {
    console.error('Application submission error:', error.message);
    return res.status(500).json({ error: 'Unable to submit application. Please try again.' });
  }
}
