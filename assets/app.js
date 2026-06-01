const API_URL = localStorage.getItem("investme-api-url") || "http://localhost:5000/api";
let authToken = localStorage.getItem("investme-token") || "";
let currentUser = JSON.parse(localStorage.getItem("investme-user") || "null");
let currentCheckout = null;

const fallbackMentors = [
  { id: "maya-rao", name: "Maya Rao", designation: "Former Fintech CEO", experienceYears: 18, industry: "Fintech", expertise: ["Fundraising", "GTM", "Board strategy"], rating: 4.96, fee: 149, availability: "Available today", avatar: 2 },
  { id: "jun-park", name: "Jun Park", designation: "Angel Investor", experienceYears: 12, industry: "AI", expertise: ["AI products", "Pitch review", "MVP scope"], rating: 4.89, fee: 99, availability: "Available tomorrow", avatar: 3 },
  { id: "richard-hayes", name: "Richard Hayes", designation: "Retired Fortune 500 CFO", experienceYears: 31, industry: "B2B", expertise: ["Financial models", "Governance", "Debt strategy"], rating: 4.92, fee: 199, availability: "3 slots left", avatar: 6 }
];

const plans = {
  monthly: [
    { name: "Free", price: 0, items: ["Limited mentor access", "Community access", "Saved profiles"] },
    { name: "Pro Founder", price: 49, featured: true, items: ["Unlimited messaging", "Priority bookings", "Investor recommendations"] },
    { name: "Premium", price: 149, items: ["Dedicated mentorship", "Exclusive investor access", "Advanced AI tools"] }
  ],
  yearly: [
    { name: "Free", price: 0, items: ["Limited mentor access", "Community access", "Saved profiles"] },
    { name: "Pro Founder", price: 470, featured: true, items: ["Unlimited messaging", "Priority bookings", "Investor recommendations"] },
    { name: "Premium", price: 1430, items: ["Dedicated mentorship", "Exclusive investor access", "Advanced AI tools"] }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupTheme();
  setupApiStatus();
  setupAuthForms();
  setupAuthStatus();
  setupMentors();
  setupPricing();
  setupDashboards();
  setupCommunityLinks();
  attachBookingButtons();
  attachPaymentButtons();
  document.addEventListener("click", (event) => {
    if (event.target.matches("[data-modal-close]") || event.target.classList.contains("modal")) closeModal();
    if (event.target.matches("[data-logout]")) logout();
  });
});

function setupNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.getAttribute("href") === page) link.classList.add("active");
  });
  document.querySelector("[data-menu-toggle]")?.addEventListener("click", () => {
    document.querySelector(".nav-links")?.classList.toggle("open");
  });
}

