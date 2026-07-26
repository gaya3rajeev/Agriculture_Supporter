/* =========================================================================
   animal-husbandry.js
   Handles three pages via presence of container elements:
     #animalCategoryGrid   -> animal-husbandry.html
     #animalItemGrid       -> animal-category.html?category=slug
     #animalDetailRoot     -> animal-details.html?animal=slug
   ========================================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  agRequireAuth();

  const categoryGrid = document.getElementById("animalCategoryGrid");
  if (categoryGrid) await renderAnimalCategories(categoryGrid);

  const itemGrid = document.getElementById("animalItemGrid");
  if (itemGrid) await renderAnimalsInCategory(itemGrid);

  const detailRoot = document.getElementById("animalDetailRoot");
  if (detailRoot) await renderAnimalDetail(detailRoot);
});

async function renderAnimalCategories(container) {
  const categories = await getAnimalCategories();
  container.innerHTML = categories.map((c, i) => `
    <div class="col-6 col-md-4 col-lg-3 reveal reveal-delay-${(i % 3) + 1}">
      <a class="leaf-card hub-card d-block" href="animal-category.html?category=${c.slug}" style="--card-a:${c.colorA};--card-b:${c.colorB}">
        <div class="leaf-visual">${c.icon}</div>
        <span class="tag">Category</span>
        <h3>${c.name}</h3>
        <p>${c.blurb}</p>
        <span class="go-link">Browse animals <i class="bi bi-arrow-right"></i></span>
      </a>
    </div>`).join("");
  reobserveReveals();
}

async function renderAnimalsInCategory(container) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("category");
  const category = await getAnimalCategoryBySlug(slug);
  const animals = await getAnimalsByCategory(slug);

  document.getElementById("catBannerTitle").textContent = category ? category.name : "Category";
  document.getElementById("catBannerBlurb").textContent = category ? category.blurb : "";
  document.getElementById("catCrumbCurrent").textContent = category ? category.name : "";

  if (!animals.length) {
    container.innerHTML = `<div class="col-12 text-center text-muted py-5">No animals found in this category yet.</div>`;
    return;
  }

  container.innerHTML = animals.map((a, i) => `
    <div class="col-6 col-md-4 col-lg-3 reveal reveal-delay-${(i % 3) + 1}">
      <a class="leaf-card d-block" href="animal-details.html?animal=${a.slug}" style="--card-a:${category?.colorA || '#D7E4D2'};--card-b:${category?.colorB || '#8FAE8B'}">
        <div class="leaf-visual">${a.icon}</div>
        <span class="tag">${category ? category.name : ""}</span>
        <h4>${a.name}</h4>
        <p>${a.care.slice(0, 70)}...</p>
        <span class="go-link">View details <i class="bi bi-arrow-right"></i></span>
      </a>
    </div>`).join("");
  reobserveReveals();
}

async function renderAnimalDetail(root) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("animal");
  const animal = await getAnimalBySlug(slug);

  if (!animal) {
    root.innerHTML = `<div class="text-center py-5"><h3>Animal not found</h3><a href="animal-husbandry.html" class="btn btn-wheat mt-3">Back to Animal Husbandry</a></div>`;
    return;
  }
  const category = await getAnimalCategoryBySlug(animal.categorySlug);

  document.getElementById("detailBreadCategory").textContent = category ? category.name : "";
  document.getElementById("detailBreadCategory").href = `animal-category.html?category=${animal.categorySlug}`;
  document.getElementById("detailTitle").textContent = animal.name;
  document.getElementById("detailCrumbCurrent").textContent = animal.name;
  document.title = `${animal.name} — Agriculture Supporter`;

  root.innerHTML = `
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="detail-hero-visual" style="--card-a:${category?.colorA || '#D7E4D2'};--card-b:${category?.colorB || '#8FAE8B'}">${animal.icon}</div>
      </div>
      <div class="col-md-8">
        <div class="row g-3">
          <div class="col-6 col-md-3"><div class="quick-fact"><i class="bi bi-tag"></i><div class="qf-label">Category</div><div class="qf-val">${category ? category.name : "—"}</div></div></div>
          <div class="col-6 col-md-3"><div class="quick-fact"><i class="bi bi-house-heart"></i><div class="qf-label">Housing type</div><div class="qf-val">See below</div></div></div>
          <div class="col-6 col-md-3"><div class="quick-fact"><i class="bi bi-shield-check"></i><div class="qf-label">Disease watch</div><div class="qf-val">See below</div></div></div>
          <div class="col-6 col-md-3"><div class="quick-fact"><i class="bi bi-graph-up-arrow"></i><div class="qf-label">Management</div><div class="qf-val">See below</div></div></div>
        </div>
        <p class="mt-4 text-muted">Complete husbandry guide for <strong>${animal.name}</strong> — expand each section below for care routines, feeding schedules, disease prevention, housing design, breeding notes, and general management practices.</p>
      </div>
    </div>

    <div class="accordion info-accordion" id="animalAccordion">
      ${accordionItem("care", "Care", "bi-heart-pulse", animal.care, true)}
      ${accordionItem("feeding", "Feeding", "bi-egg-fried", animal.feeding)}
      ${accordionItem("diseases", "Diseases & Prevention", "bi-shield-exclamation", animal.diseases)}
      ${accordionItem("housing", "Housing", "bi-house-door", animal.housing)}
      ${accordionItem("breeding", "Breeding", "bi-diagram-3", animal.breeding)}
      ${accordionItem("management", "Management", "bi-clipboard-check", animal.management)}
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
      <div id="collapse-${id}" class="accordion-collapse collapse ${open ? "show" : ""}" data-bs-parent="#animalAccordion">
        <div class="accordion-body">${text}</div>
      </div>
    </div>`;
}

function reobserveReveals() {
  // main.js's observer already ran on DOMContentLoaded before this async
  // content existed, so re-run the reveal logic for freshly injected cards.
  const revealEls = document.querySelectorAll(".reveal:not(.in-view)");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("in-view"); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => observer.observe(el));
}
