const DEFAULT_API_URL = location.protocol === "file:" || location.port !== "5000"
  ? "http://localhost:5000/api"
  : `${location.origin}/api`;
const API_URL = localStorage.getItem("investme-api-url") || DEFAULT_API_URL;
let authToken = localStorage.getItem("investme-token") || "";
let currentUser = JSON.parse(localStorage.getItem("investme-user") || "null");
let currentCheckout = null;
let publicSettings = {};

const fallbackMentors = [
  { id: "maya-rao", name: "Maya Rao", designation: "Former Fintech CEO", experienceYears: 18, industry: "Fintech", expertise: ["Fundraising", "GTM", "Board strategy"], rating: 4.96, fee: 149, availability: "Available today", avatar: 2 },
  { id: "jun-park", name: "Jun Park", designation: "Angel Investor", experienceYears: 12, industry: "AI", expertise: ["AI products", "Pitch review", "MVP scope"], rating: 4.89, fee: 99, availability: "Available tomorrow", avatar: 3 },
  { id: "richard-hayes", name: "Richard Hayes", designation: "Retired Fortune 500 CFO", experienceYears: 31, industry: "B2B", expertise: ["Financial models", "Governance", "Debt strategy"], rating: 4.92, fee: 199, availability: "3 slots left", avatar: 6 }
];

const fallbackInvestors = [
  { id: "northline-angels", name: "Northline Angels", type: "Angel Syndicate", investmentInterests: "Fintech, SaaS, AI infrastructure", preferredSectors: ["B2B SaaS", "Payments", "RegTech"], ticketMin: 50000, ticketMax: 250000 },
  { id: "catalyst-seed-fund", name: "Catalyst Seed Fund", type: "Venture Capital", investmentInterests: "Climate, mobility, industrial software", preferredSectors: ["Climate", "Logistics", "Energy"], ticketMin: 500000, ticketMax: 2000000 },
  { id: "csuite-circle", name: "C-Suite Circle", type: "Executive Network", investmentInterests: "Retired executives advising B2B startups", preferredSectors: ["B2B", "Enterprise", "Consumer"], ticketMin: 25000, ticketMax: 150000 }
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
  setupMobileMenu();
  setupAuthForms();
  setupAuthStatus();
  setupNavVisibility();
  
  initCustomSelects();

  const isCheckout = document.querySelector("[data-checkout-summary]");
  if (isCheckout) {
    setupCheckout();
  } else {
    setupMentors();
    setupInvestors();
    setupPricing();
    setupDashboards();
    setupDashboardData();
    setupCommunityLinks();
    attachBookingButtons();
    attachPaymentButtons();
  }
  
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
  if (currentUser && currentUser.role === "ADMIN") {
    document.querySelectorAll("[data-admin-only]").forEach(el => el.style.display = "");
  }
}

function setupMobileMenu() {
  document.querySelector("[data-menu-toggle]")?.addEventListener("click", () => {
    document.querySelector(".nav-links")?.classList.toggle("open");
  });
}

function money(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function setupTheme() {
  const toggleBtn = document.querySelector("[data-theme-toggle]");
  if (!toggleBtn) return;
  const saved = localStorage.getItem("investme-theme");
  if (saved) document.documentElement.dataset.theme = saved;
  updateThemeIcon();
  toggleBtn.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme;
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("investme-theme", next);
    updateThemeIcon();
  });
}

function initCustomSelects() {
  document.querySelectorAll("select").forEach(select => {
    if (select.nextElementSibling && select.nextElementSibling.classList.contains("custom-select-wrapper")) return;
    
    select.style.display = "none";
    
    const wrapper = document.createElement("div");
    wrapper.className = "custom-select-wrapper";
    
    const trigger = document.createElement("div");
    trigger.className = "custom-select-trigger input";
    const selectedOption = select.options[select.selectedIndex];
    trigger.innerHTML = `<span>${selectedOption ? selectedOption.text : ""}</span><span class="chevron">▼</span>`;
    
    const optionsDiv = document.createElement("div");
    optionsDiv.className = "custom-select-options";
    
    Array.from(select.options).forEach(opt => {
      const optionEl = document.createElement("div");
      optionEl.className = "custom-option";
      if(opt.selected) optionEl.classList.add("selected");
      optionEl.textContent = opt.text;
      optionEl.dataset.value = opt.value;
      
      optionEl.addEventListener("click", () => {
        select.value = opt.value;
        trigger.querySelector("span").textContent = opt.text;
        
        optionsDiv.querySelectorAll(".custom-option").forEach(el => el.classList.remove("selected"));
        optionEl.classList.add("selected");
        
        wrapper.classList.remove("open");
        select.dispatchEvent(new Event("change"));
      });
      optionsDiv.appendChild(optionEl);
    });
    
    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsDiv);
    select.parentNode.insertBefore(wrapper, select.nextSibling);
    
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".custom-select-wrapper").forEach(w => {
        if(w !== wrapper) w.classList.remove("open");
      });
      wrapper.classList.toggle("open");
    });
  });
  
  document.addEventListener("click", () => {
    document.querySelectorAll(".custom-select-wrapper").forEach(w => w.classList.remove("open"));
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

  // Auth View Toggling
  document.querySelectorAll("[data-auth-toggle]").forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = e.target.dataset.authToggle; // login, signup, or forgot
      
      const views = ["login", "signup", "forgot"];
      views.forEach(view => {
        const el = document.getElementById(`view-${view}`);
        if (el) el.style.display = view === targetView ? "block" : "none";
      });
      if (output) output.textContent = "";
    });
  });

  document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
      } else {
        input.type = "password";
        btn.textContent = "👁";
      }
    });
  });

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

