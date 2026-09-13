/* =========================================================
   Mustang — main.js (FIXED v2)
   - Один writer на одно свойство
   - Parallax через [data-parallax-p] (CSS-переменные),
     float-иконки через Motion — на РАЗНЫХ элементах
   - Никаких filter:blur во входных анимациях
   - will-change только на время анимации
   - Reveal через один глобальный IntersectionObserver
   ========================================================= */

import {
  animate,
  stagger,
  inView,
} from "https://cdn.jsdelivr.net/npm/motion@10/+esm";

/* ============ Shared ============ */
const EASE = [0.16, 1, 0.3, 1];
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1];
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const IS_MOBILE = window.matchMedia("(max-width: 768px)").matches;
const IS_TOUCH = window.matchMedia("(hover: none)").matches;

/* ---------- Dropdown helpers ---------- */
const show = (menu, rotateEls = []) => {
  if (!menu) return;
  menu.classList.remove(
    "opacity-0",
    "scale-95",
    "-translate-y-1.5",
    "pointer-events-none",
  );
  menu.classList.add("opacity-100", "scale-100", "translate-y-0");
  rotateEls.forEach((el) => el && el.classList.add("rotate-180"));
};

const hide = (menu, rotateEls = []) => {
  if (!menu) return;
  menu.classList.add(
    "opacity-0",
    "scale-95",
    "-translate-y-1.5",
    "pointer-events-none",
  );
  menu.classList.remove("opacity-100", "scale-100", "translate-y-0");
  rotateEls.forEach((el) => el && el.classList.remove("rotate-180"));
};

/* ---------- Autoplay для видео ---------- */
const setupAutoplay = (video) => {
  if (!video) return;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");

  const tryPlay = () => {
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        const onFirst = () => {
          video.play().catch(() => {});
          window.removeEventListener("touchstart", onFirst);
          window.removeEventListener("click", onFirst);
          window.removeEventListener("scroll", onFirst);
        };
        window.addEventListener("touchstart", onFirst, {
          once: true,
          passive: true,
        });
        window.addEventListener("click", onFirst, { once: true });
        window.addEventListener("scroll", onFirst, {
          once: true,
          passive: true,
        });
      });
    }
  };
  tryPlay();
};

/* ---------- Параллакс через CSS-переменные ----------
   Пишет --px / --py. Элементы ДОЛЖНЫ иметь
   CSS-правило transform: translate3d(var(--px), var(--py), 0).
   См. [data-parallax-p] в index.css.
   Никогда не вызывать на элементах, которые двигает Motion. */
function attachMouseParallax(
  container,
  elements,
  { depthBase = 14, depthStep = 8 } = {},
) {
  if (!container || !elements.length || IS_TOUCH || REDUCED) return;

  let raf = null;
  let lastX = 0,
    lastY = 0;

  const update = () => {
    raf = null;
    const rect = container.getBoundingClientRect();
    const cx = lastX - (rect.left + rect.width / 2);
    const cy = lastY - (rect.top + rect.height / 2);

    elements.forEach((el, i) => {
      const d = depthBase + i * depthStep;
      el.style.setProperty("--px", `${(cx / rect.width) * d}px`);
      el.style.setProperty("--py", `${(cy / rect.height) * d}px`);
    });
  };

  container.addEventListener(
    "mousemove",
    (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(update);
    },
    { passive: true },
  );

  container.addEventListener("mouseleave", () => {
    elements.forEach((el) => {
      el.style.setProperty("--px", "0px");
      el.style.setProperty("--py", "0px");
    });
  });
}

