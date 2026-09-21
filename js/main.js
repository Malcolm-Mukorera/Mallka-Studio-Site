/* =========================================
   MALKA STUDIO MAIN JS
   Handles:
   - shared header/footer loading
   - current nav highlighting
   - mobile menu
   - reveal on scroll
   - hero slider
   - animated counters
   - FAQ accordion
   - WhatsApp toggle
   - back to top button
   - contact form validation
   - portfolio filtering
   - footer year
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  cleanCurrentUrl();
  loadSharedComponents();
  initRevealOnScroll();
  initHeroSlider();
  initCounters();
  initFaqAccordion();
  initWhatsAppWidget();
  initBackToTop();
  initContactFormValidation();
  initPortfolioFilter();
});

/* =========================================
   CLEAN URL DISPLAY
========================================= */
function cleanCurrentUrl() {
  const cleanPath = window.location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  if (cleanPath !== window.location.pathname) {
    window.history.replaceState({}, "", cleanPath + window.location.search + window.location.hash);
  }
}

/* =========================================
   LOAD SHARED HEADER / FOOTER
========================================= */
async function loadSharedComponents() {
  const headerPlaceholder = document.getElementById("header-placeholder");
  const footerPlaceholder = document.getElementById("footer-placeholder");

  try {
    if (headerPlaceholder) {
      const headerResponse = await fetch("components/header.html", { cache: "force-cache" });
      if (!headerResponse.ok) throw new Error("Header component could not be loaded.");
      const headerHtml = await headerResponse.text();
      headerPlaceholder.innerHTML = headerHtml;
    }

    if (footerPlaceholder) {
      const footerResponse = await fetch("components/footer.html", { cache: "force-cache" });
      if (!footerResponse.ok) throw new Error("Footer component could not be loaded.");
      const footerHtml = await footerResponse.text();
      footerPlaceholder.innerHTML = footerHtml;
    }

    setCurrentYear();
    setActiveNavLink();
    initMobileNav();
    initHeaderScrollState();
  } catch (error) {
    console.error("Error loading shared components:", error);
  }
}

/* =========================================
   HEADER SCROLL STATE
========================================= */
function initHeaderScrollState() {
  if (window.__malkaHeaderScrollBound) {
    updateHeaderScrollState();
    return;
  }

  window.__malkaHeaderScrollBound = true;
  window.addEventListener("scroll", updateHeaderScrollState, { passive: true });
  updateHeaderScrollState();
}

function updateHeaderScrollState() {
  const header = document.getElementById("siteHeader");
  if (header) {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
}

/* =========================================
   ACTIVE NAV LINK
========================================= */
function setActiveNavLink() {
  const page = document.body.dataset.page;
  if (!page) return;

  const navLinks = document.querySelectorAll(`[data-nav="${page}"]`);
  navLinks.forEach((link) => {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  });
}

/* =========================================
   MOBILE NAV
========================================= */
function initMobileNav() {
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  const navClose = document.getElementById("navClose");

  if (!navToggle || !mobileNav) return;

  const focusableSelector = "a[href], button:not([disabled])";

  const closeMobileNav = (restoreFocus = false) => {
    mobileNav.classList.remove("open");
    navToggle.classList.remove("active");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.setAttribute("aria-hidden", "true");
    if (restoreFocus) navToggle.focus();
  };

  navToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNav.setAttribute("aria-hidden", String(!isOpen));
    if (isOpen) navClose?.focus();
  });

  const mobileLinks = mobileNav.querySelectorAll("a");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  if (navClose) {
    navClose.addEventListener("click", closeMobileNav);
  }

  document.addEventListener("click", (event) => {
    if (
      mobileNav.classList.contains("open") &&
      !mobileNav.contains(event.target) &&
      !navToggle.contains(event.target)
    ) {
      closeMobileNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileNav.classList.contains("open")) {
      closeMobileNav(true);
    }

    if (event.key === "Tab" && mobileNav.classList.contains("open")) {
      const focusable = [...mobileNav.querySelectorAll(focusableSelector)];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && mobileNav.classList.contains("open")) {
      closeMobileNav();
    }
  });
}

