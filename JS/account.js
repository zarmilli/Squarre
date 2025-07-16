import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://blmjdyhhqgqbycntysip.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q";
const supabase = createClient(supabaseUrl, supabaseKey);

function showToast(message, danger = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.backgroundColor = danger ? "#b00020" : "#333";
  toast.classList.remove("hidden");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 3000);
}

function showDeleteConfirmToast(callback) {
  const toast = document.createElement("div");
  toast.className = "toast confirm-toast";
  toast.innerHTML = `
    <div class="toast-message">Are you sure you want to delete your account?</div>
    <div class="toast-actions">
      <button id="confirmDelete" class="confirm-btn">Yes</button>
      <button id="cancelDelete" class="cancel-btn">No</button>
    </div>
  `;

  document.body.appendChild(toast);

  document.getElementById("confirmDelete").onclick = () => {
    document.body.removeChild(toast);
    callback(true);
  };

  document.getElementById("cancelDelete").onclick = () => {
    document.body.removeChild(toast);
    callback(false);
  };
}

async function updateUsername() {
  const { data: { user } } = await supabase.auth.getUser();
  const current = document.getElementById("currentUsername").value.trim();
  const newUsername = document.getElementById("newUsername").value.trim();

  if (!current || !newUsername) {
    showToast("Please fill both fields", true);
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (error || data.username !== current) {
    showToast("Current username incorrect", true);
    return;
  }

  await supabase
    .from("profiles")
    .update({ username: newUsername })
    .eq("id", user.id);

  showToast("Username updated");
}

async function updatePassword() {
  const current = document.getElementById("currentPassword").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();

  if (!current || !newPassword) {
    showToast("Please fill both fields", true);
    return;
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (!session) {
    showToast("Session expired", true);
    return;
  }

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: session.user.email,
    password: current
  });

  if (loginError) {
    showToast("Current password incorrect", true);
    return;
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (updateError) {
    showToast("Password update failed", true);
  } else {
    showToast("Password updated");
  }
}

async function deleteAccount() {
  showDeleteConfirmToast(async (confirmed) => {
    if (!confirmed) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return showToast("User not found", true);

    await Promise.all([
      supabase.from("transactions").delete().eq("user_id", user.id),
      supabase.from("investments").delete().eq("user_id", user.id),
      supabase.from("investments_summary").delete().eq("user_id", user.id),
      supabase.from("profiles").delete().eq("id", user.id)
    ]);

    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast("Failed to log out", true);
      return;
    }

    showToast("Account deleted");
    setTimeout(() => (window.location.href = "index.html"), 2000);
  });
}

window.updateUsername = updateUsername;
window.updatePassword = updatePassword;
window.deleteAccount = deleteAccount;