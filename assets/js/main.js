/* =========================================================================
   main.js — shared behaviour across every page
   ========================================================================= */

// Scroll-triggered reveal animation using IntersectionObserver
document.addEventListener("DOMContentLoaded", () => {
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));
  }

  // Footer year
  document.querySelectorAll(".ag-year").forEach(el => el.textContent = new Date().getFullYear());

  // Highlight active nav link based on current section while scrolling (landing page only)
  const navLinks = document.querySelectorAll(".navbar-ag .nav-link[data-section]");
  if (navLinks.length) {
    const sections = [...navLinks].map(l => document.querySelector(l.getAttribute("href")));
    window.addEventListener("scroll", () => {
      let current = sections[0];
      sections.forEach(sec => {
        if (sec && window.scrollY + 120 >= sec.offsetTop) current = sec;
      });
      navLinks.forEach(l => {
        l.classList.toggle("active", document.querySelector(l.getAttribute("href")) === current);
      });
    });
  }

  // Contact form demo submit (landing page) — replace with a real POST to
  // /api/contact once a backend exists.
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector("button[type=submit]");
      const original = btn.innerHTML;
      btn.innerHTML = `<i class="bi bi-check2-circle"></i> Message sent`;
      btn.disabled = true;
      setTimeout(() => { btn.innerHTML = original; btn.disabled = false; contactForm.reset(); }, 2400);
    });
  }

  // Populate hero leaf particles at random horizontal offsets (landing page)
  document.querySelectorAll(".field-hero").forEach(hero => {
    const particles = hero.querySelectorAll(".leaf-particle");
    particles.forEach((p, i) => {
      p.style.left = (8 + i * 14 + Math.random() * 8) + "%";
      p.style.animationDelay = (i * 1.8) + "s";
    });
  });

  // Show a logged-in name + logout link in the navbar on authenticated pages
  const sessionSlot = document.getElementById("navSessionSlot");
  if (sessionSlot && typeof agGetSession === "function") {
    const user = agGetSession();
    if (user) {
      sessionSlot.innerHTML = `
        <span class="text-white-50 small me-2 d-none d-lg-inline">Hi, ${escapeHtml(user.name.split(" ")[0])}</span>
        <button class="btn btn-outline-linen btn-sm" id="logoutBtn"><i class="bi bi-box-arrow-right"></i> Log out</button>`;
      document.getElementById("logoutBtn").addEventListener("click", agLogout);
    }
  }
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
