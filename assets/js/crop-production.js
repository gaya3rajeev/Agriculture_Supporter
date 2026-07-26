/* =========================================================================
   crop-production.js
   Handles three pages via presence of container elements:
     #cropCategoryGrid   -> crop-production.html
     #cropItemGrid       -> crop-category.html?category=slug
     #cropDetailRoot      -> crop-details.html?crop=slug
   ========================================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  agRequireAuth();

  const categoryGrid = document.getElementById("cropCategoryGrid");
  if (categoryGrid) await renderCropCategories(categoryGrid);

  const itemGrid = document.getElementById("cropItemGrid");
  if (itemGrid) await renderCropsInCategory(itemGrid);

  const detailRoot = document.getElementById("cropDetailRoot");
  if (detailRoot) await renderCropDetail(detailRoot);
});

async function renderCropCategories(container) {
  const categories = await getCropCategories();
  container.innerHTML = categories.map((c, i) => `
    <div class="col-6 col-md-4 col-lg-3 reveal reveal-delay-${(i % 3) + 1}">
      <a class="leaf-card hub-card d-block" href="crop-category.html?category=${c.slug}" style="--card-a:${c.colorA};--card-b:${c.colorB}">
        <div class="leaf-visual">${c.icon}</div>
        <span class="tag">Category</span>
        <h3>${c.name}</h3>
        <p>${c.blurb}</p>
        <span class="go-link">Browse crops <i class="bi bi-arrow-right"></i></span>
      </a>
    </div>`).join("");
  reobserveReveals();
}

async function renderCropsInCategory(container) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("category");
  const category = await getCropCategoryBySlug(slug);
  const crops = await getCropsByCategory(slug);

  document.getElementById("catBannerTitle").textContent = category ? category.name : "Category";
  document.getElementById("catBannerBlurb").textContent = category ? category.blurb : "";
  document.getElementById("catCrumbCurrent").textContent = category ? category.name : "";

  if (!crops.length) {
    container.innerHTML = `<div class="col-12 text-center text-muted py-5">No crops found in this category yet.</div>`;
    return;
  }

  container.innerHTML = crops.map((c, i) => `
    <div class="col-6 col-md-4 col-lg-3 reveal reveal-delay-${(i % 3) + 1}">
      <a class="leaf-card d-block" href="crop-details.html?crop=${c.slug}" style="--card-a:${category?.colorA || '#D7E4D2'};--card-b:${category?.colorB || '#8FAE8B'}">
        <div class="leaf-visual">${c.icon}</div>
        <span class="tag">${category ? category.name : ""}</span>
        <h4>${c.name}</h4>
        <p>${c.growth.slice(0, 70)}...</p>
        <span class="go-link">View details <i class="bi bi-arrow-right"></i></span>
      </a>
    </div>`).join("");
  reobserveReveals();
}

async function renderCropDetail(root) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("crop");
  const crop = await getCropBySlug(slug);

  if (!crop) {
    root.innerHTML = `<div class="text-center py-5"><h3>Crop not found</h3><a href="crop-production.html" class="btn btn-wheat mt-3">Back to Crop Production</a></div>`;
    return;
  }
  const category = await getCropCategoryBySlug(crop.categorySlug);

  document.getElementById("detailBreadCategory").textContent = category ? category.name : "";
  document.getElementById("detailBreadCategory").href = `crop-category.html?category=${crop.categorySlug}`;
  document.getElementById("detailTitle").textContent = crop.name;
  document.getElementById("detailCrumbCurrent").textContent = crop.name;
  document.title = `${crop.name} — Agriculture Supporter`;

  root.innerHTML = `
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="detail-hero-visual" style="--card-a:${category?.colorA || '#D7E4D2'};--card-b:${category?.colorB || '#8FAE8B'}">${crop.icon}</div>
      </div>
      <div class="col-md-8">
        <div class="row g-3">
          <div class="col-6 col-md-3"><div class="quick-fact"><i class="bi bi-tag"></i><div class="qf-label">Category</div><div class="qf-val">${category ? category.name : "—"}</div></div></div>
          <div class="col-6 col-md-3"><div class="quick-fact"><i class="bi bi-calendar3"></i><div class="qf-label">Season</div><div class="qf-val">See below</div></div></div>
          <div class="col-6 col-md-3"><div class="quick-fact"><i class="bi bi-droplet"></i><div class="qf-label">Irrigation</div><div class="qf-val">See below</div></div></div>
          <div class="col-6 col-md-3"><div class="quick-fact"><i class="bi bi-bug"></i><div class="qf-label">Pest watch</div><div class="qf-val">See below</div></div></div>
        </div>
        <p class="mt-4 text-muted">Complete cultivation guide for <strong>${crop.name}</strong> — expand each section below for growth stages, ideal climate & soil, fertilizer schedule, irrigation, pest management, harvesting and season.</p>
      </div>
    </div>

    <div class="accordion info-accordion" id="cropAccordion">
      ${accordionItem("growth", "Growth Conditions", "bi-flower1", crop.growth, true)}
      ${accordionItem("climate", "Climate", "bi-cloud-sun", crop.climate)}
      ${accordionItem("soil", "Soil", "bi-layers", crop.soil)}
      ${accordionItem("fertilizers", "Fertilizers", "bi-moisture", crop.fertilizers)}
      ${accordionItem("irrigation", "Irrigation", "bi-droplet-half", crop.irrigation)}
      ${accordionItem("pests", "Pests & Diseases", "bi-bug", crop.pests)}
      ${accordionItem("harvesting", "Harvesting", "bi-basket", crop.harvesting)}
      ${accordionItem("season", "Season", "bi-calendar-range", crop.season)}
    </div>`;
}

function accordionItem(id, label, icon, text, open = false) {
  return `
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button ${open ? "" : "collapsed"}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${id}" aria-expanded="${open}">
          <i class="bi ${icon} me-2"></i> ${label}
        </button>
      </h2>
      <div id="collapse-${id}" class="accordion-collapse collapse ${open ? "show" : ""}" data-bs-parent="#cropAccordion">
        <div class="accordion-body">${text}</div>
      </div>
    </div>`;
}

function reobserveReveals() {
  const revealEls = document.querySelectorAll(".reveal:not(.in-view)");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("in-view"); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => observer.observe(el));
}
