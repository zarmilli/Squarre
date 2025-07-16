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
            <div class="progress-bar" style="width: ${progress}%"></div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
});