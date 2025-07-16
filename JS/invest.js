import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://blmjdyhhqgqbycntysip.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q";

const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showToast("You must be logged in.", "error");
    location.href = "options.html";
    return;
  }

  const assetData = [
    {
      category: "Agriculture",
      assets: [
        {
          name: "Poultry",
          icon: "imgs/poultry.svg",
          duration: "8 weeks",
          interest: "20%",
          price: 100,
          description: "Invest in broiler chicks. When they grow and sell, you get your interest. Our Broilers are the best in the KZN province."
        },
        {
          name: "Lettuce",
          icon: "imgs/lettuce.svg",
          duration: "12 weeks",
          interest: "13%",
          price: 50,
          description: "Our hydroponic lettuce grows in mineral-rich water without soil, producing fresher and healthier yields faster."
        },
        {
          name: "Cabbages",
          icon: "imgs/cabbages.svg",
          duration: "12 weeks",
          interest: "15%",
          price: 20,
          description: "Support local farming by investing in organic cabbages grown with care to yield consistent returns and good impact."
        }
      ]
    },
    {
      category: "Cash",
      assets: [
        {
          name: "Savings",
          icon: "imgs/savings.svg",
          duration: "4+ weeks",
          interest: "7%",
          price: 1,
          description: "Earn passive interest by storing your funds with us for at least 4 weeks — perfect for short-term security."
        },
        {
          name: "Goal saving",
          icon: "imgs/goal.svg",
          duration: "16+ weeks",
          interest: "10%",
          price: 50,
          description: "Set a target and save towards it while earning interest over time. Minimum 16 weeks for goal-driven growth."
        }
      ]
    }
  ];

  let openCard = null;

  assetData.forEach(section => {
    section.assets.forEach(asset => {
      const containerId = section.category === "Cash" ? "cashList" : "agricultureList";
      const container = document.getElementById(containerId);
      if (!container) return;

      const card = document.createElement("div");
      card.className = "investment-card";

      card.innerHTML = `
        <div class="investment-summary">
          <img src="${asset.icon}" alt="${asset.name}" class="investment-icon" />
          <div class="investment-info">
            <div class="investment-title">${asset.name}</div>
            <div class="investment-details">${asset.duration} | ${asset.interest}</div>
          </div>
        </div>
        <div class="investment-body">
          <p class="investment-desc">${asset.description}</p>
          <div class="investment-buy-row">
            <div class="investment-price">R${asset.price}</div>
            <div class="investment-quantity">
              <button class="decrease">-</button>
              <span class="quantity">1</span>
              <button class="increase">+</button>
            </div>
            <button class="buy-btn">Buy</button>
          </div>
        </div>
      `;

      const summary = card.querySelector(".investment-summary");
      const quantitySpan = card.querySelector(".quantity");
      const increaseBtn = card.querySelector(".increase");
      const decreaseBtn = card.querySelector(".decrease");
      const buyBtn = card.querySelector(".buy-btn");

      let quantity = 1;

      summary.addEventListener("click", () => {
        if (openCard && openCard !== card) {
          openCard.classList.remove("expanded");
        }

        const isExpanded = card.classList.contains("expanded");
        card.classList.toggle("expanded", !isExpanded);
        openCard = !isExpanded ? card : null;
      });

      increaseBtn.addEventListener("click", () => {
        quantity++;
        quantitySpan.textContent = quantity;
        updateBuyText();
      });

      decreaseBtn.addEventListener("click", () => {
        if (quantity > 1) {
          quantity--;
          quantitySpan.textContent = quantity;
          updateBuyText();
        }
      });

      const updateBuyText = () => {
        buyBtn.textContent = `Buy R${(quantity * asset.price).toFixed(2)}`;
      };

      updateBuyText();

      buyBtn.addEventListener("click", async () => {
        const total = quantity * asset.price;

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("balance, wallet_address")
          .eq("id", user.id)
          .single();

        if (error || !profile) {
          showToast("Could not fetch profile", "error");
          return;
        }

        if (profile.balance < total) {
          showToast("Insufficient balance", "error");
          return;
        }

        const { error: investErr } = await supabase.from("investments").insert({
          user_id: user.id,
          asset_type: asset.name,
          units: quantity,
          unit_price: asset.price,
          total_value: total,
          created_at: new Date().toISOString()
        });

        if (investErr) {
          showToast("Investment failed.", "error");
          return;
        }

        await Promise.all([
          supabase.from("profiles").update({ balance: profile.balance - total }).eq("id", user.id),
          supabase.from("transactions").insert({
            user_id: user.id,
            type: "Invest",
            amount: total,
            from: profile.wallet_address,
            to: "Investment Pool"
          })
        ]);

        showToast("Investment successful!", "success");
        setTimeout(() => location.reload(), 3000);
      });

      container.appendChild(card);
    });
  });

  function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
      toast.className = `toast hidden`;
    }, 3000);
  }
});