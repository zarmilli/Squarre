import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://blmjdyhhqgqbycntysip.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q";

const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  const greeting = document.getElementById("greetingUsername");
  const balanceDisplayTop = document.getElementById("userBalance");
  const balanceDisplayCard = document.getElementById("userBalanceCard");
  const investmentDisplay = document.getElementById("investmentBalance");
  const cardNumber = document.getElementById("card-number");
  const investmentCardNumber = document.getElementById("investment-card-number");
  const primaryCardBg = document.getElementById("primary-card-bg");
  const secondaryCardBg = document.getElementById("secondary-card-bg");

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    showToast("User not logged in", "error");
    window.location.href = "index.html";
    return;
  }

  const userId = user.id;

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, balance, card_style")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("Profile fetch error:", profileError.message);
    return;
  }

  const { username, balance, card_style } = profile;
  const formattedBalance = parseFloat(balance).toFixed(2);

  // Update greeting and main balance
  greeting.textContent = `Hi ${username}`;
  if (balanceDisplayTop) balanceDisplayTop.textContent = formattedBalance;
  if (balanceDisplayCard) balanceDisplayCard.textContent = formattedBalance;

  // Format card numbers
  const wallet = userId.replace(/[^0-9]/g, "");
  const padded = wallet.padStart(16, "0");

  if (cardNumber) cardNumber.textContent = "**** **** **** " + padded.slice(-4);
  if (investmentCardNumber) investmentCardNumber.textContent = "**** **** **** " + padded.slice(-8, -4);

  // Safely handle card_style
const selectedStyle = profile.card_style || 1;

  // Update card background images based on card_style
  const styleNum = parseInt(card_style || 1); // default to 1 if null
  if (primaryCardBg) primaryCardBg.src = `imgs/card${styleNum}-p.jpg`;
  if (secondaryCardBg) secondaryCardBg.src = `imgs/card${styleNum}-s.jpg`;

  // Set navbar color based on card_style
const navbar = document.querySelector('.navbar');
const navbarColors = {
  1: '#d8b277',
  2: '#171717',
  3: '#281844',
  4: '#0d244b',
  5: '#84706a',
  6: '#875d62'
};
navbar.style.backgroundColor = navbarColors[selectedStyle] || '#d8b277';

  // Fetch investment data using correct column
  const { data: investments, error: invError } = await supabase
    .from("investments")
    .select("total_value")
    .eq("user_id", userId);

  if (invError) {
    console.error("Investment fetch error:", invError.message);
    investmentDisplay.textContent = "0.00";
    return;
  }

  const totalInvestment = investments.reduce(
    (sum, inv) => sum + parseFloat(inv.total_value || 0),
    0
  );
  investmentDisplay.textContent = totalInvestment.toFixed(2);
});

// Action navigation
document.addEventListener("DOMContentLoaded", () => {
  const actions = {
    action1: "deposit.html",
    action2: "withdraw.html",
    action3: "send.html",
    action4: "invest.html",
  };

  Object.entries(actions).forEach(([id, url]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        window.location.href = url;
      });
    }
  });
});

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.className = `toast hidden`, 3000);
}