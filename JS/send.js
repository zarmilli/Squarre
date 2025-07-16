import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://blmjdyhhqgqbycntysip.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q"; // Replace with your actual key
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showToast("You must be logged in.", "error");
    window.location.href = "options.html";
    return;
  }

  const senderId = user.id;

  const { data: senderProfile, error: senderErr } = await supabase
    .from("profiles")
    .select("wallet_address, balance")
    .eq("id", senderId)
    .single();

  if (senderErr || !senderProfile) {
    showToast("Failed to load sender profile.", "error");
    return;
  }

  const senderWallet = senderProfile.wallet_address;
  let senderBalance = parseFloat(senderProfile.balance);

  document.getElementById("fromWallet").textContent = formatWallet(senderWallet);

  const receiverInput = document.getElementById("toWallet");
  const receiverUsernameDisplay = document.getElementById("receiverUsername");

  receiverInput.addEventListener("input", async () => {
    const wallet = receiverInput.value.trim();
    if (wallet.length < 6) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("username, id")
      .eq("wallet_address", wallet)
      .single();

    if (error || !data) {
      receiverUsernameDisplay.textContent = "Invalid address";
      receiverUsernameDisplay.dataset.receiverId = "";
    } else {
      receiverUsernameDisplay.textContent = data.username;
      receiverUsernameDisplay.dataset.receiverId = data.id;
    }
  });

  const amountInput = document.getElementById("amountInput");
  const payButton = document.getElementById("payBtn");

  amountInput.addEventListener("input", () => {
    const amount = parseFloat(amountInput.value);
    if (!isNaN(amount)) {
      const fee = amount * 0.025;
      const afterFee = (amount - fee).toFixed(2);
      payButton.textContent = `pay R${afterFee}`;
    }
  });

  payButton.addEventListener("click", async () => {
    const receiverWallet = receiverInput.value.trim();
    const receiverId = receiverUsernameDisplay.dataset.receiverId;
    const amount = parseFloat(amountInput.value);
    const fee = amount * 0.025;
    const netAmount = amount - fee;

    if (!receiverWallet || !receiverId || isNaN(amount) || amount <= 0) {
      showToast("Invalid receiver.", "error");
      return;
    }

    if (receiverWallet === senderWallet) {
      showToast("You cannot send money to yourself.", "error");
      return;
    }

    if (senderBalance < amount) {
      showToast("Insufficient funds.", "error");
      return;
    }

    const newSenderBalance = senderBalance - amount;

    const { error: senderUpdateError } = await supabase
      .from("profiles")
      .update({ balance: newSenderBalance })
      .eq("id", senderId);

    if (senderUpdateError) {
      showToast("Failed to deduct balance.", "error");
      return;
    }

    const { data: receiverProfile, error: receiverErr } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", receiverId)
      .single();

    if (receiverErr || !receiverProfile) {
      showToast("Receiver not found.", "error");
      return;
    }

    const updatedReceiverBalance = parseFloat(receiverProfile.balance) + netAmount;

    const { error: receiverUpdateError } = await supabase
      .from("profiles")
      .update({ balance: updatedReceiverBalance })
      .eq("id", receiverId);

    if (receiverUpdateError) {
      console.error("Receiver update error:", receiverUpdateError);
      showToast("Failed to credit receiver.", "error");
      return;
    }

    const { error: txError } = await supabase.from("transactions").insert([
      {
        user_id: senderId,
        type: "Send",
        amount: amount.toFixed(2),
        from: senderWallet,
        to: receiverWallet
      },
      {
        user_id: receiverId,
        type: "Receive",
        amount: netAmount.toFixed(2),
        from: senderWallet,
        to: receiverWallet
      }
    ]);

    if (txError) {
      console.error("Transaction log failed:", txError);
      showToast("Transaction log failed.", "error");
      return;
    }

    showToast("Payment successful!", "success");
    setTimeout(() => window.location.href = "profile.html", 3000);
  });
});

function formatWallet(wallet) {
  return wallet.match(/.{1,4}/g).join(" ");
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = `toast hidden`;
  }, 3000);
}