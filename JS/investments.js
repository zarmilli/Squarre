import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://blmjdyhhqgqbycntysip.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q"
);

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return location.href = "index.html";

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    document.getElementById("unauthorizedPopup").classList.remove("hidden");
    return;
  }

  loadInvestments();
});

async function loadInvestments() {
  const { data: assets } = await supabase.from("assets").select("*");
  const { data: allInvestments } = await supabase.from("investments").select("*");

  const container = document.getElementById("investmentList");
  container.innerHTML = "";

  assets.forEach(asset => {
    const investmentsForAsset = allInvestments.filter(i => i.asset_type === asset.name);
    const activeCount = investmentsForAsset.length;
    const totalInvested = investmentsForAsset.reduce((sum, i) => sum + parseFloat(i.total_value || 0), 0);

    const now = new Date();
    const startDate = new Date(asset.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + asset.duration_weeks * 7);

    const timeToStart = startDate - now;
    const timeToEnd = endDate - now;
    const countdownToStart = timeToStart > 0;
    const countdownLabel = countdownToStart ? "Starts in" : "Ends in";
    const timeLeft = countdownToStart ? timeToStart : timeToEnd;

    const timeFormatted = formatCountdown(timeLeft);

    const card = document.createElement("div");
    card.className = "investment-entry";
    card.innerHTML = `
      <div class="investment-header">
        <h4>${asset.name}</h4>
        <span>${asset.duration_weeks} weeks</span>
      </div>
      <div class="investment-meta">
        <div>${activeCount} active investments</div>
        <div>R${totalInvested.toFixed(2)}</div>
      </div>
      <div class="investment-timer">
        <div class="timer"><strong>${countdownLabel}:</strong> ${timeFormatted}</div>
        <button class="start-btn" onclick="showStartDatePrompt('${asset.name}')">Set Date</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function formatCountdown(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

window.showStartDatePrompt = async (assetName) => {
  const date = prompt(`Enter new start date for ${assetName} (YYYY-MM-DD):`);
  if (!date) return;
  await supabase.from("assets").update({ start_date: date }).eq("name", assetName);
  loadInvestments();
};

window.redirectHome = () => {
  document.getElementById("unauthorizedPopup").classList.add("hidden");
  location.href = "home.html";
};

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
});

toggleBtn.classList.toggle("collapsed");
