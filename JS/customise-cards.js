import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://blmjdyhhqgqbycntysip.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWpkeWhocWdxYnljbnR5c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTE2NDgsImV4cCI6MjA2NDUyNzY0OH0.v-DdY4a2bwv70UOtIFKG10bhd5WnAzxQpWfJ3Zqk34Q"
);

let selectedStyle = 1;

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return location.href = "index.html";

  const userId = user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("card_style")
    .eq("id", userId)
    .single();

  selectedStyle = profile?.card_style || 1;
  updatePreviews(selectedStyle);
  highlightCircle(selectedStyle);

  document.querySelectorAll('.style-circle').forEach(circle => {
    circle.addEventListener('click', () => {
      selectedStyle = parseInt(circle.dataset.style);
      updatePreviews(selectedStyle);
      highlightCircle(selectedStyle);
    });
  });

  document.getElementById("saveBtn").addEventListener("click", async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ card_style: selectedStyle })
      .eq("id", userId);

    if (!error) window.location.href = "home.html";
    else alert("Failed to save. Try again.");
  });
});

function updatePreviews(styleNumber) {
  document.getElementById("primaryPreview").src = `imgs/card${styleNumber}-p.jpg`;
  document.getElementById("secondaryPreview").src = `imgs/card${styleNumber}-s.jpg`;
}

function highlightCircle(styleNumber) {
  document.querySelectorAll('.style-circle').forEach(circle => {
    circle.classList.toggle('selected', parseInt(circle.dataset.style) === styleNumber);
  });
}
