// Session expiry check
const loginTime = localStorage.getItem("loginTime");
const twentyMinutes = 20 * 60 * 1000;

if (!loginTime || Date.now() - parseInt(loginTime) > twentyMinutes) {
  await supabase.auth.signOut();
  localStorage.removeItem("loginTime");
  window.location.href = "index.html";
}