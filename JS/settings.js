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
    .select("username, balance, card_style")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    showToast("Failed to load profile.", "error");
    return;
  }

const selectedStyle = profile?.card_style || 1;

const styleColors = {
  1: { navbar: "#d8b277", progress: "#d8b277" },
  2: { navbar: "#171717", progress: "#212121" },
  3: { navbar: "#281844", progress: "#281844" },
  4: { navbar: "#0d244b", progress: "#0d244b" },
  5: { navbar: "#84706a", progress: "#84706a" },
  6: { navbar: "#875d62", progress: "#875d62" }
};

const colors = styleColors[selectedStyle] || styleColors[1];

const navbar = document.querySelector(".navbar");
if (navbar) navbar.style.backgroundColor = colors.navbar;
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
