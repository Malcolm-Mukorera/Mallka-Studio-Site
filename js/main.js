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
   LOAD SHARED HEADER / FOOTER
========================================= */
async function loadSharedComponents() {
  const headerPlaceholder = document.getElementById("header-placeholder");
  const footerPlaceholder = document.getElementById("footer-placeholder");

  try {
    if (headerPlaceholder) {
      const headerResponse = await fetch("components/header.html");
      const headerHtml = await headerResponse.text();
      headerPlaceholder.innerHTML = headerHtml;
    }

    if (footerPlaceholder) {
      const footerResponse = await fetch("components/footer.html");
      const footerHtml = await footerResponse.text();
      footerPlaceholder.innerHTML = footerHtml;
    }

    setCurrentYear();
    setActiveNavLink();
    initMobileNav();
  } catch (error) {
    console.error("Error loading shared components:", error);
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
  });
}

/* =========================================
   MOBILE NAV
========================================= */
function initMobileNav() {
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");

  if (!navToggle || !mobileNav) return;

  navToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  const mobileLinks = mobileNav.querySelectorAll("a");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* =========================================
   SCROLL REVEAL
========================================= */
function initRevealOnScroll() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;

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
  if (!slides.length) return;

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

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    if (!button) return;

    button.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      faqItems.forEach((faq) => faq.classList.remove("active"));

      if (!isActive) {
        item.classList.add("active");
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

  toggleButton.addEventListener("click", (event) => {
    event.stopPropagation();
    whatsappMenu.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    if (!whatsappMenu.contains(event.target) && event.target !== toggleButton) {
      whatsappMenu.classList.remove("open");
    }
  });
}

/* =========================================
   BACK TO TOP
========================================= */
function initBackToTop() {
  const backToTopButton = document.getElementById("backToTop");
  if (!backToTopButton) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add("show");
    } else {
      backToTopButton.classList.remove("show");
    }
  });

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/* =========================================
   CONTACT FORM VALIDATION
========================================= */
function initContactFormValidation() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    let isValid = true;

    const name = form.querySelector("#name");
    const email = form.querySelector("#email");
    const service = form.querySelector("#service");
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
      event.preventDefault();
    }
  });
}

function showError(input, message) {
  const formGroup = input.closest(".form-group");
  if (!formGroup) return;

  const errorElement = formGroup.querySelector(".error-message");
  if (errorElement) {
    errorElement.textContent = message;
  }

  input.style.borderColor = "#e10600";
}

function clearErrors(form) {
  const errors = form.querySelectorAll(".error-message");
  errors.forEach((error) => {
    error.textContent = "";
  });

  const fields = form.querySelectorAll("input, select, textarea");
  fields.forEach((field) => {
    field.style.borderColor = "";
  });
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
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      portfolioCards.forEach((card) => {
        const category = card.dataset.category;

        if (filter === "all" || category === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
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