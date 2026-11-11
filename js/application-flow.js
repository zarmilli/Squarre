// Application flow: steps through the role details, then reveals the form.
// The form itself (validation, upload, submission) is handled by applications.js.

(() => {
  const form = document.getElementById("applicationForm");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll("[data-step]"));
  const segments = Array.from(form.querySelectorAll("[data-progress] span"));
  const count = form.querySelector("[data-count]");
  const backButton = document.getElementById("backButton");
  const continueButton = document.getElementById("continueButton");
  const submitButton = document.getElementById("submitButton");
  const message = document.getElementById("formMessage");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const OUT_MS = 320; // current step fades out and slides away
  const IN_MS = 520;  // next step slides in and fades in

  let index = 0;
  let busy = false;

  // Progress, step count and which buttons are showing
  function updateControls() {
    const last = index === steps.length - 1;

    segments.forEach((segment, i) => segment.classList.toggle("is-done", i <= index));
    count.textContent = `Step ${index + 1} of ${steps.length}`;

    // The back chevron splits off from the main button from step 2 onwards
    const showBack = index > 0;
    backButton.classList.toggle("is-visible", showBack);
    backButton.inert = !showBack;
    backButton.setAttribute("aria-hidden", String(!showBack));

    // The last step swaps Continue for Submit
    continueButton.hidden = last;
    submitButton.hidden = !last;
  }

  async function go(target) {
    if (busy || target === index || target < 0 || target >= steps.length) return;
    busy = true;

    // Forward: the old step slides up and the new one rises from below. Back is the reverse.
    const direction = target > index ? 1 : -1;
    const from = steps[index];
    const next = steps[target];

    if (!reduceMotion.matches) {
      try {
        await from.animate(
          [
            { opacity: 1, transform: "translateY(0)" },
            { opacity: 0, transform: `translateY(${-16 * direction}px)` }
          ],
          { duration: OUT_MS, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" }
        ).finished;
      } catch { /* animation was cancelled; carry on */ }
    }

    from.hidden = true;
    from.getAnimations().forEach((animation) => animation.cancel());

    index = target;
    next.hidden = false;
    window.scrollTo(0, 0);
    updateControls();

    if (!reduceMotion.matches) {
      next.animate(
        [
          { opacity: 0, transform: `translateY(${28 * direction}px)` },
          { opacity: 1, transform: "translateY(0)" }
        ],
        { duration: IN_MS, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
      );
    }

    // Move focus to the new heading so keyboard and screen reader users follow along
    const heading = next.querySelector(".step__title");
    if (heading) heading.focus({ preventScroll: true });

    busy = false;
  }

  continueButton.addEventListener("click", () => go(index + 1));
  backButton.addEventListener("click", () => go(index - 1));

  // The Submit button sits in the sticky bar, so bring any message from applications.js into view
  if (message) {
    new MutationObserver(() => {
      if (message.textContent.trim()) {
        message.scrollIntoView({ block: "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" });
      }
    }).observe(message, { childList: true, characterData: true, subtree: true });
  }

  updateControls();
})();