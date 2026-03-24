// MailJi Extension — Gmail Content Script
// White / Gmail-native theme · range selector · gold shine button

(function () {
  "use strict";

  const LOGO_URL   = "https://i.postimg.cc/SKnNLqRp/logo-black.png";
  const MASCOT_URL = "https://png.pngtree.com/png-vector/20220821/ourmid/pngtree-indian-man-with-turban-rajasthani-men-welcome-namaste-greetings-png-image_6119228.png";

  // Quick-pick range options
  const RANGE_PRESETS = [10, 20, 30, 50];

  // ── State ──────────────────────────────────────────────────────────────────
  let currentUser  = null;
  let emailsData   = [];
  let filterMode   = "all";
  let injected     = false;
  let selectedRange = 30;   // default

  // ── Wait for Gmail nav ─────────────────────────────────────────────────────
  function waitForGmail(cb) {
    const t = setInterval(() => {
      const nav = document.querySelector('[role="navigation"]') ||
                  document.querySelector(".aeN") ||
                  document.querySelector('[data-tooltip="Compose"]');
      if (nav) { clearInterval(t); setTimeout(cb, 900); }
    }, 500);
  }

  function getGmailSidebar() {
    return document.querySelector(".aeN") ||
           document.querySelector('[role="navigation"]') ||
           document.querySelector(".TK");
  }

  // ── Inject ─────────────────────────────────────────────────────────────────
  function createMailjiSection() {
    const sec = document.createElement("div");
    sec.id = "mailji-sidebar-section";
    sec.innerHTML = `
      <div class="mailji-nav-item mailji-header" id="mailji-nav-header">
        <img src="${LOGO_URL}" class="mailji-logo-img" alt="MailJi"
             onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">
        <span class="mailji-logo-icon">✦</span>
        <span class="mailji-chevron" id="mailji-chevron">▾</span>
      </div>
      <div class="mailji-panel" id="mailji-panel">
        <div id="mailji-content"></div>
      </div>
    `;
    sec.querySelector("#mailji-nav-header").addEventListener("click", togglePanel);
    return sec;
  }

  function injectIntoGmail() {
    if (injected && document.getElementById("mailji-sidebar-section")) return;
    const sidebar = getGmailSidebar();
    if (!sidebar) { setTimeout(injectIntoGmail, 1000); return; }
    const old = document.getElementById("mailji-sidebar-section");
    if (old) old.remove();
    const sec = createMailjiSection();
    sidebar.appendChild(sec);
    injected = true;
    initMailji();
  }

  function togglePanel() {
    const panel   = document.getElementById("mailji-panel");
    const chevron = document.getElementById("mailji-chevron");
    if (!panel) return;
    panel.classList.toggle("mailji-collapsed");
    chevron.textContent = panel.classList.contains("mailji-collapsed") ? "▸" : "▾";
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function initMailji() {
    renderLoading("Checking authentication…");
    chrome.runtime.sendMessage({ type: "GET_USER" }, (res) => {
      if (chrome.runtime.lastError) { renderError("Extension error. Reload Gmail."); return; }
      if (res && res.userId) { currentUser = res; loadEmails(0, selectedRange); }
      else { renderLogin(); }
    });
  }

  // ── Load emails ────────────────────────────────────────────────────────────
  function loadEmails(offset = 0, limit = selectedRange) {
    if (!currentUser) return;
    renderLoading(`Scanning ${limit} emails…`);

    // Skip cache if non-default range or offset > 0
    const useCache = offset === 0 && limit === selectedRange;

    if (useCache) {
      chrome.storage.local.get(["mailji_emails_cache", "mailji_cache_time", "mailji_cache_range"], (stored) => {
        const age = Date.now() - (stored.mailji_cache_time || 0);
        if (stored.mailji_emails_cache && age < 5 * 60 * 1000 && stored.mailji_cache_range === limit) {
          emailsData = stored.mailji_emails_cache;
          renderEmailList();
          return;
        }
        fetchFromBackend(offset, limit);
      });
    } else {
      fetchFromBackend(offset, limit);
    }
  }

  function fetchFromBackend(offset, limit) {
    chrome.runtime.sendMessage(
      { type: "FETCH_EMAILS", payload: { userId: currentUser.userId, limit, offset } },
      (res) => {
        if (!res || !res.success) {
          if (res?.error?.includes("401") || res?.error?.includes("Not authenticated")) {
            chrome.runtime.sendMessage({ type: "LOGOUT" }, () => { currentUser = null; renderLogin(); });
          } else {
            renderError(res?.error || "Failed to fetch emails.");
          }
          return;
        }
        if (offset > 0) {
          // Append for "load more"
          emailsData = [...emailsData, ...(res.data.emails || [])];
        } else {
          emailsData = res.data.emails || [];
        }
        chrome.storage.local.set({
          mailji_emails_cache: emailsData,
          mailji_cache_time: Date.now(),
          mailji_cache_range: limit,
        });
        renderEmailList();
      }
    );
  }

  // ── RENDER: Login ──────────────────────────────────────────────────────────
  function renderLogin() {
    setContent(`
      <div class="mailji-login-box">
        <div class="mailji-mascot-row">
          <div class="mailji-speech-bubble">Namaste! Inbox safe hai Ji!</div>
          <img src="${MASCOT_URL}" class="mailji-mascot-img" alt="MailJi mascot">
        </div>
        <div class="mailji-tagline">AI-powered spam detection,<br>right inside your Gmail, Ji.</div>
        <button class="mailji-btn mailji-btn-primary" id="mailji-login-btn">
          &nbsp;Sign in with Google
        </button>
      </div>
    `);
    document.getElementById("mailji-login-btn")?.addEventListener("click", handleLogin);
  }

  function handleLogin() {
    const btn = document.getElementById("mailji-login-btn");
    if (btn) { btn.disabled = true; btn.textContent = "Opening…"; }
    chrome.runtime.sendMessage({ type: "LOGIN" }, (res) => {
      if (!res || !res.success) { renderError(res?.error || "Login failed."); return; }
      currentUser = { userId: res.userId, userInfo: res.userInfo };
      loadEmails(0, selectedRange);
    });
  }

  // ── RENDER: Loading ────────────────────────────────────────────────────────
  function renderLoading(msg = "Loading…") {
    setContent(`
      <div class="mailji-loading">
        <div class="mailji-spinner"></div>
        <span>${msg}</span>
      </div>
    `);
  }

  // ── RENDER: Error ──────────────────────────────────────────────────────────
  function renderError(msg) {
    setContent(`
      <div class="mailji-error">
        <span>⚠ ${msg}</span>
        <button class="mailji-btn mailji-btn-ghost" id="mailji-retry-btn"
                style="font-size:9.5px;padding:5px 10px;width:auto;margin-top:2px">Retry</button>
      </div>
    `);
    document.getElementById("mailji-retry-btn")?.addEventListener("click", initMailji);
  }

  // ── RENDER: Range selector ─────────────────────────────────────────────────
  function renderRangeCard() {
    const pillsHtml = RANGE_PRESETS.map((n) =>
      `<button class="mailji-range-pill ${selectedRange === n ? 'active' : ''}" data-range="${n}">${n}</button>`
    ).join("");

    return `
      <div class="mailji-range-card">
        <div class="mailji-range-label">
          Scan range &nbsp;<span>${selectedRange} emails</span>
        </div>
        <div class="mailji-range-pills">${pillsHtml}</div>
        <div class="mailji-range-custom">
          <input
            type="number"
            class="mailji-range-input"
            id="mailji-range-input"
            min="1" max="100"
            placeholder="Custom (1–100)"
            value=""
          >
          <button class="mailji-scan-btn" id="mailji-scan-btn">Scan</button>
        </div>
      </div>
    `;
  }

  // Bind range card events (called after rendering)
  function bindRangeEvents() {
    // Preset pills
    document.querySelectorAll(".mailji-range-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        selectedRange = parseInt(pill.dataset.range, 10);
        chrome.storage.local.remove(["mailji_emails_cache", "mailji_cache_time", "mailji_cache_range"]);
        loadEmails(0, selectedRange);
      });
    });

    // Custom input + Scan button
    const scanBtn   = document.getElementById("mailji-scan-btn");
    const rangeInput = document.getElementById("mailji-range-input");

    scanBtn?.addEventListener("click", () => {
      const val = parseInt(rangeInput?.value, 10);
      if (val && val >= 1 && val <= 100) {
        selectedRange = val;
      }
      chrome.storage.local.remove(["mailji_emails_cache", "mailji_cache_time", "mailji_cache_range"]);
      loadEmails(0, selectedRange);
    });

    rangeInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") scanBtn?.click();
    });
  }

  // ── RENDER: Email list ─────────────────────────────────────────────────────
  function renderEmailList() {
    const spam    = emailsData.filter((e) => e.prediction === "spam");
    const ham     = emailsData.filter((e) => e.prediction === "ham");
    const spamPct = emailsData.length ? Math.round((spam.length / emailsData.length) * 100) : 0;
    const filtered = filterMode === "spam" ? spam : filterMode === "ham" ? ham : emailsData;

    const userEmail = currentUser?.userInfo?.email || "";
    const userName  = currentUser?.userInfo?.name || userEmail || "User";
    const initial   = userName[0].toUpperCase();

    setContent(`
      <!-- Logo strip -->
      

      <div class="mailji-rule"></div>

      <!-- User row -->
      <div class="mailji-user-row">
        <div class="mailji-user-avatar">${initial}</div>
        <span class="mailji-user-name" title="${userEmail}">${truncate(userEmail || userName, 22)}</span>
        <div class="mailji-user-actions">
          <button class="mailji-icon-btn" id="mailji-refresh-btn" title="Refresh">↻</button>
          <button class="mailji-icon-btn mailji-logout-btn" id="mailji-logout-btn" title="Logout">⏻</button>
        </div>
      </div>

      <!-- Range selector -->
      ${renderRangeCard()}

      <!-- Stats -->
      <div class="mailji-stats-row">
        <div class="mailji-stat mailji-stat-spam">
          <span class="mailji-stat-num">${spam.length}</span>
          <span class="mailji-stat-label">🚫 Spam</span>
        </div>
        <div class="mailji-stat-divider"></div>
        <div class="mailji-stat mailji-stat-ham">
          <span class="mailji-stat-num">${ham.length}</span>
          <span class="mailji-stat-label">✅ Ham</span>
        </div>
        <div class="mailji-stat-divider"></div>
        <div class="mailji-stat">
          <span class="mailji-stat-num" style="color:var(--mj-gold)">${spamPct}%</span>
          <span class="mailji-stat-label">Spam rate</span>
        </div>
      </div>

      <!-- Bar -->
      <div class="mailji-bar-wrap">
        <div class="mailji-bar-spam" style="width:${spamPct}%"></div>
      </div>

      <!-- Filter tabs -->
      <div class="mailji-tabs">
        <button class="mailji-tab ${filterMode==='all'  ? 'active':''}" data-filter="all">All (${emailsData.length})</button>
        <button class="mailji-tab ${filterMode==='spam' ? 'active':''}" data-filter="spam">Spam (${spam.length})</button>
        <button class="mailji-tab ${filterMode==='ham'  ? 'active':''}" data-filter="ham">Ham (${ham.length})</button>
      </div>

      <!-- Email rows -->
      <div class="mailji-email-list" id="mailji-email-list">
        ${filtered.length === 0
          ? `<div class="mailji-empty">Koi email nahi is category mein, Ji.</div>`
          : filtered.map(renderEmailRow).join("")}
      </div>

      <!-- Load more -->
      <button class="mailji-btn mailji-btn-ghost mailji-load-more" id="mailji-load-more">
        Load more →
      </button>
    `);

    // ── Bind all events ──────────────────────────────────────────────────────
    document.getElementById("mailji-refresh-btn")?.addEventListener("click", () => {
      chrome.storage.local.remove(["mailji_emails_cache", "mailji_cache_time", "mailji_cache_range"]);
      loadEmails(0, selectedRange);
    });

    document.getElementById("mailji-logout-btn")?.addEventListener("click", handleLogout);

    document.querySelectorAll(".mailji-tab").forEach((tab) => {
      tab.addEventListener("click", () => { filterMode = tab.dataset.filter; renderEmailList(); });
    });

    document.getElementById("mailji-load-more")?.addEventListener("click", () => {
      loadEmails(emailsData.length, selectedRange);
    });

    document.querySelectorAll(".mailji-email-row").forEach((row) => {
      row.addEventListener("click", () => {
        const detail = row.querySelector(".mailji-email-detail");
        if (detail) detail.classList.toggle("mailji-hidden");
        const link = row.dataset.gmailLink;
        if (link) window.open(link, "_self");
      });
    });

    bindRangeEvents();
  }

  // ── Render single email row ────────────────────────────────────────────────
  function renderEmailRow(email) {
    const isSpam  = email.prediction === "spam";
    const prob    = Math.round(email.probability * 100);
    const sender  = truncate(extractName(email.sender), 20);
    const subject = truncate(email.subject, 28);
    const words   = (email.explanation || []).slice(0, 3).join(" · ");
    const link    = `https://mail.google.com/mail/u/0/#inbox/${email.id}`;

    return `
      <div class="mailji-email-row ${isSpam ? 'mailji-spam' : 'mailji-ham'}"
           data-email-id="${email.id}" data-gmail-link="${link}">
        <div class="mailji-email-main">
          <span class="mailji-badge ${isSpam ? 'badge-spam' : 'badge-ham'}">
            ${isSpam ? "SPAM" : "HAM"}
          </span>
          <div class="mailji-email-info">
            <span class="mailji-email-sender">${sender}</span>
            <span class="mailji-email-subject">${subject}</span>
          </div>
          <span class="mailji-prob ${isSpam ? 'prob-spam' : 'prob-ham'}">${prob}%</span>
        </div>
        ${isSpam && words ? `
          <div class="mailji-email-detail mailji-hidden">
            <span class="mailji-explain-label">Flagged: </span>
            <span class="mailji-explain-words">${words}</span>
          </div>
        ` : ""}
      </div>
    `;
  }

  function handleLogout() {
    renderLoading("Logging out…");
    chrome.runtime.sendMessage({ type: "LOGOUT" }, () => {
      emailsData  = [];
      currentUser = null;
      chrome.storage.local.remove(["mailji_emails_cache", "mailji_cache_time", "mailji_cache_range"]);
      renderLogin();
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function setContent(html) {
    const el = document.getElementById("mailji-content");
    if (el) el.innerHTML = html;
  }

  function truncate(str, len) {
    if (!str) return "";
    return str.length > len ? str.slice(0, len) + "…" : str;
  }

  function extractName(sender) {
    const m = sender?.match(/^([^<]+)</);
    return m ? m[1].trim() : sender;
  }

  // ── Re-inject on Gmail SPA navigation ─────────────────────────────────────
  const observer = new MutationObserver(() => {
    if (!document.getElementById("mailji-sidebar-section")) {
      injected = false;
      injectIntoGmail();
    }
  });

  waitForGmail(() => {
    injectIntoGmail();
    observer.observe(document.body, { childList: true, subtree: false });
  });

  // ── Listen for login events from background ────────────────────────────────
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "USER_LOGGED_IN") {
      currentUser = { userId: message.userId, userInfo: message.userInfo };
      // Make sure the panel is visible and not collapsed
      const panel = document.getElementById("mailji-panel");
      if (panel) panel.classList.remove("mailji-collapsed");
      const chevron = document.getElementById("mailji-chevron");
      if (chevron) chevron.textContent = "▾";
      // Start loading emails immediately
      loadEmails(0, selectedRange);
    }
  });

})();
