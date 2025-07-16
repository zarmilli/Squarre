import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase config
const supabaseUrl = "https://blmjdyhhqgqbycntysip.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q";
const supabase = createClient(supabaseUrl, supabaseKey);

async function populateForm() {
  const amountInput = document.getElementById("inputAmount");
  const amount = amountInput.value.trim();

  if (!amount || isNaN(amount) || Number(amount) <= 5) {
    showToast("Minimum deposit is R5 deposit amount.", "error");
    return false;
  }

  const gross = parseFloat(amount);
  const net = Math.max(0, gross - 3 - (0.03 * gross)).toFixed(2);

  // Set hidden form field for actual Payfast processing
  document.getElementById("amount").value = gross;

  // Update button text to show net deposit
  const button = document.getElementById("depositButton");
  button.textContent = `Deposit R${net}`;

  // Get user ID
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    showToast("User not logged in", "error");
    return false;
  }

  // Set the user ID as custom_str1
  document.getElementById("user_id").value = user.id;

  return true; // Allow the form to submit
}

window.submitPayfast = async function () {
  const ready = await populateForm();
  if (ready) {
    document.getElementById("payfast-form").submit();
  }
};

document.getElementById("inputAmount").addEventListener("input", async () => {
  await populateForm();
});

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.className = `toast hidden`, 3000);
}