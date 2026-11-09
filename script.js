const useCaseImages = document.querySelectorAll(".use-case-image");
function updateUseCaseParallax() {
  useCaseImages.forEach(image => {
    const card = image.closest(".use-case-card");
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const movement = (progress - 0.5) * 70;

    image.style.transform = `translateY(${movement}px)`;
  });
}

const useCases = [
  {
    eyebrow:"I’M TESTING AN IDEA",
    title:"Launch lean, validate before you spend.",
    image:"assets/testimonial2.png"
  },
  {
    eyebrow:"I RUN A BUSINESS",
    title:"Consolidate tools, cut operating costs.",
    image:"assets/team.png"
  },
  {
    eyebrow:"I'M A FREELANCER",
    title:"Showcase to the right audience, get hired faster.",
    image:"assets/testimonial1.png"
  }
];

const useCaseContent = document.querySelector(".use-case-content");
const useCaseEyebrow = document.querySelector(".use-case-eyebrow");
const useCaseTitle = document.querySelector(".use-case-content h3");
const useCaseImage = document.querySelector(".use-case-image");
const useCaseDots = document.querySelectorAll(".use-case-dot");

if (useCaseContent && useCaseEyebrow && useCaseTitle && useCaseImage && useCaseDots.length) {
  let currentUseCase = 0;
  let useCaseTimer;

  function updateUseCase(index) {
    if (index === currentUseCase && useCaseContent.dataset.loaded) return;

    const nextUseCase = useCases[index];

    useCaseContent.classList.remove("is-entering");
    useCaseImage.classList.remove("is-entering");
    useCaseContent.classList.add("is-exiting");
    useCaseImage.classList.add("is-exiting");

    setTimeout(() => {
      useCaseEyebrow.textContent = nextUseCase.eyebrow;
      useCaseTitle.textContent = nextUseCase.title;
      useCaseImage.style.backgroundImage = `url("${nextUseCase.image}")`;

      useCaseContent.classList.remove("is-exiting");
      useCaseImage.classList.remove("is-exiting");

      void useCaseContent.offsetWidth;

      useCaseContent.classList.add("is-entering");
      useCaseImage.classList.add("is-entering");

      useCaseDots.forEach((dot,i) => {
        dot.classList.toggle("active",i === index);
      });

      currentUseCase = index;
      useCaseContent.dataset.loaded = "true";
    },350);
  }

  function nextUseCase() {
    updateUseCase((currentUseCase + 1) % useCases.length);
  }

  function startUseCaseTimer() {
    clearInterval(useCaseTimer);
    useCaseTimer = setInterval(nextUseCase,3000);
  }

  useCaseDots.forEach(dot => {
    dot.addEventListener("click",() => {
      const index = Number(dot.dataset.slide);
      if (index === currentUseCase) return;
      updateUseCase(index);
      startUseCaseTimer();
    });
  });

  updateUseCase(0);
  startUseCaseTimer();

  const useCasesRevealTargets = document.querySelectorAll(".use-cases-header, .use-cases-slider, .use-cases-controls");
  function updateUseCasesRevealState() {
    useCasesRevealTargets.forEach(target => {
      const rect = target.getBoundingClientRect();
      const shouldReveal = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      target.classList.toggle("is-visible", shouldReveal);
    });
  }

  window.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateUseCasesRevealState);
  }, { passive: true });
  window.addEventListener("resize", updateUseCasesRevealState);
  updateUseCasesRevealState();
  setTimeout(updateUseCasesRevealState, 80);
}

