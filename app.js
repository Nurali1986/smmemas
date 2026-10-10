const telegramPhone = "+998994428358";
// Lidlarni qabul qiladigan manzil (masalan, Formspree: "https://formspree.io/f/xxxxxxxx").
// Bo‘sh bo‘lsa, forma faqat Telegram’da tayyor xabarni ochadi.
const formEndpoint = "";
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
  menuButton.setAttribute("aria-label", isOpen ? menuButton.dataset.openLabel : menuButton.dataset.closeLabel);
  navigation.classList.toggle("is-open", !isOpen);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", menuButton.dataset.openLabel);
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
const formPrivacy = document.querySelector("#form-privacy");
const isRussian = document.documentElement.lang === "ru";

const formText = isRussian
  ? {
      greeting: "Здравствуйте! Хочу получить бесплатный пример (2 видео и 3 карусели) для нашей клиники.",
      name: "Имя и клиника",
      focus: "Направление",
      contact: "Контакт",
      privacy: "Заявка придёт нам напрямую. Мы свяжемся с вами в течение рабочего дня.",
      sending: "Отправляем…",
      sent: "Заявка отправлена. Мы свяжемся с вами в течение рабочего дня.",
      fallback: "Не удалось отправить заявку. Открыли готовое сообщение в Telegram — нажмите «Отправить».",
      opened: "Сообщение открыто в Telegram. Нажмите «Отправить».",
    }
  : {
      greeting: "Assalomu alaykum! Klinikamiz uchun bepul namuna (2 ta video va 3 ta karusel) so‘ramoqchiman.",
      name: "Ism va klinika",
      focus: "Yo‘nalish",
      contact: "Bog‘lanish uchun",
      privacy: "So‘rovingiz to‘g‘ridan-to‘g‘ri bizga keladi. Bir ish kuni ichida bog‘lanamiz.",
      sending: "Yuborilmoqda…",
      sent: "So‘rovingiz yuborildi. Bir ish kuni ichida bog‘lanamiz.",
      fallback: "So‘rovni yuborib bo‘lmadi. Tayyor xabar Telegram’da ochildi — Yuborish tugmasini bosing.",
      opened: "Xabar Telegram’da ochildi. Yuborish tugmasini bosing.",
    };

if (formEndpoint && formPrivacy) formPrivacy.textContent = formText.privacy;

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!leadForm.reportValidity()) return;

  const formData = new FormData(leadForm);
  const lead = {
    name: formData.get("name"),
    focus: formData.get("focus"),
    contact: formData.get("contact"),
    lang: isRussian ? "ru" : "uz",
  };
  const message = [
    formText.greeting,
    `${formText.name}: ${lead.name}`,
    `${formText.focus}: ${lead.focus}`,
    `${formText.contact}: ${lead.contact}`,
  ].join("\n");
  const openTelegram = () => {
    window.open(`https://t.me/${telegramPhone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  trackGoal("form_submit");

  if (!formEndpoint) {
    openTelegram();
    formStatus.textContent = formText.opened;
    return;
  }

  const submitButton = leadForm.querySelector('[type="submit"]');
  submitButton.disabled = true;
  formStatus.textContent = formText.sending;

  try {
    const response = await fetch(formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(lead),
    });
    if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
    leadForm.reset();
    formStatus.textContent = formText.sent;
  } catch (error) {
    openTelegram();
    formStatus.textContent = formText.fallback;
  } finally {
    submitButton.disabled = false;
  }
});
