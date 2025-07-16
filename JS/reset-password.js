import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://blmjdyhhqgqbycntysip.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q"
);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".forgotForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("reset-email").value.trim();

    if (!email) {
      showToast("Enter your email", "error");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://zarmilli.github.io/squarre/update-password.html"
    });

    if (error) {
      showToast("Email not found or invalid", "error");
    } else {
      showToast("Reset link sent. Check your inbox!", "success");
    }
  });
});

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = `toast hidden`;
  }, 4000);
}