(() => {
  const DURATION = 5000;   // ms each feature stays open
  const HOVER_DELAY = 120; // ms the pointer must rest on a feature before it opens

  const section = document.querySelector("[data-features]");
  if (!section) return;

  const list = section.querySelector("[data-feature-list]");
  const items = Array.from(section.querySelectorAll("[data-feature]"));
  const images = Array.from(section.querySelectorAll("[data-feature-image]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // One source of truth for the timing: the CSS progress line reads this value
  section.style.setProperty("--duration", `${DURATION}ms`);

  let current = 0;
  let remaining = DURATION;
  let startedAt = 0;
  let timer = null;
  let hoverTimer = null;
  let inView = false;
  let hovering = false;
  let focused = false;

  const canRun = () => inView && !hovering && !focused && !reduceMotion && !document.hidden;

  function play() {
    startedAt = performance.now();
    timer = setTimeout(next, remaining);
    section.classList.remove("is-paused");
    items[current].classList.add("is-playing");
  }

  function halt() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
    }
    section.classList.add("is-paused");
  }

  function update() {
    if (canRun()) {
      if (!timer) play();
    } else {
      halt();
    }
  }

  function setActive(index) {
    clearTimeout(timer);
    timer = null;
    remaining = DURATION;
    current = index;

    items.forEach((item, i) => {
      const active = i === index;
      item.classList.toggle("is-active", active);
      item.classList.remove("is-playing");
      item.querySelector(".feature__trigger").setAttribute("aria-expanded", String(active));
    });
    images.forEach((img, i) => img.classList.toggle("is-active", i === index));

    void section.offsetWidth; // flush styles so the progress line restarts from zero
    update();
  }

  function next() {
    timer = null;
    setActive((current + 1) % items.length);
  }

  items.forEach((item, i) => {
    const trigger = item.querySelector(".feature__trigger");

    // Hover (mouse only) opens the feature after a short rest, which avoids flicker while panels move
    item.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => { if (i !== current) setActive(i); }, HOVER_DELAY);
    });
    item.addEventListener("pointerleave", () => clearTimeout(hoverTimer));

    // Click, tap and keyboard
    trigger.addEventListener("click", () => { if (i !== current) setActive(i); });
    trigger.addEventListener("focus", () => {
      if (trigger.matches(":focus-visible") && i !== current) setActive(i);
    });
  });

  // Pause the cycle while the pointer is over the list or keyboard focus is inside it
  list.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") { hovering = true; update(); }
  });
  list.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") { hovering = false; update(); }
  });
  list.addEventListener("focusin", (e) => { focused = e.target.matches(":focus-visible"); update(); });
  list.addEventListener("focusout", () => { focused = false; update(); });

  // Run only while the section is on screen and the tab is visible
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    update();
  }, { threshold: 0.4 }).observe(section);

  document.addEventListener("visibilitychange", update);

  setActive(0);
})();

(() => {
  const DURATION = 3000;
  const HOVER_DELAY = 80; // ms the pointer must rest on a card before it opens

  const section = document.querySelector("[data-testimonials]");
  if (!section) return;

  const cards = Array.from(section.querySelectorAll("[data-card]"));
  if (!cards.length) return;

  const isRow = window.matchMedia("(min-width: 861px)"); // side-by-side layout
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let hoverTimer = null;
  let cycleTimer = null;
  let inView = false;

  function scheduleCycle() {
    clearTimeout(cycleTimer);
    cycleTimer = null;
    if (!inView || document.hidden || reduceMotion.matches) return;

    cycleTimer = setTimeout(() => {
      const currentIndex = cards.findIndex((card) => card.classList.contains("is-active"));
      setActive(cards[(currentIndex + 1) % cards.length]);
    }, DURATION);
  }

  function setActive(active) {
    cards.forEach((card) => {
      const open = card === active;
      card.classList.toggle("is-active", open);
      card.querySelector(".card__toggle").setAttribute("aria-expanded", String(open));
    });

    scheduleCycle();
  }

  cards.forEach((card) => {
    const toggle = card.querySelector(".card__toggle");

    // Click, tap and keyboard
    toggle.addEventListener("click", () => {
      const isOpen = card.classList.contains("is-active");

      if (isRow.matches) {
        if (!isOpen) setActive(card);        // desktop: one card is always open
        return;
      }

      setActive(isOpen ? null : card);       // stacked: tap again to close
      if (!isOpen) {
        // Once the previous card has closed, bring the opened card back into view
        setTimeout(() => {
          card.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "nearest" });
        }, 720);
      }
    });

    // Hover (mouse, side-by-side layout only, so stacked cards never jump under the cursor)
    card.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse" || !isRow.matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        if (!card.classList.contains("is-active")) setActive(card);
      }, HOVER_DELAY);
    });
    card.addEventListener("pointerleave", () => clearTimeout(hoverTimer));

    // Keyboard focus opens the card too
    toggle.addEventListener("focus", () => {
      if (isRow.matches && toggle.matches(":focus-visible")) setActive(card);
    });
  });

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    scheduleCycle();
  }, { threshold: 0.1 }).observe(section);

  document.addEventListener("visibilitychange", scheduleCycle);

  setActive(cards.find((card) => card.classList.contains("is-active")) || cards[0]);
})();

