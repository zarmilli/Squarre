
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://suwiamrsjmbvhceqxchp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Klz_ThyoQBexF3VUJuAa4w_F7jeaoS-';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('applicationForm');
const button = document.getElementById('submitButton');
const message = document.getElementById('formMessage');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const file = document.getElementById('cv').files[0];

  if (!file || file.type !== 'application/pdf' || file.size > 5242880) {
    message.textContent = 'Please upload a PDF CV smaller than 5MB.';
    return;
  }

  button.disabled = true;
  button.textContent = 'Submitting...';
  message.textContent = '';

  try {
    // Request a temporary upload permission
    const uploadResponse = await fetch('/api/create-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      })
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(uploadData.error || 'Unable to prepare CV upload.');
    }

    // Upload the CV directly to private Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('candidate-cvs')
      .uploadToSignedUrl(
        uploadData.path,
        uploadData.token,
        file,
        { contentType: 'application/pdf' }
      );

    if (uploadError) throw uploadError;

    // Save the candidate's application
    const formData = new FormData(form);

    const response = await fetch('/api/submit-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        position: formData.get('position'),
        cover_letter: formData.get('cover_letter'),
        cv_path: uploadData.path,
        website: formData.get('website'),
        privacy_consent: document.getElementById('privacyConsent').checked
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Application submission failed.');
    }

    form.reset();
    message.textContent = 'Your application has been submitted successfully. Thank you!';

  } catch (error) {
    console.error(error);
    message.textContent = error.message || 'Something went wrong. Please try again.';
  } finally {
    button.disabled = false;
    button.textContent = 'Submit application';
  }
});
