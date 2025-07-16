import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://blmjdyhhqgqbycntysip.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q";
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");

  if (!signupForm) {
    console.error("Signup form not found in the DOM.");
    return;
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password) {
       showToast("Please fill in all fields.", "error");
    return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) {
      showToast("Signup error. Refresh and try again", "error");
    return;
    }

    const userId = data.user?.id;
    if (!userId) {
      showToast("User ID missing, try again", "error");
    return;
    }

    // Generate a 16-digit numeric wallet address
    const walletAddress = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');


    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userId,
        username,
        wallet_address: walletAddress
      }
    ]);

    if (profileError) {
      showToast("Profile creation error", "error");
    return;
    }

    const { error: transactionError } = await supabase.from("transactions").insert([
  {
    user_id: userId,
    amount: 10,
    type: "Interest",
    source: "Squarre"
  }
]);

if (transactionError) {
  showToast("Transaction error", "error");
  return;
}


    window.location.href = "home.html";
  });

  // Animate button
  const signupButton = document.querySelector(".signup-form button");
  if (signupButton) {
    signupButton.addEventListener("click", function (e) {
      const button = e.target;
      button.classList.add("clicked");
      setTimeout(() => {
        button.classList.remove("clicked");
      }, 200);
    });
  }
});

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.className = `toast hidden`, 3000);
}

lottie.loadAnimation({
  container: document.getElementById('lottie-container'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'imgs/KUvXQ2tQgG.json'
});