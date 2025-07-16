import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://blmjdyhhqgqbycntysip.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q";
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username, balance")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    showToast("Failed to load profile.", "error");
    return;
  }

  document.getElementById("username").textContent = profile.username;
  document.getElementById("balance").textContent = "R" + parseFloat(profile.balance).toFixed(2);
});

function logout() {
  supabase.auth.signOut().then(() => {
    window.location.href = "index.html";
  }).catch(() => {
    showToast("Logout failed", "error");
  });
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.className = `toast hidden`, 3000);
}
