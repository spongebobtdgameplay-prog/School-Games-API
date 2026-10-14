(() => {
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

  const form = byId("preview-form");
  if (form) {
    const pin = byId("game-pin");
    const name = byId("nickname");
    const amount = byId("preview-count");
    const message = byId("form-message");
    const result = byId("preview-result");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      result.hidden = true;
      message.hidden = true;
      message.className = "form-message";

      const gamePin = pin.value.trim();
      const nickname = name.value.trim().replace(/\s+/g, " ");
      const count = Number(amount.value);

      if (!gamePin || !nickname) {
        message.textContent = "Enter both a game PIN and a display name.";
        message.classList.add("error");
        message.hidden = false;
        (!gamePin ? pin : name).focus();
        return;
      }
      if (!Number.isInteger(count) || count < 1 || count > 25) {
        message.textContent = "Amount must be a whole number between 1 and 25.";
        message.classList.add("error");
        message.hidden = false;
        amount.focus();
        return;
      }

      byId("result-pin").textContent = gamePin;
      byId("result-name").textContent = nickname;
      byId("result-count").textContent = String(count);
      result.hidden = false;
      message.textContent = "Your details passed local validation. This preview does not contact a game or add players.";
      message.classList.add("success");
      message.hidden = false;
    });

    [pin, name, amount].forEach((input) => input.addEventListener("input", () => {
      message.hidden = true;
      result.hidden = true;
    }));
  }

  const openLink = byId("open-kahoot");
  if (openLink) {
    openLink.addEventListener("click", () => {
      window.open("https://kahoot.it/", "_blank", "noopener,noreferrer");
    });
  }
})();