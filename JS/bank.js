import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://blmjdyhhqgqbycntysip.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q"
);

function showToast(message, danger = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.backgroundColor = danger ? "#b00020" : "#333";
  toast.classList.remove("hidden");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 3000);
}

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from("bank_details")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!error && data) {
    document.getElementById("summaryName").textContent = data.account_holder || "No data";
    document.getElementById("summaryBank").textContent = data.bank_name || "No data";
    document.getElementById("summaryAccount").textContent = data.account_number || "No data";
  }
});

window.updateBankInfo = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const bank_name = document.getElementById("bankName").value.trim();
  const account_number = document.getElementById("accountNumber").value.trim();
  const account_holder = document.getElementById("accountHolder").value.trim();
  const payshap_number = document.getElementById("cellNumber").value.trim();
  const payshap = document.getElementById("payshapToggle").checked;

  const { data: existing } = await supabase
    .from("bank_details")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const payload = {
    user_id: user.id,
    bank_name,
    account_number,
    account_holder,
    payshap,
    payshap_number,
  };

  if (existing) {
    await supabase.from("bank_details").update(payload).eq("user_id", user.id);
    showToast("Bank info updated");
  } else {
    await supabase.from("bank_details").insert(payload);
    showToast("Bank info saved");
  }

  setTimeout(() => location.reload(), 2000);
};
