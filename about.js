(() => {
  // Fade the founder photo in once it has loaded
  const image = document.querySelector(".founder__image");
  if (!image) return;

  const show = () => image.classList.add("is-loaded");

  if (image.complete) {
    show();
  } else {
    image.addEventListener("load", show, { once: true });
    image.addEventListener("error", show, { once: true }); // never leave the card blank
  }
})();

(() => {
  const root = document.querySelector("[data-careers]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const jobs = Array.from(root.querySelectorAll("[data-department]"));
  const empty = root.querySelector("[data-empty]");
  const panel = root.querySelector('[role="tabpanel"]');

  function select(tab, moveFocus) {
    const department = tab.dataset.filter;

    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tab.id);

    let visible = 0;
    jobs.forEach((job) => {
      const match = department === "all" || job.dataset.department === department;
      job.hidden = !match;
      if (match) visible += 1;
    });
    empty.hidden = visible > 0; // empty state when a department has no roles

    if (moveFocus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));

    // Arrow keys, Home and End move between tabs
    tab.addEventListener("keydown", (e) => {
      const target = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (target === undefined) return;
      e.preventDefault();
      select(tabs[(target + tabs.length) % tabs.length], true);
    });
  });

  select(tabs[0]);
})();

(() => {
  const root = document.querySelector("[data-templates]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const items = Array.from(root.querySelectorAll("[data-category]"));
  const panel = root.querySelector('[role="tabpanel"]');

  function select(tab, moveFocus) {
    const category = tab.dataset.filter;

    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tab.id);

    items.forEach((item) => {
      item.hidden = !(category === "all" || item.dataset.category === category);
    });

    if (moveFocus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));

    // Arrow keys, Home and End move between tabs
    tab.addEventListener("keydown", (e) => {
      const target = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (target === undefined) return;
      e.preventDefault();
      select(tabs[(target + tabs.length) % tabs.length], true);
    });
  });

  select(tabs[0]);
})();

(() => {
  const root = document.querySelector("[data-blog]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const posts = Array.from(root.querySelectorAll("[data-category]"));
  const empty = root.querySelector("[data-empty]");
  const panel = root.querySelector('[role="tabpanel"]');

  const matches = (post, category) => category === "all" || post.dataset.category === category;

  // Fill in each tab's post count automatically
  tabs.forEach((tab) => {
    const count = posts.filter((post) => matches(post, tab.dataset.filter)).length;
    tab.querySelector("[data-count]").textContent = count;
  });

  function select(tab, moveFocus) {
    const category = tab.dataset.filter;

    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tab.id);

    let visible = 0;
    posts.forEach((post) => {
      const show = matches(post, category);
      post.hidden = !show;
      if (show) visible += 1;
    });
    empty.hidden = visible > 0;

    if (moveFocus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));

    // Arrow keys, Home and End move between tabs
    tab.addEventListener("keydown", (e) => {
      const target = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (target === undefined) return;
      e.preventDefault();
      select(tabs[(target + tabs.length) % tabs.length], true);
    });
  });

  select(tabs[0]);
})();

(() => {
  const root = document.querySelector("[data-accordion]");
  if (!root) return;

  const items = Array.from(root.querySelectorAll(".fa-item"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SETTLE = 650; // ms, a little longer than the open/close animation
  let scrollTimer;

  // "#accounting" and "#accounting/" both work
  function idFromHash() {
    try {
      return decodeURIComponent(location.hash.slice(1)).replace(/\/+$/, "");
    } catch {
      return "";
    }
  }

  function setOpen(item, open) {
    item.classList.toggle("is-open", open);
    item.querySelector(".fa-trigger").setAttribute("aria-expanded", String(open));
  }

  // Opening one item closes all the others
  function openOnly(item) {
    items.forEach((other) => setOpen(other, other === item));
  }

  function setUrl(url) {
    try { history.replaceState(null, "", url); } catch { /* some environments block this */ }
  }

  // After the layout settles, scroll the opened item into view if it ended up off screen
  function bringIntoView(item) {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const top = item.getBoundingClientRect().top;
      const offset = parseFloat(getComputedStyle(item).scrollMarginTop) || 0;
      if (top < offset - 1 || top > window.innerHeight * 0.7) {
        item.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      }
    }, SETTLE);
  }

  // Click: open the item, or close it if it's already open
  items.forEach((item) => {
    item.querySelector(".fa-trigger").addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      items.forEach((other) => setOpen(other, other === item && willOpen));

      if (willOpen) {
        setUrl(`#${item.id}`); // the address bar becomes a shareable link
        bringIntoView(item);
      } else {
        setUrl(location.pathname + location.search);
      }
    });
  });

  // Page load: open the feature named in the link, or the first one, without animating
  const first = items.find((item) => item.id === idFromHash());
  root.classList.add("is-instant");
  openOnly(first || items[0]);
  if (first) first.scrollIntoView({ behavior: "auto", block: "start" });
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("is-instant")));

  // Once images and fonts have loaded, make sure a shared link still lands on its feature
  window.addEventListener("load", () => {
    if (first) first.scrollIntoView({ behavior: "auto", block: "start" });
  });

  // The link changes while the page is open (for example from a link elsewhere on the page)
  window.addEventListener("hashchange", () => {
    const target = items.find((item) => item.id === idFromHash());
    if (!target) return;
    openOnly(target);
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    }, SETTLE);
  });
})();

