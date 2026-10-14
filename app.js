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

  function showMessage(text, type) {
    message.textContent = text;
    message.className = "form-message " + type;
    message.hidden = false;
  }

  function responseMessage(status, body) {
    if (body && typeof body.message === "string" && body.message.trim()) {
      return body.message;
    }
    if (status === 404) return "404 — Could not find game code or session already started.";
    if (status === 400) return "400 — The API rejected the submitted fields.";
    if (status === 401 || status === 403) return status + " — The API denied this request.";
    if (status >= 500) return status + " — The server encountered an error.";
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
      submit.textContent = "Launching bots…";
    }

    try {
      // Generate a random client ID for this session
      const clientId = "client_" + Math.random().toString(36).substring(2, 11);

      // Construct form-urlencoded payload using the player's chosen inputs
      const payload = new URLSearchParams({
        pin: pin,
        amount: String(amount),
        name: nickname,
        clientId: clientId,
        recaptchaToken: "true"
      });

      const response = await fetch("https://kahootbot.net/api/init", {
        method: "POST",
        credentials: "omit",
        mode: "cors",
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: payload.toString()
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
      showMessage(body.message || "Request accepted successfully.", "success");
    } catch (error) {
      const isNetworkError = error instanceof TypeError;
      showMessage(
        isNetworkError
          ? "Network error: could not reach kahootbot.net. Check your connection or CORS restrictions."
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