/* =========================================================
   Boot
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------------------------------------
     1. NAVBAR — scroll shadow
     --------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  if (navbar) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrolled = window.scrollY > 8;
        navbar.classList.toggle("shadow-soft", scrolled);
        navbar.classList.toggle("border-gray-200", scrolled);
        navbar.classList.toggle("border-transparent", !scrolled);
        navbar.classList.toggle("scrolled", scrolled);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------
     2. NAVBAR — entrance
     --------------------------------------------------------- */
  const logo = document.querySelector('[data-nav="logo"]');
  if (logo && !REDUCED) {
    animate(
      logo,
      { opacity: [0, 1], x: [-10, 0] },
      { duration: 0.5, easing: EASE, delay: 0.05 },
    );
  }

  const links = document.querySelectorAll(".nav-link");
  if (links.length && !REDUCED) {
    animate(
      links,
      { opacity: [0, 1], y: [-8, 0] },
      { duration: 0.45, easing: EASE, delay: stagger(0.05, { start: 0.15 }) },
    );
  }

  const cta = document.getElementById("ctaBtn");
  cta?.addEventListener("click", () => {
    animate(cta, { scale: [1, 1.06, 1] }, { duration: 0.3, easing: EASE });
  });

  /* ---------------------------------------------------------
     3. DESKTOP DROPDOWN — Skooterlar
     --------------------------------------------------------- */
  const ddWrap = document.getElementById("dropdownScooters");
  const ddToggle = document.getElementById("dropdownToggle");
  const ddMenu = document.getElementById("dropdownMenu");
  const ddChevron = document.getElementById("chevron");
  let ddOpen = false;

  ddToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    ddOpen = !ddOpen;
    ddOpen ? show(ddMenu, [ddChevron]) : hide(ddMenu, [ddChevron]);
    ddToggle.setAttribute("aria-expanded", String(ddOpen));
  });

  /* ---------------------------------------------------------
     4. LANGUAGE switcher
     --------------------------------------------------------- */
  const langWrap = document.getElementById("lang");
  const langToggle = document.getElementById("langToggle");
  const langMenu = document.getElementById("langMenu");
  const langChevron = document.getElementById("langChevron");
  const langFlag = document.getElementById("langFlag");
  const langCode = document.getElementById("langCode");
  let langOpen = false;

  langToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    langOpen = !langOpen;
    langOpen ? show(langMenu, [langChevron]) : hide(langMenu, [langChevron]);
    langToggle.setAttribute("aria-expanded", String(langOpen));
  });

  const setLanguage = (lang, flag, code) => {
    if (langFlag) langFlag.textContent = flag;
    if (langCode) langCode.textContent = code;
    document.querySelectorAll(".lang-item").forEach((b) => {
      b.classList.toggle("bg-brand-yellowSoft", b.dataset.lang === lang);
    });
    try {
      localStorage.setItem("mustang.lang", lang);
    } catch (_) {}
  };

  document.querySelectorAll(".lang-item").forEach((item) => {
    item.addEventListener("click", () => {
      const { lang, flag, code } = item.dataset;
      setLanguage(lang, flag, code);
      hide(langMenu, [langChevron]);
      langOpen = false;
      langToggle?.setAttribute("aria-expanded", "false");
    });
  });

  try {
    const saved = localStorage.getItem("mustang.lang");
    if (saved) {
      const btn = document.querySelector(`.lang-item[data-lang="${saved}"]`);
      if (btn) setLanguage(saved, btn.dataset.flag, btn.dataset.code);
    }
  } catch (_) {}

  /* ---------------------------------------------------------
     5. CLOSE on outside click
     --------------------------------------------------------- */
  document.addEventListener("click", (e) => {
    if (ddOpen && ddWrap && !ddWrap.contains(e.target)) {
      hide(ddMenu, [ddChevron]);
      ddOpen = false;
      ddToggle?.setAttribute("aria-expanded", "false");
    }
    if (langOpen && langWrap && !langWrap.contains(e.target)) {
      hide(langMenu, [langChevron]);
      langOpen = false;
      langToggle?.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------------------------------------------------------
     6. SIDE PANEL (mobile)
     --------------------------------------------------------- */
  const burger = document.getElementById("burger");
  const overlay = document.getElementById("overlay");
  const sidePanel = document.getElementById("sidePanel");
  const closePanel = document.getElementById("closePanel");
  const burgerLines = burger?.querySelectorAll(".burger-line") || [];
  let panelOpen = false;

  const openSide = () => {
    if (!sidePanel || !overlay) return;
    panelOpen = true;
    sidePanel.classList.remove("translate-x-full");
    sidePanel.classList.add("translate-x-0");
    overlay.classList.remove("opacity-0", "pointer-events-none");
    overlay.classList.add("opacity-100");
    document.body.classList.add("no-scroll");
    burger?.setAttribute("aria-expanded", "true");

    if (burgerLines.length === 3) {
      burgerLines[0].style.transform = "translateY(7px) rotate(45deg)";
      burgerLines[1].style.opacity = "0";
      burgerLines[2].style.transform = "translateY(-7px) rotate(-45deg)";
    }
  };

  const closeSide = () => {
    if (!sidePanel || !overlay) return;
    panelOpen = false;
    sidePanel.classList.add("translate-x-full");
    sidePanel.classList.remove("translate-x-0");
    overlay.classList.add("opacity-0", "pointer-events-none");
    overlay.classList.remove("opacity-100");
    document.body.classList.remove("no-scroll");
    burger?.setAttribute("aria-expanded", "false");

    if (burgerLines.length === 3) {
      burgerLines[0].style.transform = "";
      burgerLines[1].style.opacity = "1";
      burgerLines[2].style.transform = "";
    }
  };

  burger?.addEventListener("click", () =>
    panelOpen ? closeSide() : openSide(),
  );
  closePanel?.addEventListener("click", closeSide);
  overlay?.addEventListener("click", closeSide);

  /* ---------------------------------------------------------
     7. MOBILE DROPDOWN
     --------------------------------------------------------- */
  const mToggle = document.getElementById("mobileDropdownToggle");
  const mMenu = document.getElementById("mobileDropdown");
  const mChevron = document.getElementById("mobileChevron");
  let mOpen = false;

  mToggle?.addEventListener("click", () => {
    if (!mMenu) return;
    mOpen = !mOpen;
    mMenu.style.maxHeight = mOpen ? mMenu.scrollHeight + "px" : "0px";
    mChevron?.classList.toggle("rotate-180", mOpen);
    mToggle.setAttribute("aria-expanded", String(mOpen));
  });

  /* ---------------------------------------------------------
     8. ESC — close all
     --------------------------------------------------------- */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (ddOpen) {
      hide(ddMenu, [ddChevron]);
      ddOpen = false;
    }
    if (langOpen) {
      hide(langMenu, [langChevron]);
      langOpen = false;
    }
    if (panelOpen) closeSide();
  });

  /* ---------------------------------------------------------
     9. RESIZE — auto close panel
     --------------------------------------------------------- */
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024 && panelOpen) closeSide();
  });

  /* ---------------------------------------------------------
     10. GLOBAL REVEAL — один observer на всю страницу
     --------------------------------------------------------- */
  if (!REDUCED) {
    const revealEls = document.querySelectorAll("[data-reveal]");
    if (revealEls.length) {
      const revealObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            revealObs.unobserve(el);

            const delayIdx = parseInt(el.dataset.delay || "0", 10);
            const delay = delayIdx * 0.08;

            el.style.willChange = "transform, opacity";
            animate(
              el,
              { opacity: [0, 1], y: [28, 0] },
              {
                duration: 0.7,
                easing: EASE_OUT_EXPO,
                delay,
                onComplete: () => {
                  el.style.willChange = "";
                },
              },
            );
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );
      revealEls.forEach((el) => revealObs.observe(el));
    }
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  /* ---------------------------------------------------------
     11. COUNTERS
     --------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length) {
    const fmt = new Intl.NumberFormat("en-US");
    let countersDone = false;

    const counterObs = new IntersectionObserver(
      (entries) => {
        if (countersDone) return;
        if (!entries.some((e) => e.isIntersecting)) return;
        countersDone = true;
        counterObs.disconnect();

        counters.forEach((el, i) => {
          const target = parseFloat(el.dataset.counter) || 0;
          const suffix = el.dataset.suffix || "";
          const duration = 1400;
          const start = performance.now() + i * 180;

          const tick = (now) => {
            const t = Math.max(0, now - start);
            const p = Math.min(t / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt.format(Math.floor(eased * target)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 },
    );
    counters.forEach((el) => counterObs.observe(el));
  }

  /* ---------------------------------------------------------
     12. HERO — оркестрованный вход + видео
     ---------------------------------------------------------
     ВАЖНО: [data-float] анимируется ТОЛЬКО здесь (Motion).
     Мышиный parallax для них — на обёртке [data-parallax-p].
     --------------------------------------------------------- */
  const hero = document.getElementById("hero");
  const heroVideo = document.querySelector("[data-hero-video]");

  if (heroVideo) {
    heroVideo.playbackRate = 0.95;
    setupAutoplay(heroVideo);

    if (hero) {
      const heroObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) heroVideo.pause();
            else heroVideo.play().catch(() => {});
          });
        },
        { threshold: 0.1 },
      );
      heroObs.observe(hero);
    }
  }

  if (hero && !REDUCED) {
    const badge = hero.querySelector('[data-hero="badge"]');
    const words = hero.querySelectorAll("[data-word]");
    const subtitle = hero.querySelector('[data-hero="subtitle"]');
    const actions = hero.querySelector('[data-hero="actions"]');
    const stats = hero.querySelector('[data-hero="stats"]');
    const card = hero.querySelector('[data-hero="card"]');
    const features = hero.querySelectorAll("[data-hero-feature]");
    const floaters = hero.querySelectorAll("[data-float]");
    const pulse = hero.querySelector("[data-pulse]");

    /* badge */
    if (badge) {
      animate(
        badge,
        { opacity: [0, 1], y: [16, 0] },
        { duration: 0.55, easing: EASE, delay: 0.1 },
      );
    }

    /* words — БЕЗ filter blur */
    if (words.length) {
      words.forEach((el) => (el.style.willChange = "transform, opacity"));
      animate(
        words,
        { opacity: [0, 1], y: [36, 0] },
        {
          duration: 0.85,
          easing: EASE_OUT_EXPO,
          delay: stagger(0.14, { start: 0.28 }),
          onComplete: () => {
            words.forEach((el) => {
              el.style.willChange = "";
              // вернуть text-shadow только после входной анимации
              const shadow = el.dataset.shadowAfter;
              if (shadow) el.style.textShadow = shadow;
            });
          },
        },
      );
    }

    /* subtitle */
    if (subtitle) {
      animate(
        subtitle,
        { opacity: [0, 1], y: [20, 0] },
        { duration: 0.7, easing: EASE, delay: 0.7 },
      );
    }

    /* actions */
    if (actions) {
      animate(
        actions,
        { opacity: [0, 1], y: [20, 0] },
        { duration: 0.7, easing: EASE, delay: 0.85 },
      );
    }

    /* stats */
    if (stats) {
      animate(
        stats,
        { opacity: [0, 1], y: [16, 0] },
        { duration: 0.7, easing: EASE, delay: 1.0 },
      );
    }

    /* card */
    if (card) {
      animate(
        card,
        { opacity: [0, 1], x: [40, 0] },
        { duration: 0.9, easing: EASE, delay: 0.45 },
      );
    }

    /* features */
    if (features.length) {
      animate(
        features,
        { opacity: [0, 1], x: [16, 0] },
        { duration: 0.55, easing: EASE, delay: stagger(0.1, { start: 0.9 }) },
      );
    }

    /* floaters: вход + бесконечный float.
       Transform полностью под контролем Motion.
       Никаких --px/--py на этих элементах — parallax идёт на родителе. */
    const floatPaths = [
      { y: [0, -14, 0], rotate: [0, 5, 0] },
      { y: [0, -10, 0], rotate: [0, -4, 0] },
      { y: [0, -12, 0], rotate: [0, 3, 0] },
    ];
    floaters.forEach((el, i) => {
      animate(
        el,
        { opacity: [0, 1], scale: [0.6, 1] },
        { duration: 0.7, easing: EASE, delay: 0.55 + i * 0.12 },
      );

      animate(el, floatPaths[i % floatPaths.length], {
        duration: 6 + i * 0.4,
        delay: 1.3 + i * 0.2,
        repeat: Infinity,
        easing: "ease-in-out",
      });
    });

    /* pulse */
    if (pulse) {
      animate(
        pulse,
        { scale: [1, 1.6, 1], opacity: [1, 0.5, 1] },
        { duration: 1.8, repeat: Infinity, easing: "ease-in-out" },
      );
    }

    /* CTA tap */
    const heroCta = document.getElementById("heroPrimaryCta");
    heroCta?.addEventListener("click", () => {
      animate(
        heroCta,
        { scale: [1, 1.05, 1] },
        { duration: 0.3, easing: EASE },
      );
    });

    /* Клик по h1 — маленький pulse, без дублей и без color-анимации */
    const h1 = hero.querySelector("h1");
    if (h1) {
      h1.addEventListener("click", () => {
        animate(h1, { scale: [1, 1.04, 1] }, { duration: 0.5, easing: EASE });
      });
    }
  }

  /* ---------------------------------------------------------
     13. HERO — mouse parallax через обёртки [data-parallax-p]
     ---------------------------------------------------------
     В HTML иконки должны быть обёрнуты в <div data-parallax-p>.
     Здесь мы двигаем ОБЁРТКИ, а не сами [data-float].
     --------------------------------------------------------- */
  if (hero) {
    const layers = hero.querySelectorAll("[data-parallax-p]");
    if (layers.length) {
      attachMouseParallax(hero, layers, { depthBase: 14, depthStep: 8 });
    }
  }

  /* ---------------------------------------------------------
     14. ABOUT — параллакс иконок коллажа (через --px/--py)
     ---------------------------------------------------------
     Иконки внутри коллажа НЕ анимируются Motion бесконечно,
     поэтому можно оставить parallax прямо на них.
     Но для чистоты — оборачивайте их в [data-parallax-p].
     --------------------------------------------------------- */
  const collage = document.querySelector("#about .lg\\:col-span-3");
  const collageIcons = collage
    ? collage.querySelectorAll("[data-parallax-p]")
    : [];
  if (collage && collageIcons.length) {
    attachMouseParallax(collage, collageIcons, { depthBase: 10, depthStep: 8 });
  }

  /* ---------------------------------------------------------
     15. SCROLL PARALLAX для видео и фонов
     --------------------------------------------------------- */
  const pxEls = Array.from(document.querySelectorAll("[data-parallax]"));
  if (pxEls.length && !REDUCED) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;

      for (let i = 0; i < pxEls.length; i++) {
        const el = pxEls[i];
        const speed = parseFloat(el.dataset.parallax) || 0;
        const rect = el.getBoundingClientRect();

        if (rect.bottom < -150 || rect.top > vh + 150) {
          if (el.style.willChange) el.style.willChange = "";
          continue;
        }

        if (!el.style.willChange) el.style.willChange = "transform";

        const offset = rect.top + rect.height / 2 - vh / 2;
        const y = -offset * speed;
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ---------------------------------------------------------
     16. BACKGROUND VIDEO (shartnoma)
     --------------------------------------------------------- */
  const bgVideo = document.querySelector("[data-bg-video]");
  if (bgVideo) {
    setupAutoplay(bgVideo);
    const bgSection = bgVideo.closest("section");
    if (bgSection) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) bgVideo.pause();
            else bgVideo.play().catch(() => {});
          });
        },
        { threshold: 0.1 },
      );
      obs.observe(bgSection);
    }
  }

  /* ---------------------------------------------------------
     17. CONTACT VIDEO
     --------------------------------------------------------- */
  const contactVideo = document.querySelector("[data-contact-video]");
  if (contactVideo) {
    setupAutoplay(contactVideo);
    const contactSection = contactVideo.closest("section");
    if (contactSection) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) contactVideo.pause();
            else contactVideo.play().catch(() => {});
          });
        },
        { threshold: 0.1 },
      );
      obs.observe(contactSection);
    }
  }

  /* ---------------------------------------------------------
     18. VIDEOS — visibilitychange
     --------------------------------------------------------- */
  const allVideos = document.querySelectorAll(
    "video[data-hero-video], video[data-bg-video], video[data-contact-video], video[data-collage-video]",
  );
  if (allVideos.length) {
    document.addEventListener("visibilitychange", () => {
      allVideos.forEach((v) => {
        if (document.hidden) v.pause();
        else v.play().catch(() => {});
      });
    });
  }

  /* ---------------------------------------------------------
     19. CTA-кнопки — tap-анимация
     --------------------------------------------------------- */
  ["howCtaBtn", "benefitsCtaBtn", "docDownloadBtn", "mapOpenBtn"].forEach(
    (id) => {
      const el = document.getElementById(id);
      el?.addEventListener("click", () => {
        animate(el, { scale: [1, 1.05, 1] }, { duration: 0.3, easing: EASE });
      });
    },
  );

  /* ---------------------------------------------------------
     20. LEAD FORM
     --------------------------------------------------------- */
  const leadForm = document.getElementById("leadForm");
  if (leadForm) {
    const phoneInput = document.getElementById("phone");
    const applyMask = (value, mask) => {
      const digits = value.replace(/\D/g, "");
      let result = "";
      let di = 0;
      for (let i = 0; i < mask.length && di < digits.length; i++) {
        const ch = mask[i];
        if (ch === "#") result += digits[di++];
        else result += ch;
      }
      return result;
    };

    if (phoneInput) {
      phoneInput.dataset.mask = "+998 ## ### ## ##";
      phoneInput.addEventListener("input", (e) => {
        const mask = phoneInput.dataset.mask || "+998 ## ### ## ##";
        e.target.value = applyMask(e.target.value, mask);
      });
      phoneInput.addEventListener("focus", (e) => {
        if (!e.target.value) e.target.value = "+998 ";
      });
    }

    const showError = (name, msg) => {
      const errEl = document.querySelector(`[data-error="${name}"]`);
      if (!errEl) return;
      errEl.textContent = msg;
      errEl.classList.toggle("hidden", !msg);
    };

    const getCSRFToken = () => {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="));
      return cookie ? cookie.split("=")[1] : "";
    };

    leadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const firstEl = document.getElementById("firstName");
      const first = firstEl ? firstEl.value.trim() : "";
      let ok = true;

      if (first.length < 2) {
        showError("firstName", "Ismingizni kiriting (kamida 2 harf)");
        ok = false;
      } else showError("firstName", "");

      if (phoneInput) {
        const digits = phoneInput.value.replace(/\D/g, "");
        if (digits.length < 12) {
          showError("phone", "Telefon raqamni to‘liq kiriting");
          ok = false;
        } else showError("phone", "");
      }

      if (!ok) return;

      const submitBtn = document.getElementById("submitBtn");
      const status = document.getElementById("formStatus");
      if (!submitBtn || !status) return;

      const btnText = submitBtn.querySelector("span");
      const originalText = btnText ? btnText.textContent : "";

      submitBtn.disabled = true;
      if (btnText) btnText.textContent = "Yuborilmoqda...";
      status.className = "hidden";

      try {
        const res = await fetch(leadForm.action || window.location.pathname, {
          method: "POST",
          headers: {
            "X-CSRFToken": getCSRFToken(),
            "X-Requested-With": "XMLHttpRequest",
          },
          body: new FormData(leadForm),
        });

        if (!res.ok) throw new Error("Server error");

        status.textContent = "✅ Rahmat! Tez orada siz bilan bog‘lanamiz.";
        status.className =
          "rounded-2xl px-5 py-4 text-sm font-medium bg-green-50 text-green-700 border border-green-200";
        leadForm.reset();
        if (phoneInput) phoneInput.value = "+998 ";
        animate(
          submitBtn,
          { scale: [1, 1.05, 1] },
          { duration: 0.3, easing: EASE },
        );
      } catch (err) {
        status.textContent =
          "❌ Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring.";
        status.className =
          "rounded-2xl px-5 py-4 text-sm font-medium bg-red-50 text-red-700 border border-red-200";
      } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = originalText;
      }
    });
  }

  /* ---------------------------------------------------------
     21. INSTAGRAM SCROLL VIDEOS
     --------------------------------------------------------- */
  const instaSection = document.getElementById("insta-scroll");
  if (instaSection) {
    const track = instaSection.querySelector("[data-insta-track]");
    const videos = Array.from(
      instaSection.querySelectorAll("[data-insta-video]"),
    );
    const fills = Array.from(
      instaSection.querySelectorAll("[data-insta-fill]"),
    );
    const poster = instaSection.querySelector("[data-insta-poster]");
    const startBtn = document.getElementById("instaStartBtn");
    const soundBtns = [
      document.getElementById("instaSoundToggleDesktop"),
      document.getElementById("instaSoundToggleMobile"),
    ].filter(Boolean);
    const soundIcons = instaSection.querySelectorAll("[data-insta-sound-icon]");
    const soundLabels = instaSection.querySelectorAll(
      "[data-insta-sound-label]",
    );

    if (track && videos.length === 3) {
      let started = false;
      let current = 0;
      let userMuted = false;
      let soundUnlocked = false;

      videos.forEach((v) => {
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute("playsinline", "");
        v.pause();
      });

      const applySoundUI = () => {
        soundIcons.forEach((ic) => {
          ic.className = userMuted
            ? "fa-solid fa-volume-xmark"
            : "fa-solid fa-volume-high";
        });
        soundLabels.forEach((lb) => {
          lb.textContent = userMuted ? "Ovoz o‘chiq" : "Ovoz yoniq";
        });
        soundBtns.forEach((b) => (b.dataset.muted = String(userMuted)));
      };

      const applySoundToVideos = () => {
        videos.forEach((v) => {
          v.muted = userMuted;
        });
      };

      const setActive = (idx) => {
        if (idx === current && videos[idx].classList.contains("opacity-100"))
          return;
        current = idx;

        videos.forEach((v, i) => {
          if (i === idx) {
            v.classList.remove("opacity-0");
            v.classList.add("opacity-100");
            if (started) v.play().catch(() => {});
          } else {
            v.classList.add("opacity-0");
            v.classList.remove("opacity-100");
            if (!v.paused) v.pause();
          }
        });
      };

      const start = () => {
        if (started) return;
        started = true;
        soundUnlocked = true;
        userMuted = false;
        applySoundUI();
        applySoundToVideos();

        if (poster) {
          poster.classList.add("opacity-0", "pointer-events-none");
          setTimeout(() => {
            poster.style.display = "none";
          }, 500);
        }

        videos[current].play().catch(() => {
          videos[current].muted = true;
          videos[current].play().catch(() => {});
        });
      };

      startBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        start();
      });

      soundBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!started) {
            start();
            return;
          }
          userMuted = !userMuted;
          soundUnlocked = true;
          applySoundUI();
          applySoundToVideos();
          const v = videos[current];
          if (v) {
            if (!userMuted) {
              v.muted = false;
              v.play().catch(() => {});
            }
          }
        });
      });

      const unlockSound = () => {
        if (!started || soundUnlocked) return;
        soundUnlocked = true;
        if (!userMuted) {
          applySoundToVideos();
          videos[current].play().catch(() => {});
        }
      };
      ["scroll", "wheel", "touchstart", "keydown"].forEach((ev) => {
        window.addEventListener(ev, unlockSound, { once: true, passive: true });
      });

      applySoundUI();

      let ticking = false;
      const update = () => {
        ticking = false;
        const rect = track.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = rect.height - vh;
        if (total <= 0) return;

        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        const progress = scrolled / total;

        const seg = Math.min(2, Math.floor(progress * 3));
        setActive(seg);

        const segSize = 1 / 3;
        fills.forEach((fill, i) => {
          const local = Math.min(
            Math.max((progress - i * segSize) / segSize, 0),
            1,
          );
          fill.style.width = (local * 100).toFixed(1) + "%";
        });
      };

      const onScroll = () => {
        if (!started) return;
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });

      instaSection.querySelectorAll("[data-insta-dot]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!started) start();
          const i = parseInt(btn.dataset.instaDot, 10);
          const rect = track.getBoundingClientRect();
          const vh = window.innerHeight;
          const total = rect.height - vh;
          const top = window.scrollY + rect.top;
          const target = top + total * (i / 3 + 0.05);
          window.scrollTo({ top: target, behavior: "smooth" });
        });
      });

      const visObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              videos.forEach((v) => {
                if (!v.paused) v.pause();
              });
            } else if (started) {
              videos[current].play().catch(() => {});
            }
          });
        },
        { threshold: 0.05 },
      );
      visObs.observe(instaSection);

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          videos.forEach((v) => v.pause());
        } else if (started) {
          videos[current].play().catch(() => {});
        }
      });

      setActive(0);
    }
  }
  /* ---------------------------------------------------------
     22. VIDEO REVIEWS — карусель + автоплей + звук
     - Все видео изначально muted и paused
     - Играет только активное (в центре)
     - Кнопка звука: включает звук ТОЛЬКО у активного,
       остальные остаются muted
     --------------------------------------------------------- */
  const revSection = document.getElementById("reviews");
  if (revSection) {
    const track = document.getElementById("revTrack");
    const cards = Array.from(revSection.querySelectorAll(".rev-card"));
    const dotsWrap = document.getElementById("revDots");
    const prevBtn = document.getElementById("revPrev");
    const nextBtn = document.getElementById("revNext");

    if (track && cards.length) {
      // Инициализация: все paused, muted
      cards.forEach((card) => {
        const v = card.querySelector("[data-rev-video]");
        if (!v) return;
        v.muted = true;
        v.pause();
        v.playsInline = true;
        v.setAttribute("playsinline", "");
      });

      // Определяем индекс карточки ближе всего к центру трека
      const getCenterIndex = () => {
        const trackRect = track.getBoundingClientRect();
        const trackCenter = trackRect.left + trackRect.width / 2;
        let bestIdx = 0;
        let bestDist = Infinity;
        cards.forEach((card, i) => {
          const r = card.getBoundingClientRect();
          const c = r.left + r.width / 2;
          const d = Math.abs(c - trackCenter);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
          }
        });
        return bestIdx;
      };

      // Активное видео — играет. Остальные — пауза.
      const activate = (idx) => {
        cards.forEach((card, i) => {
          const v = card.querySelector("[data-rev-video]");
          const playIcon = card.querySelector("[data-rev-play]");
          if (!v) return;

          if (i === idx) {
            const p = v.play();
            if (p && p.catch) p.catch(() => {});
            if (playIcon) playIcon.style.opacity = "0";
          } else {
            if (!v.paused) v.pause();
            if (playIcon) playIcon.style.opacity = "1";
            // Не сбрасываем currentTime — чтобы не мигало
          }
        });

        // Точки
        if (dotsWrap) {
          Array.from(dotsWrap.children).forEach((d, i) => {
            d.classList.toggle("is-active", i === idx);
          });
        }
      };

      // Точки — создать
      if (dotsWrap) {
        cards.forEach((_, i) => {
          const b = document.createElement("button");
          b.className = "rev-dot";
          b.setAttribute("aria-label", "Slayd " + (i + 1));
          b.addEventListener("click", () => {
            cards[i].scrollIntoView({
              behavior: "smooth",
              inline: "center",
              block: "nearest",
            });
          });
          dotsWrap.appendChild(b);
        });
      }

      // Скролл трека — обновляем активное видео (throttled)
      let revTicking = false;
      const onRevScroll = () => {
        if (revTicking) return;
        revTicking = true;
        requestAnimationFrame(() => {
          revTicking = false;
          activate(getCenterIndex());
        });
      };
      track.addEventListener("scroll", onRevScroll, { passive: true });

      // Стрелки
      const scrollByCard = (dir) => {
        const idx = getCenterIndex();
        const next = Math.max(0, Math.min(cards.length - 1, idx + dir));
        cards[next].scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      };
      prevBtn?.addEventListener("click", () => scrollByCard(-1));
      nextBtn?.addEventListener("click", () => scrollByCard(1));

      // Кнопка звука внутри карточки
      cards.forEach((card, i) => {
        const btn = card.querySelector("[data-rev-toggle]");
        const icon = card.querySelector("[data-rev-icon]");
        const v = card.querySelector("[data-rev-video]");
        if (!btn || !v) return;

        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const willUnmute = v.muted;

          // Если включаем звук — только у этой карточки,
          // у всех остальных mute
          cards.forEach((c) => {
            const cv = c.querySelector("[data-rev-video]");
            const ci = c.querySelector("[data-rev-icon]");
            if (!cv) return;
            if (c === card) {
              cv.muted = !willUnmute;
              if (ci)
                ci.className = cv.muted
                  ? "fa-solid fa-volume-xmark"
                  : "fa-solid fa-volume-high";
              if (!cv.muted) cv.play().catch(() => {});
            } else {
              cv.muted = true;
              if (ci) ci.className = "fa-solid fa-volume-xmark";
            }
          });
        });
      });

      // Пауза, когда секция за вьюпортом
      const revVisObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              cards.forEach((c) => {
                const v = c.querySelector("[data-rev-video]");
                if (v && !v.paused) v.pause();
              });
            } else {
              activate(getCenterIndex());
            }
          });
        },
        { threshold: 0.1 },
      );
      revVisObs.observe(revSection);

      // visibilitychange
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          cards.forEach((c) => {
            const v = c.querySelector("[data-rev-video]");
            if (v && !v.paused) v.pause();
          });
        } else {
          activate(getCenterIndex());
        }
      });

      // Старт
      requestAnimationFrame(() => activate(getCenterIndex()));
    }
  }
});

(function () {
  "use strict";

  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  const progress = document.getElementById("scrollTopProgress");
  const CIRC = 2 * Math.PI * 25; // r=25 → 157.08

  let ticking = false;

  const update = () => {
    ticking = false;

    const scrollY = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docH > 0 ? Math.min(scrollY / docH, 1) : 0;

    // Показ кнопки после 400px
    if (scrollY > 400) {
      btn.classList.remove("opacity-0", "translate-y-4", "pointer-events-none");
      btn.classList.add("opacity-100", "translate-y-0");
    } else {
      btn.classList.add("opacity-0", "translate-y-4", "pointer-events-none");
      btn.classList.remove("opacity-100", "translate-y-0");
    }

    // Прогресс-кольцо
    if (progress) {
      progress.style.strokeDashoffset = String(CIRC * (1 - ratio));
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // Плавный скролл наверх
  btn.addEventListener("click", () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: reduce ? "auto" : "smooth",
    });
  });

  // Стартовый расчёт
  update();
})();
