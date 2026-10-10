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

const packageSelect = document.querySelector("#clinic-package");

document.querySelectorAll("[data-package]").forEach((button) => {
  button.addEventListener("click", () => {
    if (packageSelect) packageSelect.value = button.dataset.package;
    trackGoal("package_click");
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
      package: "Пакет",
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
      package: "Paket",
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
    package: formData.get("package") || "",
    contact: formData.get("contact"),
    lang: isRussian ? "ru" : "uz",
  };
  const message = [
    formText.greeting,
    `${formText.name}: ${lead.name}`,
    `${formText.focus}: ${lead.focus}`,
    lead.package && `${formText.package}: ${lead.package}`,
    `${formText.contact}: ${lead.contact}`,
  ]
    .filter(Boolean)
    .join("\n");
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

// Skroll paytida bo‘limlarni silliq ko‘rsatish
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealGroups = [
    ".section-kicker",
    "main h2",
    ".problem-head p, .packages-head p",
    ".section-photo",
    ".problem-card",
    ".advantage-lead, .advantage-list article",
    ".tariff",
    ".offer-copy, .offer-includes",
    ".process-step",
    ".xcard",
    ".team-card, .team-note",
    ".faq-intro, .faq-list details",
    ".contact-copy > *:not(.section-kicker):not(h2), .lead-form",
  ];

  revealGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.closest(".hero")) return;
      element.classList.add("reveal");
      element.style.setProperty("--d", `${Math.min(index, 5) * 0.09}s`);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
  document.documentElement.classList.add("motion-ready");

  // Narxni 0 dan sanab chiqarish
  const priceElement = document.querySelector(".offer-count");
  const priceNode = priceElement && priceElement.firstChild;
  const priceMatch = priceNode && priceNode.nodeType === Node.TEXT_NODE && priceNode.textContent.match(/^(\D*)(\d+)$/);

  if (priceMatch) {
    const [, prefix, target] = priceMatch;
    const priceObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      priceObserver.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / 1400, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        priceNode.textContent = prefix + Math.round(Number(target) * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    priceObserver.observe(priceElement);
  }
}
