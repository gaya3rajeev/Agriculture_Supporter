/* =========================================================================
   auth.js — login & signup form handling
   Talks to the functions in data.js (agLogin / agSignup), which are
   already written as async calls so swapping in a real MySQL-backed
   API later only means editing data.js — not this file.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, skip straight to the dashboard
  if (typeof agGetSession === "function" && agGetSession()) {
    window.location.href = "dashboard.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msgBox = document.getElementById("loginMsg");
      const btn = loginForm.querySelector("button[type=submit]");
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      setLoading(btn, true, "Logging in...");
      hideMsg(msgBox);
      try {
        const user = await agLogin({ email, password });
        agSetSession(user);
        showMsg(msgBox, "success", "Welcome back! Redirecting to your dashboard...");
        setTimeout(() => window.location.href = "dashboard.html", 700);
      } catch (err) {
        showMsg(msgBox, "danger", err.message || "Login failed. Please try again.");
      } finally {
        setLoading(btn, false, "Log In");
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msgBox = document.getElementById("signupMsg");
      const btn = signupForm.querySelector("button[type=submit]");
      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value;
      const confirm = document.getElementById("signupConfirm").value;
      const farmType = document.getElementById("signupFarmType").value;

      hideMsg(msgBox);
      if (password !== confirm) {
        showMsg(msgBox, "danger", "Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        showMsg(msgBox, "danger", "Password must be at least 6 characters.");
        return;
      }

      setLoading(btn, true, "Creating account...");
      try {
        const user = await agSignup({ name, email, password, farmType });
        agSetSession(user);
        showMsg(msgBox, "success", "Account created! Redirecting to your dashboard...");
        setTimeout(() => window.location.href = "dashboard.html", 700);
      } catch (err) {
        showMsg(msgBox, "danger", err.message || "Signup failed. Please try again.");
      } finally {
        setLoading(btn, false, "Create Account");
      }
    });
  }

  // Tab switching keeps the URL hash in sync so a direct link can open either tab
  const hash = window.location.hash;
  if (hash === "#signup") {
    const tabTrigger = document.querySelector('[data-bs-target="#signupPane"]');
    if (tabTrigger) new bootstrap.Tab(tabTrigger).show();
  }
});

function setLoading(btn, isLoading, label) {
  btn.disabled = isLoading;
  btn.innerHTML = isLoading
    ? `<span class="spinner-border spinner-border-sm me-2"></span>${label}`
    : label;
}
function showMsg(box, type, text) {
  if (!box) return;
  box.className = `auth-msg alert alert-${type} d-block`;
  box.textContent = text;
}
function hideMsg(box) {
  if (!box) return;
  box.className = "auth-msg d-none";
  box.textContent = "";
}
