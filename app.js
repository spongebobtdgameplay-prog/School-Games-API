(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const year = byId("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  const sidebar = byId("sidebar");
  const menu = byId("mobile-menu");
  if (sidebar && menu) {
    menu.addEventListener("click", () => {
      const open = sidebar.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    sidebar.querySelectorAll("a[href^='#']").forEach((link) => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
      });
    });
  }

  const openLink = byId("open-kahoot");
  if (openLink) {
    openLink.addEventListener("click", () => {
      window.open("https://kahoot.it/", "_blank", "noopener,noreferrer");
    });
  }

  const form = byId("preview-form");
  if (!form) return;

  const pinInput = byId("game-pin");
  const nameInput = byId("nickname");
  const amountInput = byId("preview-count");
  const message = byId("form-message");
  const result = byId("preview-result");
  const submit = form.querySelector('button[type="submit"]');

  // Integration-test mode deliberately targets a local mock server by default.
  // Set window.SCHOOL_GAMES_API_BASE to your own test server before app.js loads.
  const apiBase = (window.SCHOOL_GAMES_API_BASE || "http://localhost:3001").replace(/\/$/, "");

  function showMessage(text, type) {
    message.textContent = text;
    message.className = "form-message " + type;
    message.hidden = false;
  }

  function responseMessage(status, body) {
    if (body && typeof body.message === "string" && body.message.trim()) {
      return body.message;
    }
    if (status === 404) return "404 — Could not find game code or user already exists.";
    if (status === 400) return "400 — The test API rejected the submitted fields.";
    if (status === 401 || status === 403) return status + " — The test API denied this request.";
    if (status >= 500) return status + " — The test API encountered a server error.";
    return "Request failed with HTTP " + status + ".";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    result.hidden = true;
    message.hidden = true;

    const pin = pinInput.value.trim();
    const nickname = nameInput.value.trim().replace(/\s+/g, " ");
    const amount = Number(amountInput.value);

    if (!pin || !nickname) {
      showMessage("Enter both a game PIN and a display name.", "error");
      (!pin ? pinInput : nameInput).focus();
      return;
    }
    if (!Number.isInteger(amount) || amount < 1 || amount > 25) {
      showMessage("Amount must be a whole number between 1 and 25.", "error");
      amountInput.focus();
      return;
    }

    const oldLabel = submit ? submit.textContent : "";
    if (submit) {
      submit.disabled = true;
      submit.textContent = "Testing connection…";
    }

    try {
      const response = await fetch(apiBase + "/api/session-check", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ pin, name: nickname, amount })
      });

      let body = {};
      const text = await response.text();
      if (text) {
        try { body = JSON.parse(text); }
        catch { body = { message: text.slice(0, 400) }; }
      }

      if (!response.ok) {
        showMessage(responseMessage(response.status, body), "error");
        return;
      }

      byId("result-pin").textContent = pin;
      byId("result-name").textContent = nickname;
      const count = byId("result-count");
      if (count) count.textContent = String(amount);
      result.hidden = false;
      showMessage(body.message || "The mock API accepted the request.", "success");
    } catch (error) {
      const isNetworkError = error instanceof TypeError;
      showMessage(
        isNetworkError
          ? "Network error: could not reach the local test API at " + apiBase + ". Start the mock server and check CORS settings."
          : "Request error: " + (error && error.message ? error.message : "Unknown error."),
        "error"
      );
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = oldLabel;
      }
    }
  });

  [pinInput, nameInput, amountInput].forEach((input) => {
    input.addEventListener("input", () => {
      message.hidden = true;
      result.hidden = true;
    });
  });
})();