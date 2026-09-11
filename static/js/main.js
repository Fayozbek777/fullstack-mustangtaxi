/* =========================================================
   Mustang — main.js
   Single ESM module. DOM-ready aware.
   ========================================================= */

import {
  animate,
  stagger,
  spring,
  inView,
} from "https://cdn.jsdelivr.net/npm/motion@10/+esm";

/* ============ Shared helpers ============ */
const EASE = [0.16, 1, 0.3, 1];
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const IS_MOBILE = window.matchMedia("(max-width: 768px)").matches;

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

/* Одноразовый reveal — защита от повторного запуска + снятие will-change */
const revealOnce = (section, els, opts = {}) => {
  if (!section || !els || !els.length) return;
  let done = false;

  inView(
    section,
    () => {
      if (done) return;
      done = true;

      if (REDUCED) {
        els.forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.willChange = "";
        });
        return;
      }

      els.forEach((el) => (el.style.willChange = "transform, opacity"));

      animate(
        els,
        { opacity: [0, 1], y: [40, 0] },
        {
          duration: 0.8,
          easing: EASE,
          delay: stagger(0.12),
          ...opts,
          onComplete: () => {
            els.forEach((el) => (el.style.willChange = ""));
            opts.onComplete?.();
          },
        },
      );
    },
    { amount: 0.15 },
  );
};

/* Общий автоплей-хелпер для фоновых видео (bg + hero) */
const setupAutoplay = (video) => {
  if (!video) return;
  video.muted = true;
  video.playsInline = true;

  const tryPlay = () => {
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        const onFirst = () => {
          video.play().catch(() => {});
          window.removeEventListener("touchstart", onFirst);
          window.removeEventListener("click", onFirst);
        };
        window.addEventListener("touchstart", onFirst, {
          once: true,
          passive: true,
        });
        window.addEventListener("click", onFirst, { once: true });
      });
    }
  };
  tryPlay();
};

