/* search-location.js — state > district > locality, results from PostgreSQL */
document.addEventListener("DOMContentLoaded", async () => {
  agRequireAuth();

  const stateSelect = document.getElementById("stateSelect");
  const districtSelect = document.getElementById("districtSelect");
  const localitySelect = document.getElementById("localitySelect");
  const form = document.getElementById("locationSearchForm");
  const resultsBox = document.getElementById("locationResults");
  const emptyState = document.getElementById("locationEmpty");

  function fill(select, placeholder, options) {
    select.innerHTML =
      `<option value="" selected disabled>${placeholder}</option>` +
      options.map(o => `<option value="${o.value}">${o.label}</option>`).join("");
  }

  function badgeClass(s) {
    if (s === "Highly Suitable") return "bg-success";
    if (s === "Suitable") return "bg-primary";
    return "bg-warning text-dark";
  }

  function card(icon, name, suitability, reason) {
    return `<div class="col-md-4"><div class="rec-card h-100">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <strong><i class="bi ${icon} text-forest me-2"></i>${name}</strong>
        <span class="badge ${badgeClass(suitability)}">${suitability}</span>
      </div>
      <div class="small text-muted">${reason || ""}</div>
    </div></div>`;
  }

  try {
    const states = await getStates();
    fill(stateSelect, "Choose your state", states.map(s => ({ value: s, label: s })));
  } catch (e) {
    fill(stateSelect, "Cannot reach server", []);
  }
  fill(districtSelect, "Choose a state first", []);
  fill(localitySelect, "Choose a district first", []);

  stateSelect.addEventListener("change", async () => {
    fill(localitySelect, "Choose a district first", []);
    localitySelect.disabled = true;
    const districts = await getDistricts(stateSelect.value);
    fill(districtSelect, "Choose your district", districts.map(d => ({ value: d, label: d })));
    districtSelect.disabled = false;
  });

  districtSelect.addEventListener("change", async () => {
    const locs = await getLocalities(stateSelect.value, districtSelect.value);
    fill(localitySelect, "Choose your area", locs.map(l => ({ value: l.location_id, label: l.locality })));
    localitySelect.disabled = false;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!localitySelect.value) { localitySelect.focus(); return; }

    const btn = form.querySelector("button[type=submit]");
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Searching...`;

    let rec = null;
    try { rec = await getRecommendationsForLocation(localitySelect.value); } catch (err) {}

    btn.disabled = false;
    btn.innerHTML = original;

    if (!rec || (!rec.crops.length && !rec.livestock.length)) {
      resultsBox.classList.add("d-none");
      emptyState.classList.remove("d-none");
      return;
    }

    const L = rec.location;
    emptyState.classList.add("d-none");
    resultsBox.classList.remove("d-none");
    document.getElementById("resStateTitle").textContent = `${L.locality}, ${L.district}, ${L.state}`;
    document.getElementById("resClimate").textContent = L.climate;
    document.getElementById("resTip").textContent =
      `Agro zone: ${L.agro_zone} · Soil: ${L.soil_type} · Rainfall: ${L.annual_rainfall_mm} mm/year · Water availability: ${L.water_availability}`;

    document.getElementById("resCrops").innerHTML = rec.crops.length
      ? rec.crops.map(c => card("bi-flower2", c.crop_name, c.suitability, c.reason)).join("")
      : `<div class="col-12 text-muted">No crop data for this area yet.</div>`;
    document.getElementById("resAnimals").innerHTML = rec.livestock.length
      ? rec.livestock.map(a => card("bi-egg-fried", a.animal_name, a.suitability, a.reason)).join("")
      : `<div class="col-12 text-muted">No livestock data for this area yet.</div>`;

    resultsBox.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});