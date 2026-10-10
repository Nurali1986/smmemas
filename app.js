const telegramPhone = "+998994428358";
const metrikaId = "";

const trackGoal = (goal) => {
  if (metrikaId && window.ym) window.ym(Number(metrikaId), "reachGoal", goal);
};

if (metrikaId) {
  window.ym = window.ym || function () {
    (window.ym.a = window.ym.a || []).push(arguments);
  };
  window.ym.l = Date.now();

  const metrikaScript = document.createElement("script");
  metrikaScript.async = true;
  metrikaScript.src = "https://mc.yandex.ru/metrika/tag.js";
  document.head.appendChild(metrikaScript);

  window.ym(Number(metrikaId), "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });
}

document.querySelectorAll('a[href="#taklif"], a[href="#aloqa"]').forEach((link) => {
  link.addEventListener("click", () => trackGoal("cta_click"));
});

document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
  link.addEventListener("click", () => trackGoal("phone_click"));
});

document.querySelectorAll('a[href^="https://t.me/"]').forEach((link) => {
  link.addEventListener("click", () => trackGoal("telegram_click"));
});

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Menyuni ochish" : "Menyuni yopish");
  navigation.classList.toggle("is-open", !isOpen);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Menyuni ochish");
    navigation.classList.remove("is-open");
  });
});

const sampleTabs = document.querySelectorAll(".sample-tab");
const sampleCards = document.querySelectorAll(".sample-card");

sampleTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const selectedFilter = tab.dataset.filter;

    sampleTabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-selected", String(isSelected));
    });

    sampleCards.forEach((card) => {
      card.hidden = selectedFilter !== "all" && card.dataset.kind !== selectedFilter;
    });
  });
});

const leadForm = document.querySelector("#lead-form");
const formStatus = document.querySelector("#form-status");

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!leadForm.reportValidity()) return;

  const formData = new FormData(leadForm);
  const message = [
    "Assalomu alaykum! Klinikamiz uchun 5 ta bepul namunani so‘ramoqchiman.",
    `Ism va klinika: ${formData.get("name")}`,
    `Yo‘nalish: ${formData.get("focus")}`,
    `Bog‘lanish uchun: ${formData.get("contact")}`,
  ].join("\n");
  const telegramUrl = `https://t.me/${telegramPhone}?text=${encodeURIComponent(message)}`;

  trackGoal("form_submit");
  window.open(telegramUrl, "_blank", "noopener,noreferrer");
  formStatus.textContent = "Xabar Telegram’da ochildi. Yuborish tugmasini bosing.";
});