/* ============ Boot ============ */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------------------------------------
     1. NAVBAR — scroll shadow
     --------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrolled = window.scrollY > 8;
      navbar?.classList.toggle("shadow-soft", scrolled);
      navbar?.classList.toggle("border-gray-200", scrolled);
      navbar?.classList.toggle("border-transparent", !scrolled);
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     2. NAVBAR — entrance animations
     --------------------------------------------------------- */
  const logo = document.querySelector('[data-nav="logo"]');
  if (logo && !REDUCED) {
    animate(
      logo,
      { opacity: [0, 1], x: [-10, 0] },
      { duration: 0.6, easing: EASE, delay: 0.1 },
    );
  }

  const links = document.querySelectorAll(".nav-link");
  if (links.length && !REDUCED) {
    animate(
      links,
      { opacity: [0, 1], y: [-8, 0] },
      { duration: 0.5, easing: EASE, delay: stagger(0.06, { start: 0.2 }) },
    );
  }

  const cta = document.getElementById("ctaBtn");
  cta?.addEventListener("click", () => {
    animate(cta, { scale: [1, 1.06, 1] }, { duration: 0.35, easing: EASE });
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
     6. SIDE PANEL (mobile, right)
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
     7. MOBILE DROPDOWN — Skooterlar
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
     8. ESC — close everything
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
     9. RESIZE — auto-close panel on desktop
     --------------------------------------------------------- */
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024 && panelOpen) closeSide();
  });

  /* ---------------------------------------------------------
     10. ABOUT — reveal + parallax + counters
     --------------------------------------------------------- */
  const aboutSection = document.getElementById("about");
  if (aboutSection) {
    const revealEls = aboutSection.querySelectorAll("[data-reveal]");
    revealOnce(aboutSection, revealEls);

    const collage = aboutSection.querySelector(".lg\\:col-span-3");
    const icons = aboutSection.querySelectorAll("[data-collage-icon]");

    if (collage && icons.length && !IS_MOBILE) {
      let raf = null;
      collage.addEventListener("mouseenter", () => {
        icons.forEach((el) => (el.style.willChange = "transform"));
      });
      collage.addEventListener("mousemove", (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const rect = collage.getBoundingClientRect();
          const cx = (e.clientX - rect.left) / rect.width - 0.5;
          const cy = (e.clientY - rect.top) / rect.height - 0.5;

          icons.forEach((el, i) => {
            const depth = 10 + i * 8;
            el.style.transform = `translate3d(${cx * depth}px, ${cy * depth}px, 0)`;
          });
          raf = null;
        });
      });

      collage.addEventListener("mouseleave", () => {
        icons.forEach((el) => {
          el.style.transform = "";
          el.style.willChange = "";
        });
      });
    }

    const counters = aboutSection.querySelectorAll("[data-counter]");
    if (counters.length) {
      const fmt = new Intl.NumberFormat("en-US");

      const runCounter = (el) => {
        const target = parseFloat(el.dataset.counter);
        const suffix = el.dataset.suffix || "";
        const duration = 1600;
        const start = performance.now();

        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const value = Math.floor(eased * target);
          el.textContent = fmt.format(value) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      };

      let countersDone = false;
      inView(
        counters[0],
        () => {
          if (countersDone) return;
          countersDone = true;
          counters.forEach((el, i) =>
            setTimeout(() => runCounter(el), i * 200),
          );
        },
        { amount: 0.4 },
      );
    }
  }

  /* ---------------------------------------------------------
     11. HOW — reveal + hover-параллакс стрелки
     --------------------------------------------------------- */
  const howSection = document.getElementById("how");
  if (howSection) {
    const howReveals = howSection.querySelectorAll("[data-reveal]");
    revealOnce(howSection, howReveals);

    const howCta = document.getElementById("howCtaBtn");
    if (howCta) {
      howCta.addEventListener("click", () => {
        animate(
          howCta,
          { scale: [1, 1.06, 1] },
          { duration: 0.35, easing: EASE },
        );
      });
    }
  }

  /* ---------------------------------------------------------
     14. BACKGROUND VIDEO — autoplay + reveal + pause offscreen
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
        { threshold: 0.15 },
      );
      obs.observe(bgSection);

      const bgReveals = bgSection.querySelectorAll("[data-reveal]");
      if (bgReveals.length) {
        revealOnce(bgSection, bgReveals, { y: [30, 0] });
      }
    }

    const docBtn = document.getElementById("docDownloadBtn");
    docBtn?.addEventListener("click", () => {
      animate(
        docBtn,
        { scale: [1, 1.06, 1] },
        { duration: 0.35, easing: EASE },
      );
    });
  }

  /* ---------------------------------------------------------
     15. CONTACTS — reveal + spring на кнопке карты
     --------------------------------------------------------- */
  const contactsSection = document.getElementById("contacts");
  if (contactsSection) {
    const contactReveals = contactsSection.querySelectorAll("[data-reveal]");
    revealOnce(contactsSection, contactReveals);

    const mapBtn = document.getElementById("mapOpenBtn");
    mapBtn?.addEventListener("click", () => {
      animate(
        mapBtn,
        { scale: [1, 1.06, 1] },
        { duration: 0.35, easing: EASE },
      );
    });
  }

  /* ---------------------------------------------------------
     16. LEGAL PAGES — reveal всех [data-reveal]
     --------------------------------------------------------- */
  const legalSections = document.querySelectorAll(
    "#privacy, #terms, section:has([data-reveal])",
  );

  legalSections.forEach((section) => {
    const reveals = section.querySelectorAll("[data-reveal]");
    if (!reveals.length) return;
    revealOnce(section, reveals, {
      y: [30, 0],
      duration: 0.7,
      delay: stagger(0.08),
    });
  });

  /* ---------------------------------------------------------
     17. LEAD FORM — маска, страна, валидация, submit
     --------------------------------------------------------- */
  const leadForm = document.getElementById("leadForm");
  if (leadForm) {
    const formSection = document.getElementById("contact-form");
    const formReveals = formSection?.querySelectorAll("[data-reveal]");
    if (formSection && formReveals?.length) {
      revealOnce(formSection, formReveals);
    }

    const countryDrop = document.getElementById("countryDrop");
    const countryToggle = document.getElementById("countryToggle");
    const countryMenu = document.getElementById("countryMenu");
    const countryChevron = document.getElementById("countryChevron");
    const countryFlag = document.getElementById("countryFlag");
    const countryCode = document.getElementById("countryCode");
    const phoneInput = document.getElementById("phone");
    let countryOpen = false;

    const toggleCountry = (open) => {
      countryOpen = open;
      if (!countryMenu || !countryChevron) return;
      if (open) {
        countryMenu.classList.remove(
          "opacity-0",
          "scale-95",
          "-translate-y-1.5",
          "pointer-events-none",
        );
        countryMenu.classList.add("opacity-100", "scale-100", "translate-y-0");
        countryChevron.classList.add("rotate-180");
      } else {
        countryMenu.classList.add(
          "opacity-0",
          "scale-95",
          "-translate-y-1.5",
          "pointer-events-none",
        );
        countryMenu.classList.remove(
          "opacity-100",
          "scale-100",
          "translate-y-0",
        );
        countryChevron.classList.remove("rotate-180");
      }
    };

    countryToggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleCountry(!countryOpen);
    });

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

    const getDigitsCount = (mask) => (mask.match(/#/g) || []).length;

    document.querySelectorAll(".country-item").forEach((item) => {
      item.addEventListener("click", () => {
        const { country, dial, flag, code, mask } = item.dataset;

        if (countryFlag) countryFlag.textContent = flag;
        if (countryCode) countryCode.textContent = code;
        if (phoneInput) {
          phoneInput.dataset.mask = mask;
          phoneInput.placeholder = mask.replace(/#/g, "_");
          phoneInput.value = applyMask(dial + " ", mask);
        }

        document
          .querySelectorAll(".country-item")
          .forEach((b) =>
            b.classList.toggle(
              "bg-brand-graySoft",
              b.dataset.country === country,
            ),
          );

        toggleCountry(false);
        phoneInput?.focus();
      });
    });

    if (phoneInput) {
      phoneInput.dataset.mask = "+998 ## ### ## ##";

      phoneInput.addEventListener("input", (e) => {
        const mask = phoneInput.dataset.mask || "+998 ## ### ## ##";
        e.target.value = applyMask(e.target.value, mask);
      });

      phoneInput.addEventListener("focus", (e) => {
        const mask = phoneInput.dataset.mask || "+998 ## ### ## ##";
        const dial = mask.split(" ")[0];
        if (!e.target.value) e.target.value = dial + " ";
      });
    }

    document.addEventListener("click", (e) => {
      if (countryOpen && countryDrop && !countryDrop.contains(e.target)) {
        toggleCountry(false);
      }
    });

    const showError = (fieldName, msg) => {
      const errEl = document.querySelector(`[data-error="${fieldName}"]`);
      if (!errEl) return;
      errEl.textContent = msg;
      errEl.classList.toggle("hidden", !msg);
    };

    const validate = () => {
      let ok = true;

      const firstEl = document.getElementById("firstName");
      const first = firstEl ? firstEl.value.trim() : "";
      if (first.length < 2) {
        showError("firstName", "Ismingizni kiriting (kamida 2 harf)");
        ok = false;
      } else {
        showError("firstName", "");
      }

      const mask = phoneInput?.dataset.mask || "+998 ## ### ## ##";
      const needDigits = getDigitsCount(mask);
      const phoneDigits = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";
      if (phoneDigits.length < needDigits) {
        showError("phone", "Telefon raqamni to‘liq kiriting");
        ok = false;
      } else {
        showError("phone", "");
      }

      return ok;
    };

    leadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate()) return;

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
          { duration: 0.35, easing: EASE },
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

    function getCSRFToken() {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="));
      return cookie ? cookie.split("=")[1] : "";
    }
  }

  /* ---------------------------------------------------------
     22. HERO v2 — background video + оркестрованный вход
     (единственный блок для hero-видео)
     --------------------------------------------------------- */
  const heroVideo = document.querySelector("[data-hero-video]");
  const heroSection = document.getElementById("hero");

  if (heroVideo) {
    setupAutoplay(heroVideo);
    heroVideo.playbackRate = 0.9;

    if (heroSection) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) heroVideo.pause();
            else heroVideo.play().catch(() => {});
          });
        },
        { threshold: 0.15 },
      );
      obs.observe(heroSection);
    }
  }

  /* ---------- Единый visibilitychange для всех видео ---------- */
  const allVideos = document.querySelectorAll(
    "[data-bg-video], [data-hero-video]",
  );
  if (allVideos.length) {
    document.addEventListener("visibilitychange", () => {
      allVideos.forEach((v) => {
        if (document.hidden) v.pause();
        else v.play().catch(() => {});
      });
    });
  }

  /* ---------- Оркестрованный вход ---------- */
  const hero = document.getElementById("hero");
  if (hero) {
    const badge = hero.querySelector('[data-hero="badge"]');
    const words = hero.querySelectorAll("[data-word]");
    const subtitle = hero.querySelector('[data-hero="subtitle"]');
    const actions = hero.querySelector('[data-hero="actions"]');
    const stats = hero.querySelector('[data-hero="stats"]');
    const card = hero.querySelector('[data-hero="card"]');
    const features = hero.querySelectorAll("[data-hero-feature]");
    const floaters = hero.querySelectorAll("[data-float]");

    const blurSafe = IS_MOBILE || REDUCED;

    if (!REDUCED) {
      if (badge) {
        animate(
          badge,
          { opacity: [0, 1], y: [20, 0] },
          { duration: 0.6, easing: EASE, delay: 0.1 },
        );
      }

      if (words.length) {
        const keyframes = blurSafe
          ? { opacity: [0, 1], y: [40, 0] }
          : {
              opacity: [0, 1],
              y: [40, 0],
              filter: ["blur(10px)", "blur(0px)"],
            };
        words.forEach(
          (el) => (el.style.willChange = "transform, opacity, filter"),
        );
        animate(words, keyframes, {
          duration: 1,
          easing: EASE,
          delay: stagger(0.18, { start: 0.3 }),
          onComplete: () => {
            words.forEach((el) => (el.style.willChange = ""));
          },
        });
      }

      if (subtitle) {
        animate(
          subtitle,
          { opacity: [0, 1], y: [24, 0] },
          { duration: 0.8, easing: EASE, delay: 0.85 },
        );
      }

      if (actions) {
        animate(
          actions,
          { opacity: [0, 1], y: [24, 0] },
          { duration: 0.8, easing: EASE, delay: 1.05 },
        );
      }

      if (stats) {
        animate(
          stats,
          { opacity: [0, 1], y: [20, 0] },
          { duration: 0.8, easing: EASE, delay: 1.2 },
        );
      }

      if (card) {
        animate(
          card,
          { opacity: [0, 1], x: [40, 0] },
          { duration: 1, easing: EASE, delay: 0.6 },
        );
      }

      if (features.length) {
        animate(
          features,
          { opacity: [0, 1], x: [20, 0] },
          { duration: 0.6, easing: EASE, delay: stagger(0.12, { start: 1.0 }) },
        );
      }
    }

    /* Floating-иконки: вход + бесконечный float.
       Параллакс пишем в CSS-переменные, чтобы не конфликтовать
       с motion.transform (иначе — дёрганье каждый кадр). */
    floaters.forEach((el, i) => {
      el.style.setProperty("--px", "0px");
      el.style.setProperty("--py", "0px");

      if (!REDUCED) {
        animate(
          el,
          { opacity: [0, 1], scale: [0.5, 1] },
          { duration: 0.8, easing: EASE, delay: 0.6 + i * 0.15 },
        );
        animate(
          el,
          { y: [0, -16, 0], rotate: [0, 5, 0] },
          {
            duration: 6 + i * 0.5,
            delay: 1.5,
            repeat: Infinity,
            easing: "ease-in-out",
          },
        );
      }
    });

    const pulse = hero.querySelector("[data-pulse]");
    if (pulse && !REDUCED) {
      animate(
        pulse,
        { scale: [1, 1.6, 1], opacity: [1, 0.5, 1] },
        { duration: 1.8, repeat: Infinity, easing: "ease-in-out" },
      );
    }

    const heroCta = document.getElementById("heroPrimaryCta");
    heroCta?.addEventListener("click", () => {
      animate(
        heroCta,
        { scale: [1, 1.05, 1] },
        { duration: 0.35, easing: EASE },
      );
    });

    /* Параллакс через CSS-переменные */
    if (!IS_MOBILE && floaters.length) {
      let raf = null;
      hero.addEventListener("mousemove", (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          const cx = (e.clientX - rect.left) / rect.width - 0.5;
          const cy = (e.clientY - rect.top) / rect.height - 0.5;

          floaters.forEach((el, i) => {
            const depth = 14 + i * 8;
            el.style.setProperty("--px", `${cx * depth}px`);
            el.style.setProperty("--py", `${cy * depth}px`);
          });
          raf = null;
        });
      });

      hero.addEventListener("mouseleave", () => {
        floaters.forEach((el) => {
          el.style.setProperty("--px", "0px");
          el.style.setProperty("--py", "0px");
        });
      });
    }
  }
});
