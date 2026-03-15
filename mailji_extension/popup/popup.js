// MailJi Popup Script — luxury dark gold theme

const BACKEND = "https://mailji.onrender.com";

const body       = document.getElementById("popup-body");
const statusDot  = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");

function setStatus(type, text) {
  statusDot.className = "status-dot " + (type || "");
  statusText.textContent = text;
}

// Re-render body while keeping the status row intact
function render(html) {
  const dotClass = statusDot.className;
  const dotText  = statusText.textContent;
  body.innerHTML = `
    <div class="status-row">
      <div class="status-dot ${dotClass.replace("status-dot ", "")}" id="status-dot"></div>
      <span id="status-text">${dotText}</span>
    </div>
    ${html}
  `;
}

async function checkBackend() {
  try {
    const res = await fetch(`${BACKEND}/model/status`, { signal: AbortSignal.timeout(35000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function init() {
  setStatus("orange", "Connecting to backend…");
  const backendUp = await checkBackend();

  if (!backendUp) {
    setStatus("red", "Backend offline");
    render(`
      <div class="hint">
        Cannot reach MailJi backend.<br>
        <code>${BACKEND}</code>
        Render free tier may need ~30s to wake up. Try again shortly.
      </div>
      <button class="btn btn-ghost" id="retry-btn">↺ Retry</button>
    `);
    document.getElementById("retry-btn")?.addEventListener("click", init);
    return;
  }

  setStatus("green", "Backend connected");

  chrome.runtime.sendMessage({ type: "GET_USER" }, (response) => {
    if (!response || !response.userId) {
      renderLoggedOut();
    } else {
      renderLoggedIn(response);
    }
  });
}

function renderLoggedOut() {
  render(`
    <div class="mascot-wrap">
      <div class="speech-bubble">Namaste! Inbox safe hai Ji!</div>
      <img
        src="https://png.pngtree.com/png-vector/20220821/ourmid/pngtree-indian-man-with-turban-rajasthani-men-welcome-namaste-greetings-png-image_6119228.png"
        class="mascot-img"
        alt="MailJi mascot"
      >
    </div>
    <div class="hint">Sign in to classify your Gmail inbox with AI.</div>
    <button class="btn btn-primary" id="login-btn">
      &nbsp;Sign in with Google
    </button>
  `);

  document.getElementById("login-btn")?.addEventListener("click", () => {
    const btn = document.getElementById("login-btn");
    btn.disabled = true;
    btn.textContent = "Opening…";

    chrome.runtime.sendMessage({ type: "LOGIN" }, (res) => {
      if (!res || !res.success) {
        setStatus("red", res?.error || "Login failed");
        renderLoggedOut();
      } else {
        init();
        chrome.tabs.query({ url: "https://mail.google.com/*" }, (tabs) => {
          if (tabs.length === 0) chrome.tabs.create({ url: "https://mail.google.com/" });
        });
      }
    });
  });
}

function renderLoggedIn(user) {
  const userInfo  = user.userInfo || {};
  const email     = userInfo.email || user.userId;
  const initial   = (userInfo.name || email || "M")[0].toUpperCase();

  chrome.storage.local.get(["mailji_emails_cache"], (stored) => {
    const emails    = stored.mailji_emails_cache || [];
    const spamCount = emails.filter((e) => e.prediction === "spam").length;
    const hamCount  = emails.filter((e) => e.prediction === "ham").length;

    const statsHtml = emails.length > 0 ? `
      <div class="stats-grid">
        <div class="stat-card spam">
          <span class="stat-num">${spamCount}</span>
          <div class="stat-label">🚫 Spam</div>
        </div>
        <div class="stat-card ham">
          <span class="stat-num">${hamCount}</span>
          <div class="stat-label">✅ Ham</div>
        </div>
      </div>
    ` : `<div class="hint">Open Gmail to scan your inbox, Ji.</div>`;

    render(`
      <div class="user-card">
        <div class="user-avatar">${initial}</div>
        <div class="user-email" title="${email}">${email}</div>
      </div>
      ${statsHtml}
      <div class="rule"></div>
      <button class="btn btn-primary" id="open-gmail-btn">Open Gmail</button>
      <button class="btn btn-ghost" id="refresh-btn">↻ &nbsp;Refresh Emails</button>
      <button class="btn btn-danger" id="logout-btn">Logout</button>
    `);

    document.getElementById("open-gmail-btn")?.addEventListener("click", () => {
      chrome.tabs.query({ url: "https://mail.google.com/*" }, (tabs) => {
        if (tabs.length > 0) chrome.tabs.update(tabs[0].id, { active: true });
        else chrome.tabs.create({ url: "https://mail.google.com/" });
      });
      window.close();
    });

    document.getElementById("refresh-btn")?.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "CLEAR_CACHE" }, () => {
        chrome.tabs.query({ url: "https://mail.google.com/*" }, (tabs) => {
          if (tabs.length > 0) chrome.tabs.reload(tabs[0].id);
        });
        window.close();
      });
    });

    document.getElementById("logout-btn")?.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "LOGOUT" }, () => {
        chrome.storage.local.remove(["mailji_emails_cache", "mailji_cache_time"]);
        init();
      });
    });
  });
}

init();