async function setupInvestors() {
  const grid = document.querySelector("[data-investor-grid]");
  if (!grid) return;
  let investors = fallbackInvestors;
  try {
    const data = await api("/investors");
    investors = data.investors;
  } catch {
    investors = fallbackInvestors;
  }
  grid.innerHTML = investors.map(investorCard).join("");
  attachBookingButtons();
}

function investorCard(investor) {
  const sectors = investor.preferredSectors || [];
  return `
    <article class="card">
      <span class="kicker">${investor.type}</span>
      <h3>${investor.name}</h3>
      <p>${investor.investmentInterests}</p>
      <div class="mentor-meta"><span>${money(investor.ticketMin)}</span><span>${money(investor.ticketMax)}</span></div>
      <ul class="tags">${sectors.map((item) => `<li class="tag">${item}</li>`).join("")}</ul>
      <button class="btn btn-primary" data-book data-title="Connect request to ${investor.name}" data-price="49" data-investor-id="${investor.id}">Connect Request</button>
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

async function setupDashboardData() {
  const unauthorizedPanel = document.getElementById("admin-unauthorized");
  const contentPanel = document.getElementById("admin-content");
  
  if (!unauthorizedPanel && !contentPanel) return;

  if (!currentUser || currentUser.role !== "ADMIN") {
    if (unauthorizedPanel) unauthorizedPanel.style.display = "block";
    if (contentPanel) contentPanel.style.display = "none";
    return;
  }
  
  if (unauthorizedPanel) unauthorizedPanel.style.display = "none";
  if (contentPanel) contentPanel.style.display = "block";

  try {
    const [overview, usersData] = await Promise.all([
      api("/admin/overview"),
      api("/admin/users")
    ]);

    const summary = document.querySelector("[data-admin-summary]");
    if (summary) {
      summary.innerHTML = `
        <div class="metric-card"><strong>${overview.users}</strong><span>Total Users</span></div>
        <div class="metric-card"><strong>${overview.mentors}</strong><span>Mentors</span></div>
        <div class="metric-card"><strong>${overview.bookings}</strong><span>Sessions</span></div>
        <div class="metric-card"><strong>${money(overview.revenue)}</strong><span>Revenue</span></div>
      `;
    }

    const integrations = document.querySelector("[data-admin-integrations]");
    if (integrations) {
      const ints = overview.integrations;
      integrations.innerHTML = `
        <li>Razorpay Gateway: ${ints.razorpayConfigured ? 'Active' : 'Missing Env'}</li>
        <li>Groq AI: ${ints.groqConfigured ? 'Active' : 'Missing Env'}</li>
        <li>WhatsApp Community: ${ints.whatsapp ? 'Configured' : 'Not Set'}</li>
        <li>Telegram Community: ${ints.telegram ? 'Configured' : 'Not Set'}</li>
      `;
    }

    const usersTable = document.querySelector("[data-admin-users]");
    if (usersTable) {
      usersTable.innerHTML = usersData.users.map(u => `
        <tr>
          <td><span class="kicker" style="font-size: 0.6rem;">${u.id.slice(0, 8)}...</span></td>
          <td style="font-weight: 600;">${u.name}</td>
          <td style="color: var(--muted);">${u.email}</td>
          <td><span class="tag">${u.role}</span></td>
          <td style="color: var(--muted); font-size: 0.85rem;">${new Date(u.createdAt).toLocaleDateString()}</td>
        </tr>
      `).join("");
    }
  } catch (error) {
    console.error("Failed to load admin data:", error);
  }
}

async function setupCommunityLinks() {
  const links = document.querySelectorAll("[data-community-url]");
  if (!links.length) return;
  try {
    const data = await api("/settings/public");
    publicSettings = data;
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
        
        if (data.payment.providerRef && publicSettings.razorpayKeyId && data.payment.gateway !== "RAZORPAY_DEMO") {
          output.textContent = "Opening Razorpay checkout...";
          
          if (!window.Razorpay) {
            await new Promise((resolve) => {
              const script = document.createElement("script");
              script.src = "https://checkout.razorpay.com/v1/checkout.js";
              script.onload = resolve;
              document.body.appendChild(script);
            });
          }
          
          const options = {
            key: publicSettings.razorpayKeyId,
            amount: Math.round(Number(data.payment.amount) * 100),
            currency: "INR",
            name: "InvestMe Premium",
            description: data.payment.description,
            order_id: data.payment.providerRef,
            handler: function (response) {
              output.textContent = `Payment successful! Payment ID: ${response.razorpay_payment_id}`;
              setTimeout(() => { location.reload(); }, 2000);
            },
            prefill: {
              name: currentUser.name,
              email: currentUser.email
            },
            theme: { color: "#6366f1" }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          output.textContent = `Demo checkout created: ${data.payment.providerRef}`;
        }
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
  if (apiText) apiText.textContent = authToken ? "Use Razorpay to create checkout." : "Login required before live checkout.";
  modal.classList.add("open");
}

function closeModal() {
  document.querySelector("[data-modal]")?.classList.remove("open");
}
