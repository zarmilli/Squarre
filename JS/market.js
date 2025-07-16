import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://blmjdyhhqgqbycntysip.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q";

const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    alert("Please log in.");
    location.href = "index.html";
    return;
  }

  const { data: investments, error: investFetchError } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id);

  const { data: assets, error: assetFetchError } = await supabase
    .from("assets")
    .select("*");

  if (investFetchError || assetFetchError || !investments || !assets) {
    console.error("Failed to fetch investments or assets.");
    return;
  }

  const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("card_style")
  .eq("id", user.id)
  .single();

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

  const container = document.getElementById("investmentList");

  investments.forEach(investment => {
    const assetInfo = assets.find(
      asset => asset.name === investment.asset_type
    );

    if (!assetInfo || !assetInfo.start_date) return;

    const investedAt = new Date(assetInfo.start_date);
    const now = new Date();
    const maturityTime = new Date(investedAt);
    maturityTime.setDate(maturityTime.getDate() + assetInfo.duration_weeks * 7);

    const totalTime = maturityTime - investedAt;
    const elapsedTime = now - investedAt;
    const progress = Math.min(100, (elapsedTime / totalTime) * 100).toFixed(1);

    const card = document.createElement("div");
card.className = "investment-card";
card.innerHTML = `
  <div class="investment-summary">
    <img src="${assetInfo.icon}" class="investment-icon" alt="${assetInfo.name}" />
    <div class="investment-info">
      <div class="investment-title">${investment.asset_type}</div>
      <div class="investment-details">
        R${(investment.unit_price * investment.units).toFixed(2)} • ${assetInfo.duration_weeks} weeks
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${progress}%; background-color: ${colors.progress};"></div>
      </div>
    </div>
  </div>
`;

    container.appendChild(card);
  });
});