(() => {
  const root = document.querySelector("[data-fs]");
  if (!root) return;

  const items = Array.from(root.querySelectorAll("[data-fs-item]"));
  const images = Array.from(root.querySelectorAll("[data-fs-img]"));
  let current = -1;

  function setActive(index) {
    if (index === current || index < 0) return;
    current = index;
    items.forEach((item, i) => item.classList.toggle("is-active", i === index));
    images.forEach((img, i) => img.classList.toggle("is-active", i === index));
  }

  // The feature crossing the middle of the screen is the active one
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(items.indexOf(entry.target));
    });
  }, { rootMargin: "-49% 0px -49% 0px" });

  items.forEach((item) => observer.observe(item));

  setActive(0);
})();

(() => {
  const root = document.querySelector("[data-guides]");
  if (!root) return;

  const items = Array.from(root.querySelectorAll(".guide"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SETTLE = 650; // ms, a little longer than the open/close animation
  let scrollTimer;

  // "#seo" and "#seo/" both work
  function idFromHash() {
    try {
      return decodeURIComponent(location.hash.slice(1)).replace(/\/+$/, "");
    } catch {
      return "";
    }
  }

  function setOpen(item, open) {
    item.classList.toggle("is-open", open);
    item.querySelector(".guide__trigger").setAttribute("aria-expanded", String(open));
  }

  // Opening one guide closes all the others
  function openOnly(item) {
    items.forEach((other) => setOpen(other, other === item));
  }

  function setUrl(url) {
    try { history.replaceState(null, "", url); } catch { /* some environments block this */ }
  }

  // After the layout settles, scroll the opened guide into view if it ended up off screen
  function bringIntoView(item) {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const top = item.getBoundingClientRect().top;
      const offset = parseFloat(getComputedStyle(item).scrollMarginTop) || 0;
      if (top < offset - 1 || top > window.innerHeight * 0.7) {
        item.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      }
    }, SETTLE);
  }

  // Click: open the guide, or close it if it's already open
  items.forEach((item) => {
    item.querySelector(".guide__trigger").addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      items.forEach((other) => setOpen(other, other === item && willOpen));

      if (willOpen) {
        setUrl(`#${item.id}`); // the address bar becomes a shareable link
        bringIntoView(item);
      } else {
        setUrl(location.pathname + location.search);
      }
    });
  });

  // Page load: open the guide named in the link, or the first one, without animating
  const linked = items.find((item) => item.id === idFromHash());
  root.classList.add("is-instant");
  openOnly(linked || items[0]);
  if (linked) linked.scrollIntoView({ behavior: "auto", block: "start" });
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("is-instant")));

  // Once images and fonts have loaded, make sure a shared link still lands on its guide
  window.addEventListener("load", () => {
    if (linked) linked.scrollIntoView({ behavior: "auto", block: "start" });
  });

  // The link changes while the page is open (for example from a link elsewhere on the page)
  window.addEventListener("hashchange", () => {
    const target = items.find((item) => item.id === idFromHash());
    if (!target) return;
    openOnly(target);
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    }, SETTLE);
  });
})();