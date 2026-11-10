
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://suwiamrsjmbvhceqxchp.supabase.co',
  'sb_publishable_Klz_ThyoQBexF3VUJuAa4w_F7jeaoS-'
);

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const applicationsList = document.getElementById('applicationsList');
const dashboardMessage = document.getElementById('dashboardMessage');

let applications = [];

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const { error } = await supabase.auth.signInWithPassword({
    email: document.getElementById('adminEmail').value,
    password: document.getElementById('adminPassword').value
  });

  if (error) {
    document.getElementById('loginMessage').textContent = 'Invalid login credentials.';
    return;
  }

  await initialiseDashboard();
});

document.getElementById('logoutButton').addEventListener('click', async () => {
  await supabase.auth.signOut();
  loginSection.hidden = false;
  dashboardSection.hidden = true;
});

async function initialiseDashboard() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  // Confirm administrator access
  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !admin) {
    await supabase.auth.signOut();
    document.getElementById('loginMessage').textContent = 'You are not authorised to access this dashboard.';
    return;
  }

  loginSection.hidden = true;
  dashboardSection.hidden = false;

  await loadApplications();
}

async function loadApplications() {
  dashboardMessage.textContent = 'Loading applications...';

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    dashboardMessage.textContent = 'Unable to load applications.';
    return;
  }

  applications = data || [];

  document.getElementById('totalCount').textContent = applications.length;
  document.getElementById('newCount').textContent =
    applications.filter(a => a.status === 'New').length;
  document.getElementById('shortlistedCount').textContent =
    applications.filter(a => a.status === 'Shortlisted').length;

  renderApplications(applications);
  dashboardMessage.textContent = '';
}

function renderApplications(records) {
  applicationsList.replaceChildren();

  records.forEach(application => {
    const card = document.createElement('article');
    const heading = document.createElement('h3');
    const email = document.createElement('p');
    const phone = document.createElement('p');
    const position = document.createElement('p');
    const date = document.createElement('p');
    const status = document.createElement('select');
    const cvButton = document.createElement('button');

    heading.textContent = application.full_name;
    email.textContent = application.email;
    phone.textContent = application.phone;
    position.textContent = `Position: ${application.position}`;
    date.textContent = new Date(application.created_at).toLocaleDateString();

    ['New', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'].forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      status.appendChild(option);
    });

    status.value = application.status;

    status.addEventListener('change', async () => {
      status.disabled = true;

      const { error } = await supabase
        .from('applications')
        .update({ status: status.value })
        .eq('id', application.id);

      if (error) {
        status.value = application.status;
        dashboardMessage.textContent = 'Unable to update candidate status.';
      } else {
        application.status = status.value;
        dashboardMessage.textContent = 'Candidate status updated.';
        updateStats();
      }

      status.disabled = false;
    });

    cvButton.textContent = 'View / Download CV';

    cvButton.addEventListener('click', async () => {
      cvButton.disabled = true;

      const { data, error } = await supabase.storage
        .from('candidate-cvs')
        .createSignedUrl(application.cv_path, 60);

      if (error) {
        dashboardMessage.textContent = 'Unable to access CV.';
      } else {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      }

      cvButton.disabled = false;
    });

    card.append(heading, email, phone, position, date, status, cvButton);
    applicationsList.appendChild(card);
  });
}

function updateStats() {
  document.getElementById('newCount').textContent =
    applications.filter(a => a.status === 'New').length;

  document.getElementById('shortlistedCount').textContent =
    applications.filter(a => a.status === 'Shortlisted').length;
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();

  renderApplications(applications.filter(a =>
    a.full_name.toLowerCase().includes(query) ||
    a.email.toLowerCase().includes(query) ||
    a.position.toLowerCase().includes(query)
  ));
});

// Restore an existing authenticated session
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  await initialiseDashboard();
}