function setupTheme() {
  const saved = localStorage.getItem("investme-theme");
  if (saved) document.documentElement.dataset.theme = saved;
  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("investme-theme", next);
  });
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API ${response.status}`);
  return data;
}

async function setupApiStatus() {
  const target = document.querySelector("[data-api-status]");
  if (!target) return;
  try {
    const data = await api("/health");
    target.textContent = `Backend connected: ${data.service}`;
  } catch {
    target.textContent = "Backend not running. Start backend with: cd backend && npm run dev";
  }
}

function saveSession(data) {
  authToken = data.token;
  currentUser = data.user;
  localStorage.setItem("investme-token", authToken);
  localStorage.setItem("investme-user", JSON.stringify(currentUser));
}

function logout() {
  authToken = "";
  currentUser = null;
  localStorage.removeItem("investme-token");
  localStorage.removeItem("investme-user");
  location.href = "login.html";
}

function setupAuthStatus() {
  document.querySelectorAll("[data-auth-label]").forEach((target) => {
    target.textContent = currentUser ? `${currentUser.name} (${currentUser.role})` : "Not logged in";
  });
}

function setupAuthForms() {
  const loginForm = document.querySelector("[data-login-form]");
  const signupForm = document.querySelector("[data-signup-form]");
  const output = document.querySelector("[data-auth-output]");

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const form = new FormData(loginForm);
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") })
      });
      saveSession(data);
      output.textContent = "Login successful. Redirecting...";
      location.href = "dashboard.html";
    } catch (error) {
      output.textContent = error.message;
    }
  });

  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const form = new FormData(signupForm);
      const data = await api("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          role: form.get("role"),
          startup: form.get("startup")
        })
      });
      saveSession(data);
      output.textContent = "Account created. Redirecting...";
      location.href = "dashboard.html";
    } catch (error) {
      output.textContent = error.message;
    }
  });
}

async function setupMentors() {
  const grid = document.querySelector("[data-mentor-grid]");
  if (!grid) return;
  let mentors = fallbackMentors;
  try {
    const data = await api("/mentors");
    mentors = data.mentors.map((mentor, index) => ({ ...mentor, avatar: (index % 6) + 1 }));
  } catch {
    mentors = fallbackMentors;
  }

  const render = () => {
    const industry = document.querySelector("[data-filter='industry']")?.value || "all";
    const price = document.querySelector("[data-filter='price']")?.value || "all";
    const filtered = mentors.filter((mentor) => {
      const industryOk = industry === "all" || mentor.industry === industry;
      const priceOk = price === "all" || (price === "under120" ? mentor.fee < 120 : mentor.fee >= 120);
      return industryOk && priceOk;
    });
    grid.innerHTML = filtered.map(mentorCard).join("") || "<div class='card'><h3>No mentor found</h3><p>Try another filter.</p></div>";
    attachBookingButtons();
  };
  document.querySelectorAll("[data-filter]").forEach((filter) => filter.addEventListener("change", render));
  render();
}

function mentorCard(mentor) {
  return `
    <article class="profile-card">
      <div class="mentor-top">
        <div class="avatar avatar-${mentor.avatar || 1}"></div>
        <div><span class="kicker">${mentor.availability}</span><h3>${mentor.name}</h3><p>${mentor.designation}</p></div>
      </div>
      <div class="mentor-meta"><span>${mentor.experienceYears} years</span><span>${mentor.industry}</span><span>Rating ${mentor.rating}</span><span>$${mentor.fee}</span></div>
      <ul class="tags">${mentor.expertise.map((item) => `<li class="tag">${item}</li>`).join("")}</ul>
      <div class="card-actions">
        <button class="btn btn-primary" data-book data-title="Video consultation with ${mentor.name}" data-price="${mentor.fee}" data-mentor-id="${mentor.id}" data-type="VIDEO">Book Call</button>
        <button class="btn btn-secondary" data-book data-title="Paid message to ${mentor.name}" data-price="29" data-mentor-id="${mentor.id}" data-type="MESSAGE">Message Now</button>
      </div>
    </article>
  `;
}

function setupPricing() {
  const grid = document.querySelector("[data-pricing-grid]");
  if (!grid) return;
  const render = (period) => {
    document.querySelectorAll("[data-billing]").forEach((button) => button.classList.toggle("active", button.dataset.billing === period));
    grid.innerHTML = plans[period].map((plan) => `
      <article class="price-card ${plan.featured ? "featured" : ""}">
        <span class="kicker">${plan.featured ? "Most chosen" : "Plan"}</span>
        <h3>${plan.name}</h3>
        <div class="price"><strong>$${plan.price}</strong><span>/${period === "monthly" ? "mo" : "yr"}</span></div>
        <ul class="check-list">${plan.items.map((item) => `<li>${item}</li>`).join("")}</ul>
        <button class="btn ${plan.featured ? "btn-primary" : "btn-secondary"}" data-book data-title="${plan.name} plan" data-price="${plan.price}" data-plan="${plan.name}">Choose Plan</button>
      </article>
    `).join("");
    attachBookingButtons();
  };
  document.querySelectorAll("[data-billing]").forEach((button) => button.addEventListener("click", () => render(button.dataset.billing)));
  render("monthly");
}

function setupDashboards() {
  document.querySelectorAll(".sidebar a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const id = link.getAttribute("href").slice(1);
      document.querySelectorAll(".sidebar a").forEach((item) => item.classList.toggle("active", item === link));
      document.querySelectorAll(".dash-panel").forEach((panel) => panel.classList.toggle("active", panel.id === id));
    });
  });
}

async function setupCommunityLinks() {
  const links = document.querySelectorAll("[data-community-url]");
  if (!links.length) return;
  try {
    const data = await api("/settings/public");
    links.forEach((link) => {
      const key = link.dataset.communityUrl;
      const url = data.communityLinks[key] || "#";
      if (data.requireCommunityLogin && !authToken) {
        link.href = "login.html";
        link.textContent = `Login to ${link.textContent}`;
      } else {
        link.href = url;
      }
    });
    const note = document.querySelector("[data-gate-note]");
    if (note) note.textContent = data.requireCommunityLogin ? "Login required before joining communities." : "Community links are loaded from backend .env settings.";
  } catch {
    links.forEach((link) => {
      if (!link.href || link.getAttribute("href") === "#") link.href = "login.html";
    });
  }
}

function attachBookingButtons() {
  document.querySelectorAll("[data-book]").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => openModal(button));
  });
}

function attachPaymentButtons() {
  document.querySelectorAll("[data-pay-gateway]").forEach((button) => {
    button.addEventListener("click", async () => {
      const output = document.querySelector("[data-payment-api-result]");
      if (!authToken) {
        output.textContent = "Please login first. Redirecting...";
        setTimeout(() => { location.href = "login.html"; }, 700);
        return;
      }
      try {
        output.textContent = "Creating checkout...";
        const data = await api("/payments/checkout", {
          method: "POST",
          body: JSON.stringify({ ...currentCheckout, gateway: button.dataset.payGateway })
        });
        output.textContent = data.payment.checkoutUrl
          ? `Checkout created. Open: ${data.payment.checkoutUrl}`
          : `Demo checkout created: ${data.payment.providerRef}`;
        if (data.payment.checkoutUrl) window.open(data.payment.checkoutUrl, "_blank", "noopener,noreferrer");
      } catch (error) {
        output.textContent = error.message;
      }
    });
  });
}

function openModal(button) {
  const modal = document.querySelector("[data-modal]");
  if (!modal) return;
  currentCheckout = {
    amount: Number(button.dataset.price || "0"),
    description: button.dataset.title || "InvestMe payment",
    mentorId: button.dataset.mentorId || "",
    type: button.dataset.type || "",
    plan: button.dataset.plan || ""
  };
  modal.querySelector("[data-modal-title]").textContent = currentCheckout.description;
  modal.querySelector("[data-modal-price]").textContent = `$${currentCheckout.amount}`;
  const apiText = modal.querySelector("[data-payment-api-result]");
  if (apiText) apiText.textContent = authToken ? "Choose Stripe or Razorpay to create checkout." : "Login required before live checkout.";
  modal.classList.add("open");
}

function closeModal() {
  document.querySelector("[data-modal]")?.classList.remove("open");
}