/* =========================================
   SCROLL REVEAL
========================================= */
function initRevealOnScroll() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;

  if (prefersReducedMotion()) {
    revealElements.forEach((element) => element.classList.add("active"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

/* =========================================
   HERO SLIDER
========================================= */
function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slider .slide");
  if (slides.length < 2 || prefersReducedMotion()) return;

  let currentSlide = 0;

  setInterval(() => {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");
  }, 4000);
}

/* =========================================
   COUNTERS
========================================= */
function initCounters() {
  const counters = document.querySelectorAll(".counter");
  if (!counters.length) return;

  if (prefersReducedMotion()) {
    counters.forEach((counter) => {
      counter.textContent = Number(counter.dataset.target) || 0;
    });
    return;
  }

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const counter = entry.target;
        const target = Number(counter.dataset.target) || 0;
        let current = 0;
        const increment = Math.max(1, Math.ceil(target / 80));

        const updateCounter = () => {
          current += increment;

          if (current >= target) {
            counter.textContent = target;
          } else {
            counter.textContent = current;
            requestAnimationFrame(updateCounter);
          }
        };

        updateCounter();
        observer.unobserve(counter);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

/* =========================================
   FAQ ACCORDION
========================================= */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach((item, index) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!button) return;

    const answerId = answer?.id || `faq-answer-${index + 1}`;
    if (answer) {
      answer.id = answerId;
      answer.setAttribute("role", "region");
      answer.setAttribute("aria-labelledby", `faq-question-${index + 1}`);
    }

    button.id = `faq-question-${index + 1}`;
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", answerId);

    button.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      faqItems.forEach((faq) => {
        faq.classList.remove("active");
        faq.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
      });

      if (!isActive) {
        item.classList.add("active");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* =========================================
   WHATSAPP TOGGLE
========================================= */
function initWhatsAppWidget() {
  const toggleButton = document.getElementById("whatsappToggle");
  const whatsappMenu = document.getElementById("whatsappMenu");

  if (!toggleButton || !whatsappMenu) return;
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.setAttribute("aria-controls", "whatsappMenu");
  whatsappMenu.setAttribute("aria-hidden", "true");

  const closeMenu = () => {
    whatsappMenu.classList.remove("open");
    toggleButton.setAttribute("aria-expanded", "false");
    whatsappMenu.setAttribute("aria-hidden", "true");
  };

  toggleButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = whatsappMenu.classList.toggle("open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
    whatsappMenu.setAttribute("aria-hidden", String(!isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!whatsappMenu.contains(event.target) && event.target !== toggleButton) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && whatsappMenu.classList.contains("open")) {
      closeMenu();
      toggleButton.focus();
    }
  });
}

/* =========================================
   BACK TO TOP
========================================= */
function initBackToTop() {
  let backToTopButton = document.getElementById("backToTop");
  if (!backToTopButton) {
    backToTopButton = document.createElement("button");
    backToTopButton.id = "backToTop";
    backToTopButton.className = "back-to-top";
    backToTopButton.type = "button";
    backToTopButton.setAttribute("aria-label", "Back to top");
    backToTopButton.innerHTML = '<span aria-hidden="true">&uarr;</span>';
    document.body.appendChild(backToTopButton);
  }

  backToTopButton.type = "button";
  backToTopButton.setAttribute("aria-hidden", "true");
  backToTopButton.tabIndex = -1;

  const toggleBackToTop = () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add("show");
      backToTopButton.setAttribute("aria-hidden", "false");
      backToTopButton.tabIndex = 0;
    } else {
      backToTopButton.classList.remove("show");
      backToTopButton.setAttribute("aria-hidden", "true");
      backToTopButton.tabIndex = -1;
    }
  };

  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  });
}

/* =========================================
   CONTACT FORM VALIDATION
========================================= */
function initContactFormValidation() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const service = form.querySelector("#service");
  const requestedService = new URLSearchParams(window.location.search).get("service");
  if (service && [...service.options].some((option) => option.value === requestedService)) {
    service.value = requestedService;
  }

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
    field.addEventListener("change", () => clearFieldError(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let isValid = true;

    const name = form.querySelector("#name");
    const email = form.querySelector("#email");
    const message = form.querySelector("#message");

    clearErrors(form);

    if (!name.value.trim()) {
      showError(name, "Please enter your full name.");
      isValid = false;
    }

    if (!email.value.trim()) {
      showError(email, "Please enter your email address.");
      isValid = false;
    } else if (!isValidEmail(email.value.trim())) {
      showError(email, "Please enter a valid email address.");
      isValid = false;
    }

    if (!service.value.trim()) {
      showError(service, "Please select a service.");
      isValid = false;
    }

    if (!message.value.trim()) {
      showError(message, "Please enter your message.");
      isValid = false;
    }

    if (!isValid) {
      form.querySelector("[aria-invalid='true']")?.focus();
      return;
    }

    const serviceLabel = service.options[service.selectedIndex].text;
    const subject = `Project enquiry: ${serviceLabel}`;
    const body = [
      `Name: ${name.value.trim()}`,
      `Email: ${email.value.trim()}`,
      `Phone: ${form.querySelector("#phone").value.trim() || "Not provided"}`,
      `Company: ${form.querySelector("#company").value.trim() || "Not provided"}`,
      `Service: ${serviceLabel}`,
      `Timeline: ${form.querySelector("#timeline").value}`,
      `Budget: ${form.querySelector("#budget").value}`,
      "",
      "Project details:",
      message.value.trim(),
    ].join("\n");

    window.location.href = `mailto:malkastudio.team@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

function showError(input, message) {
  const formGroup = input.closest(".form-group");
  if (!formGroup) return;

  const errorElement = formGroup.querySelector(".error-message");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.setAttribute("role", "alert");
  }

  input.style.borderColor = "#e10600";
  input.setAttribute("aria-invalid", "true");
}

function clearErrors(form) {
  const errors = form.querySelectorAll(".error-message");
  errors.forEach((error) => {
    error.textContent = "";
  });

  const fields = form.querySelectorAll("input, select, textarea");
  fields.forEach((field) => {
    field.style.borderColor = "";
    field.removeAttribute("aria-invalid");
  });
}

function clearFieldError(field) {
  const formGroup = field.closest(".form-group");
  if (!formGroup || field.getAttribute("aria-invalid") !== "true") return;

  field.removeAttribute("aria-invalid");
  field.style.borderColor = "";
  const errorElement = formGroup.querySelector(".error-message");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.removeAttribute("role");
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =========================================
   PORTFOLIO FILTER
========================================= */
function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const portfolioCards = document.querySelectorAll(".portfolio-card");

  if (!filterButtons.length || !portfolioCards.length) return;

  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("active")));

    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      });

      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");

      portfolioCards.forEach((card) => {
        const category = card.dataset.category;

        if (filter === "all" || category === filter) {
          card.style.display = "flex";
          card.removeAttribute("aria-hidden");
        } else {
          card.style.display = "none";
          card.setAttribute("aria-hidden", "true");
        }
      });
    });
  });
}

/* =========================================
   FOOTER YEAR
========================================= */
function setCurrentYear() {
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
