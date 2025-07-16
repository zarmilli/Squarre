import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://blmjdyhhqgqbycntysip.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q" // your actual anon key
);

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("You must be logged in.");
    window.location.href = "options.html";
    return;
  }

  const userId = user.id;

  // Fetch user profile for wallet address
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("wallet_address")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    alert("Could not load profile.");
    return;
  }

  const walletAddress = profile.wallet_address;

  // Get all transactions related to this user or their wallet
  const [fromTxs, toTxs, userTxs] = await Promise.all([
    supabase.from("transactions").select("*").eq("from", walletAddress),
    supabase.from("transactions").select("*").eq("to", walletAddress),
    supabase.from("transactions").select("*").eq("user_id", userId),
  ]);

  const allTx = [
    ...(fromTxs.data || []),
    ...(toTxs.data || []),
    ...(userTxs.data || [])
  ];

  // Deduplicate transactions based on ID (in case of overlap)
  const uniqueTxs = Object.values(
    allTx.reduce((acc, tx) => {
      acc[tx.id] = tx;
      return acc;
    }, {})
  ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const txList = document.getElementById("transactionList");

  if (uniqueTxs.length === 0) {
    txList.innerHTML = `<p>You haven't transacted yet.</p>`;
  } else {
    uniqueTxs.forEach(tx => {
      const source = tx.from === "Squarre" ? "Squarre" : `**** ${tx.from?.slice(-4) || "Squarre"}`;
      const date = new Date(tx.created_at).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });

      const iconMap = {
  Send: "imgs/send2.svg",
  Receive: "imgs/receive2.svg",
  Deposit: "imgs/deposit2.svg",
  Withdraw: "imgs/withdraw2.svg",
  Interest: "imgs/interest2.svg",
  Invest: "imgs/invest.svg",
};

const iconSrc = iconMap[tx.type] || "imgs/default-icon.svg";

      const row = document.createElement("div");
      row.className = "transaction-row";
      row.innerHTML = `
  <img src="${iconSrc}" alt="${tx.type}" class="tx-icon" />
  <div class="tx-left">
    <div>
      <div class="tx-user">${source}</div>
      <div class="tx-date">${date}</div>
    </div>
  </div>
  <div class="tx-right">
    <div class="tx-amount">R${parseFloat(tx.amount).toFixed(2)}</div>
    <div class="tx-type">${tx.type}</div>
  </div>
`;
      txList.appendChild(row);
    });
  }
});