(function(){
  const items = document.querySelectorAll('#faqAccordion .faq-item');

  items.forEach((item) => {
    const button = item.querySelector('.faq-question');

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      items.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

(() => {
  const wrapper = document.getElementById('evercare-fab-wrapper');
  const fab = document.getElementById('evercare-fab');
  const card = document.getElementById('evercare-fab-card');

  if (!wrapper || !fab || !card) return;

  const setOpen = (open) => {
    wrapper.classList.toggle('is-open', open);
    fab.setAttribute('aria-expanded', String(open));
    fab.setAttribute('aria-label', open ? 'Close contact options' : 'Open contact options');
    card.setAttribute('aria-hidden', String(!open));
  };

  fab.addEventListener('click', () => {
    setOpen(!wrapper.classList.contains('is-open'));
  });

  document.addEventListener('click', (event) => {
    if (!wrapper.contains(event.target)) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  window.addEventListener('load', () => {
    window.setTimeout(() => {
      wrapper.classList.add('is-visible');
    }, 5000);
  });

  // Close the card after selecting an on-page link.
  card.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
})();

(() => {
  const root = document.querySelector("[data-customers]");
  if (!root) return;

  const track = root.querySelector("[data-track]");
  const prev = root.querySelector("[data-prev]");
  const next = root.querySelector("[data-next]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // One card plus the gap between cards
  const step = () => {
    const card = track.querySelector("li");
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.offsetWidth + gap;
  };

  // Grey out the arrows at either end
  function update() {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  }

  const scrollByCard = (direction) =>
    track.scrollBy({ left: direction * step(), behavior: reduceMotion.matches ? "auto" : "smooth" });

  prev.addEventListener("click", () => scrollByCard(-1));
  next.addEventListener("click", () => scrollByCard(1));

  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);

  update();
})();

(() => {
  const section = document.querySelector("[data-firms]");
  if (!section) return;

  // Stagger the logos one after another
  section.querySelectorAll(".firms__grid li").forEach((item, i) => {
    item.style.setProperty("--i", i);
  });

  // Fade everything in once, when the section is about 25% on screen
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    section.classList.add("is-visible");
    observer.disconnect();
  }, { threshold: 0.25 });

  observer.observe(section);
})();

(() => {
  const media = document.querySelector("[data-media]");
  if (!media) return;

  const preview = media.querySelector("[data-video]");
  const toggle = media.querySelector("[data-toggle]");
  const watch = media.querySelector("[data-watch]");
  const dialog = document.querySelector("[data-dialog]");
  const full = dialog.querySelector("[data-full]");
  const closeBtn = dialog.querySelector("[data-close]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let resumePreview = false;

  // Pause / play button follows the preview's real state
  function sync() {
    const paused = preview.paused;
    toggle.classList.toggle("is-paused", paused);
    toggle.setAttribute("aria-label", paused ? "Play preview video" : "Pause preview video");
  }
  preview.addEventListener("play", sync);
  preview.addEventListener("pause", sync);

  toggle.addEventListener("click", () => {
    if (preview.paused) preview.play().catch(() => {});
    else preview.pause();
  });

  // Visitors who prefer reduced motion see the still poster until they press play
  if (reduceMotion.matches) preview.pause();
  sync();

  // "Watch video" opens the full video in a pop-up
  watch.addEventListener("click", () => {
    if (!full.getAttribute("src")) full.src = full.dataset.src; // load it only when needed
    resumePreview = !preview.paused;
    preview.pause();
    dialog.showModal();
    full.play().catch(() => {});
  });

  function close() {
    if (dialog.open) dialog.close();
  }
  closeBtn.addEventListener("click", close);

  // Clicking the dark area outside the video closes it too
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close();
  });

  // Runs however the pop-up closes (button, backdrop click or Escape)
  dialog.addEventListener("close", () => {
    full.pause();
    if (resumePreview) preview.play().catch(() => {});
  });
})();