import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://blmjdyhhqgqbycntysip.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q"
);

const balanceEl = document.getElementById("balance");
const accountNumberEl = document.getElementById("accountNumber");
const withdrawBtn = document.getElementById("withdrawBtn");
const dialpad = document.getElementById("dialpad");
const deleteBtn = document.getElementById("deleteBtn");
const toast = document.getElementById("toast");
const popup = document.getElementById("successPopup");

let currentInput = "";

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

function closePopup() {
  popup.classList.add("hidden");
  window.location.href = "profile.html";
}

function updateBtnText() {
  const fee = parseFloat(currentInput) * 0.025;
  const afterFee = (parseFloat(currentInput) - fee).toFixed(2);
  withdrawBtn.textContent = isNaN(afterFee) ? "Withdraw R0.00" : `Withdraw R${afterFee}`;
}

function createDialpad() {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""];
  keys.forEach((key, i) => {
    const div = document.createElement("div");
    div.textContent = key;
    if (key) {
      div.onclick = () => {
        currentInput += key;
        updateBtnText();
      };
    }
    dialpad.appendChild(div);
  });
}

deleteBtn.addEventListener("click", () => {
  currentInput = currentInput.slice(0, -1);
  updateBtnText();
});

withdrawBtn.addEventListener("click", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const amount = parseFloat(currentInput);
  if (!amount || amount <= 0) return showToast("Enter valid amount");

  // Get balance and wallet
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: bank } = await supabase.from("bank_details").select("*").eq("user_id", user.id).single();

  if (!profile || !bank) return showToast("Missing profile or bank data");
  if (profile.balance < amount) return showToast("Insufficient funds");

  const fee = amount * 0.025;
  const netAmount = (amount - fee).toFixed(2);

  const { error: balanceErr } = await supabase
    .from("profiles")
    .update({ balance: profile.balance - amount })
    .eq("id", user.id);

  if (balanceErr) return showToast("Failed to update balance");

  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "Withdraw",
    amount,
    created_at: new Date().toISOString(),
    from: profile.wallet_address
  });

  const { error: withdrawErr } = await supabase.from("withdrawals").insert({
    user_id: user.id,
    username: profile.username,
    amount: netAmount,
    bank_name: bank.bank_name,
    account_number: bank.account_number,
    payshap: bank.payshap,
    payshap_number: bank.payshap ? bank.payshap_number : null,
    status: "pending"
  });

  if (withdrawErr) return showToast("Withdrawal failed");
  popup.classList.remove("hidden");
});

window.addEventListener("DOMContentLoaded", async () => {
  createDialpad();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: bank } = await supabase.from("bank_details").select("*").eq("user_id", user.id).single();

  balanceEl.textContent = profile ? `R${parseFloat(profile.balance).toFixed(2)}` : "R0.00";
  accountNumberEl.textContent = bank?.account_number || "No Data";
});

document.getElementById("closePopupBtn").addEventListener("click", () => {
  document.getElementById("successPopup").classList.add("hidden");
});
