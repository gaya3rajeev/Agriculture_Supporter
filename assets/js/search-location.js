/* =========================================================================
   search-location.js
   ========================================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  agRequireAuth();

  const stateSelect = document.getElementById("stateSelect");
  const states = await getIndianStates();
  stateSelect.innerHTML = `<option value="" selected disabled>Choose your state</option>` +
    states.map(s => `<option value="${s}">${s}</option>`).join("");

  const form = document.getElementById("locationSearchForm");
  const resultsBox = document.getElementById("locationResults");
  const emptyState = document.getElementById("locationEmpty");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const state = stateSelect.value;
    const locationText = document.getElementById("locationInput").value.trim();
    if (!state) { stateSelect.focus(); return; }

    const btn = form.querySelector("button[type=submit]");
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Searching...`;

    const rec = await getLocationRecommendation(state, locationText);

    btn.disabled = false;
    btn.innerHTML = original;

    if (!rec) {
      resultsBox.classList.add("d-none");
      emptyState.classList.remove("d-none");
      emptyState.querySelector(".ag-state-name").textContent = state;
      return;
    }
    emptyState.classList.add("d-none");
    resultsBox.classList.remove("d-none");
    document.getElementById("resStateTitle").textContent = `${rec.state}${locationText ? " — " + locationText : ""}`;
    document.getElementById("resClimate").textContent = rec.climate;
    document.getElementById("resTip").textContent = rec.tip || "Combine crop and livestock choices below for a balanced, resilient farm income.";

    document.getElementById("resCrops").innerHTML = rec.topCrops.map(c => `
      <div class="col-md-4"><div class="rec-card h-100"><i class="bi bi-flower2 text-forest me-2"></i>${c}</div></div>`).join("");
    document.getElementById("resAnimals").innerHTML = rec.topAnimals.map(a => `
      <div class="col-md-4"><div class="rec-card h-100"><i class="bi bi-egg-fried text-forest me-2"></i>${a}</div></div>`).join("");

    resultsBox.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
