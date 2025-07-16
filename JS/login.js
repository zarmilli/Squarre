import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://blmjdyhhqgqbycntysip.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q";
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".loginForm");

  if (!loginForm) {
    console.error("Login form not found in the DOM.");
    return;
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
      showToast("Please fill in all fields", "error");
    return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showToast("Login failed. Refresh and try again", "error");
    return;
    }

    // Save login timestamp (for 20 min timeout)
    localStorage.setItem("loginTimestamp", Date.now())

    window.location.href = "home.html";
  });

  document.querySelector(".loginForm button").addEventListener("click", function (e) {
    const button = e.target;
    button.classList.add("clicked");

    setTimeout(() => {
      button.classList.remove("clicked");
    }, 200);
  });
});

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.className = `toast hidden`, 3000);
}