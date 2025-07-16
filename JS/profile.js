import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Initialize Supabase
const supabaseUrl = "https://blmjdyhhqgqbycntysip.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q";
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("You must be logged in.");
    window.location.href = "options.html";
    return;
  }

  const userId = user.id;

  // --- Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("balance, wallet_address, card_style")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    alert("Could not load profile.");
    return;
  }

  const walletAddress = profile.wallet_address;

  const selectedStyle = profile.card_style || 1; // Fallback to style 1 if not set

// Set primary card background image
const cardImage = document.querySelector(".balance-card .card-bg");
if (cardImage) {
  cardImage.src = `imgs/card${selectedStyle}-p.jpg`;
}

// Set navbar background color
const navbar = document.querySelector(".navbar");
const navbarColors = {
  1: '#d8b277',
  2: '#171717',
  3: '#281844',
  4: '#0d244b',
  5: '#84706a',
  6: '#875d62'
};
if (navbar) {
  navbar.style.backgroundColor = navbarColors[selectedStyle] || "#d8b277";
}

  // --- Display masked wallet
  const masked = `**** ${walletAddress.slice(-4)}`;
  document.querySelectorAll("#walletAddress").forEach(span => {
    span.textContent = masked;
  });

  // --- Copy on click
  const pill = document.querySelector(".card-pill");
  pill.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      alert("Wallet address copied!");
    } catch {
      const tempInput = document.createElement("input");
      tempInput.value = walletAddress;
      document.body.appendChild(tempInput);
      tempInput.select();
      try {
        document.execCommand("copy");
        alert("Wallet address copied!");
      } catch {
        alert("Copy failed. Please copy manually.");
      }
      document.body.removeChild(tempInput);
    }
  });

  // --- Show balance
  document.getElementById("userBalance").textContent = parseFloat(profile.balance).toFixed(2);

  // --- Fetch transactions for this user only (to prevent duplicates)
  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(4);

  const txList = document.getElementById("transactionList");
  txList.innerHTML = ""; // Clear previous content

  if (txError || !transactions || transactions.length === 0) {
    txList.innerHTML = `<p>You haven't transacted yet.</p>`;
  } else {
    transactions.forEach(tx => {
      const source = tx.from === "Squarre" ? "Squarre" : `**** ${tx.from?.slice(-4) || "Squarre"}`;
      const date = new Date(tx.created_at).toLocaleDateString("en-ZA", {
        year: "numeric", month: "short", day: "numeric"
      });

      const row = document.createElement("div");
      row.className = "transaction-row";
      row.innerHTML = `
        <div class="tx-left">
          <div class="tx-user">${source}</div>
          <div class="tx-date">${date}</div>
        </div>
        <div class="tx-right">
          <div class="tx-amount">R${parseFloat(tx.amount).toFixed(2)}</div>
          <div class="tx-type">${tx.type}</div>
        </div>
      `;
      txList.appendChild(row);
    });
  }

  // --- Navigation actions
  document.getElementById("action1").onclick = () => location.href = "deposit.html";
  document.getElementById("action2").onclick = () => location.href = "withdraw.html";
  document.getElementById("action3").onclick = () => location.href = "send.html";
  document.getElementById("action4").onclick = () => location.href = "invest.html";
});