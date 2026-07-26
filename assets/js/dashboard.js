/* =========================================================================
   dashboard.js
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const user = agRequireAuth(); // redirects to auth.html if not logged in
  if (!user) return;

  const nameSlot = document.getElementById("dashUserName");
  if (nameSlot) nameSlot.textContent = user.name.split(" ")[0];

  const dateSlot = document.getElementById("dashDate");
  if (dateSlot) {
    dateSlot.textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }
});
