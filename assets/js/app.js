(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  const menu = $("#navMenu");
  if (nav && toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close on link click (mobile)
    $$(".nav__link", menu).forEach((a) => {
      a.addEventListener("click", () => {
        if (nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  // Scroll progress
  const bar = $(".scroll-progress__bar");
  const updateProgress = () => {
    if (!bar) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    bar.style.width = `${pct}%`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // Cursor glow (desktop)
  const glow = $(".cursor-glow");
  if (glow) {
    let raf = 0;
    const move = (x, y) => {
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
    };
    window.addEventListener(
      "mousemove",
      (e) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => move(e.clientX, e.clientY));
      },
      { passive: true },
    );
  }

  // Parallax hero background
  const grid = $(".gridlines");
  const orbs = $$(".orb");
  const parallax = () => {
    const y = window.scrollY || 0;
    if (grid) grid.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;
    orbs.forEach((o, i) => {
      const factor = 0.06 + i * 0.02;
      o.style.transform = `translate3d(0, ${y * factor}px, 0)`;
    });
  };
  window.addEventListener("scroll", parallax, { passive: true });
  parallax();

  // Reveal on scroll
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Counters
  const counterEls = $$("[data-counter]");
  const animateCounter = (el) => {
    const to = Number(el.getAttribute("data-to") || "0");
    const duration = 900;
    const start = performance.now();
    const from = 0;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const val = Math.round(from + (to - from) * easeOut(t));
      el.textContent = String(val);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window && counterEls.length) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCounter(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.35 },
    );
    counterEls.forEach((el) => cio.observe(el));
  } else {
    counterEls.forEach(animateCounter);
  }

  // Page transitions: fade out before navigating internal links
  const fade = $(".page-fade");
  const isInternal = (href) => {
    try {
      const url = new URL(href, window.location.href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href) return;

    // ignore hash-only, new tab, external
    const isHashOnly = href.startsWith("#");
    if (isHashOnly) return;
    if (
      a.target === "_blank" ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    if (!isInternal(href)) return;

    // allow mailto/tel
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

    e.preventDefault();
    if (fade) fade.classList.add("is-on");

    window.setTimeout(() => {
      window.location.href = href;
    }, 240);
  });

  // Command palette (Ctrl+K)
  const palette = $("#palette");
  const paletteInput = $("#paletteInput");
  const paletteList = $("#paletteList");
  const openBtns = $$("[data-open-palette]");
  const closeBtns = $$("[data-palette-close]");

  const commands = [
    { label: "Home", meta: "index.html", action: () => go("index.html") },
    { label: "About", meta: "about.html", action: () => go("about.html") },
    {
      label: "Services",
      meta: "services.html",
      action: () => go("services.html"),
    },
    {
      label: "Portfolio",
      meta: "portfolio.html",
      action: () => go("portfolio.html"),
    },
    {
      label: "Insights / Blog",
      meta: "blog.html",
      action: () => go("blog.html"),
    },
    {
      label: "Contact",
      meta: "contact.html",
      action: () => go("contact.html"),
    },
    {
      label: "Jump: Services section",
      meta: "#services",
      action: () => jump("#services"),
    },
    {
      label: "Jump: Portfolio section",
      meta: "#portfolio",
      action: () => jump("#portfolio"),
    },
    {
      label: "Email: info@malkastudios.com",
      meta: "mailto:",
      action: () => (window.location.href = "mailto:info@malkastudios.com"),
    },
  ];

  let filtered = [...commands];
  let activeIndex = 0;

  function go(path) {
    if (window.location.pathname.endsWith(path)) {
      closePalette();
      return;
    }
    if (fade) fade.classList.add("is-on");
    setTimeout(() => {
      window.location.href = path;
    }, 220);
  }

  function jump(hash) {
    closePalette();
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderList() {
    if (!paletteList) return;
    paletteList.innerHTML = "";
    filtered.forEach((cmd, idx) => {
      const item = document.createElement("div");
      item.className =
        "palette__item" + (idx === activeIndex ? " is-active" : "");
      item.setAttribute("role", "option");
      item.tabIndex = -1;
      item.innerHTML = `
        <div class="palette__label">${escapeHtml(cmd.label)}</div>
        <div class="palette__meta">${escapeHtml(cmd.meta || "")}</div>
      `;
      item.addEventListener("mouseenter", () => {
        activeIndex = idx;
        updateActive();
      });
      item.addEventListener("click", () => cmd.action());
      paletteList.appendChild(item);
    });
  }

  function updateActive() {
    const items = $$(".palette__item", paletteList);
    items.forEach((el, i) =>
      el.classList.toggle("is-active", i === activeIndex),
    );
    const active = items[activeIndex];
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  function filterCommands(q) {
    const s = q.trim().toLowerCase();
    filtered = !s
      ? [...commands]
      : commands.filter((c) =>
          (c.label + " " + (c.meta || "")).toLowerCase().includes(s),
        );
    activeIndex = 0;
    renderList();
  }

  function openPalette() {
    if (!palette) return;
    palette.classList.add("is-open");
    palette.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    filterCommands("");
    setTimeout(() => paletteInput && paletteInput.focus(), 40);
  }

  function closePalette() {
    if (!palette) return;
    palette.classList.remove("is-open");
    palette.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openBtns.forEach((b) => b.addEventListener("click", openPalette));
  closeBtns.forEach((b) => b.addEventListener("click", closePalette));

  window.addEventListener("keydown", (e) => {
    // Ctrl+K / Cmd+K
    const isK = (e.key || "").toLowerCase() === "k";
    if ((e.ctrlKey || e.metaKey) && isK) {
      e.preventDefault();
      if (palette?.classList.contains("is-open")) closePalette();
      else openPalette();
      return;
    }

    if (!palette?.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(filtered.length - 1, activeIndex + 1);
      updateActive();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(0, activeIndex - 1);
      updateActive();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) cmd.action();
    }
  });

  if (paletteInput) {
    paletteInput.addEventListener("input", (e) => {
      filterCommands(e.target.value || "");
    });
  }
  // Theme toggle (dark/light) with persistence + system default
  (function themeInit() {
    const root = document.documentElement;
    const stored = localStorage.getItem("malka-theme");

    // If user never chose, follow system preference
    if (!stored) {
      const prefersLight =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches;
      root.setAttribute("data-theme", prefersLight ? "light" : "dark");
    } else {
      root.setAttribute("data-theme", stored);
    }

    // Update toggle label/icon state
    function syncToggleUI() {
      const btn = document.querySelector(".theme-toggle");
      if (!btn) return;

      const isLight = root.getAttribute("data-theme") === "light";
      btn.setAttribute("aria-pressed", isLight ? "true" : "false");
      btn.querySelector(".theme-toggle__text").textContent = isLight
        ? "Light"
        : "Dark";
      btn.title = isLight ? "Switch to dark" : "Switch to light";
    }

    // Attach click handler
    function bind() {
      const btn = document.querySelector(".theme-toggle");
      if (!btn) return;

      btn.addEventListener("click", () => {
        const current = root.getAttribute("data-theme") || "dark";
        const next = current === "light" ? "dark" : "light";
        root.setAttribute("data-theme", next);
        localStorage.setItem("malka-theme", next);
        syncToggleUI();
      });

      syncToggleUI();
    }

    // Wait for DOM so the button exists
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bind);
    } else {
      bind();
    }
  })();
  // Helpers
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
