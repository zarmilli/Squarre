class CardNav extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;

    const shadow = this.attachShadow({ mode: 'open' });
    const scriptSrc =
      document.currentScript?.src ||
      document.querySelector('script[src$="card-nav.js"]')?.src ||
      window.location.href;
    const assetHref = (path) => new URL(path, scriptSrc).href;
    const cssHref = this.getAttribute('css-path') || assetHref('card-nav.css');
    const pagePrefix = window.location.pathname.includes('/blogs/') ? '../' : '';
    const resolvePageHref = (href) => {
      if (/^(?:[a-z]+:|\/|#)/i.test(href)) return href;
      return `${pagePrefix}${href}`;
    };

    const homeHref = resolvePageHref(this.getAttribute('home-href') || 'index.html');
    const logoSrc = this.getAttribute('logo-src') || assetHref('assets/logo.png');
    const brandName = this.getAttribute('brand-name') || 'Squarredesk';
    const ctaHref = this.getAttribute('cta-href') || 'https://squarredesk.vercel.app/#/auth/sign-up';
    const ctaLabel = this.getAttribute('cta-label') || 'Get started';
    const loginHref = this.getAttribute('login-href') || 'https://squarredesk.vercel.app/#/auth/sign-in';
    const loginLabel = this.getAttribute('login-label') || 'Log in';

    this._menus = {
      product: {
        label: 'PRODUCT',
        image: assetHref('assets/test3.png'),
        imageAlt: 'Squarredesk product',
        links: [
          { label: 'Features', href: resolvePageHref('features.html') },
          { label: 'Pricing', href: resolvePageHref('pricing.html') },
          { label: 'Updates', href: resolvePageHref('updates.html') },
        ],
      },
      company: {
        label: 'COMPANY',
        image: assetHref('assets/team2.png'),
        imageAlt: 'Squarredesk company',
        links: [
          { label: 'About', href: resolvePageHref('about.html') },
          { label: 'Careers', href: resolvePageHref('careers.html') },
          { label: 'Contact', href: resolvePageHref('contact.html') },
        ],
      },
      resources: {
        label: 'RESOURCES',
        image: assetHref('assets/testimonial1.png'),
        imageAlt: 'Squarredesk resources',
        links: [
          { label: 'Templates', href: resolvePageHref('templates.html') },
          { label: 'Blog', href: resolvePageHref('blog.html') },
          { label: 'Support', href: resolvePageHref('support.html') },
        ],
      },
    };

    const arrowSvg = `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 17L17 7M7 7H17V17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

    const mobileMenus = Object.entries(this._menus)
      .map(
        ([key, menu]) => `
          <section class="cn-mobile-group" data-mobile-menu="${key}">
            <button class="cn-mobile-trigger" type="button" aria-expanded="false" aria-controls="cn-mobile-links-${key}">
              ${menu.label.charAt(0) + menu.label.slice(1).toLowerCase()}
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="m5 7.5 5 5 5-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="cn-mobile-links" id="cn-mobile-links-${key}">
              <div class="cn-mobile-links-inner">
                ${menu.links
                  .map((link) => `<a href="${link.href}">${link.label}${arrowSvg}</a>`)
                  .join('')}
              </div>
            </div>
          </section>`
      )
      .join('');

    shadow.innerHTML = `
      <link rel="stylesheet" href="${assetHref('fonts.css')}">
      <link rel="stylesheet" href="${cssHref}">
      <div class="cn-shell">
        <nav class="cn-nav" id="cardNav" aria-label="Main navigation">
          <div class="cn-bar">
            <a class="cn-brand" href="${homeHref}" aria-label="${brandName} home">
              <img src="${logoSrc}" alt="" class="cn-brand-mark">
              <span>${brandName}</span>
            </a>

            <div class="cn-desktop-links" aria-label="Site sections">
              ${Object.entries(this._menus)
                .map(
                  ([key, menu]) => `
                    <button class="cn-nav-trigger" type="button" data-nav-menu="${key}" aria-expanded="false" aria-controls="cnPanel">
                      ${menu.label.charAt(0) + menu.label.slice(1).toLowerCase()}
                    </button>`
                )
                .join('')}
            </div>

            <div class="cn-desktop-actions">
              <a class="cn-login" href="${loginHref}">${loginLabel}</a>
              <a class="cn-primary" href="${ctaHref}">${ctaLabel}</a>
            </div>

            <button class="cn-toggle" id="cnToggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="cnMobilePanel">
              <span class="cn-toggle-bar"></span>
              <span class="cn-toggle-bar"></span>
            </button>
          </div>

          <div class="cn-desktop-panel" id="cnPanel" aria-live="polite">
            <div class="cn-mega-content">
              <div class="cn-mega-column">
                <span class="cn-mega-label" id="cnMegaLabel">EXPLORE</span>
                <div class="cn-mega-links" id="cnMegaLinks"></div>
              </div>
              <div class="cn-mega-image">
                <img id="cnMegaImage" src="${this._menus.product.image}" alt="${this._menus.product.imageAlt}">
              </div>
            </div>
          </div>

          <aside class="cn-mobile-panel" id="cnMobilePanel" aria-label="Mobile navigation" aria-hidden="true">
            <div class="cn-mobile-groups">${mobileMenus}</div>
            <div class="cn-mobile-actions">
              <a class="cn-primary" href="${ctaHref}">${ctaLabel}</a>
              <a class="cn-login" href="${loginHref}">${loginLabel}</a>
            </div>
          </aside>
        </nav>
      </div>
    `;

    this._nav = shadow.getElementById('cardNav');
    this._megaLinks = shadow.getElementById('cnMegaLinks');
    this._megaLabel = shadow.getElementById('cnMegaLabel');
    this._megaImage = shadow.getElementById('cnMegaImage');
    this._activeMenu = null;
    this._closeTimer = null;
    this._linkFadeTimer = null;
    this._arrowSvg = arrowSvg;

    this._initMenus(shadow);
    this._initToggle(shadow);
    this._initThemeObserver();
  }

  _updateMegaContent(data) {
    this._megaLabel.textContent = data.label;
    this._megaImage.src = data.image;
    this._megaImage.alt = data.imageAlt;
    this._megaLinks.innerHTML = data.links
      .map(
        (link) => `
          <a href="${link.href}" class="cn-mega-link">
            <span>${link.label}</span>
            ${this._arrowSvg}
          </a>`
      )
      .join('');
  }

  _openDesktopMenu(menu, triggers) {
    clearTimeout(this._closeTimer);
    clearTimeout(this._linkFadeTimer);

    if (this._activeMenu === menu && this._nav.classList.contains('desktop-open')) {
      return;
    }

    this._activeMenu = menu;
    const data = this._menus[menu];
    const isSwitching = this._nav.classList.contains('desktop-open');

    if (isSwitching) {
      this._megaLinks.classList.add('is-switching');
      this._megaImage.classList.add('is-switching');

      this._linkFadeTimer = setTimeout(() => {
        this._updateMegaContent(data);
        requestAnimationFrame(() => {
          this._megaLinks.classList.remove('is-switching');
          this._megaImage.classList.remove('is-switching');
        });
      }, 180);
    } else {
      this._updateMegaContent(data);
      this._megaLinks.classList.add('is-switching');
      this._megaImage.classList.add('is-switching');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this._megaLinks.classList.remove('is-switching');
          this._megaImage.classList.remove('is-switching');
        });
      });
    }

    this._nav.dataset.activeMenu = menu;
    this._nav.classList.add('desktop-open', 'dropdown-open');
    triggers.forEach((trigger) => {
      const isActive = trigger.dataset.navMenu === menu;
      trigger.classList.toggle('active', isActive);
      trigger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });
  }

  _initMenus(shadow) {
    const triggers = [...shadow.querySelectorAll('.cn-nav-trigger')];
    const menus = [...shadow.querySelectorAll('.cn-mobile-group')];

    triggers.forEach((trigger) => {
      trigger.addEventListener('pointerenter', () => {
        this._openDesktopMenu(trigger.dataset.navMenu, triggers);
      });

      trigger.addEventListener('focus', () => {
        this._openDesktopMenu(trigger.dataset.navMenu, triggers);
      });

      trigger.addEventListener('click', () => {
        if (this._activeMenu === trigger.dataset.navMenu && this._nav.classList.contains('desktop-open')) {
          clearTimeout(this._closeTimer);
          this._closeDesktopMenu(triggers);
        } else {
          this._openDesktopMenu(trigger.dataset.navMenu, triggers);
        }
      });
    });

    this._nav.addEventListener('pointerleave', () => this._closeDesktopMenu(triggers));
    this._nav.addEventListener('pointerenter', () => clearTimeout(this._closeTimer));

    menus.forEach((group) => {
      const trigger = group.querySelector('.cn-mobile-trigger');
      trigger.addEventListener('click', () => {
        const isOpen = group.classList.toggle('open');
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        this._nav.classList.toggle(
          'dropdown-open',
          Boolean(shadow.querySelector('.cn-mobile-group.open'))
        );
      });
    });

    document.addEventListener('click', (event) => {
      if (event.composedPath().includes(this)) return;
      this._closeMenus(shadow);
    });

    this.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this._closeMenus(shadow);
    });
  }

  _closeDesktopMenu(triggers) {
    this._closeTimer = setTimeout(() => {
      clearTimeout(this._linkFadeTimer);
      this._activeMenu = null;
      this._nav.classList.remove('desktop-open', 'dropdown-open');
      this._nav.dataset.activeMenu = '';
      this._megaLinks.classList.remove('is-switching');
      this._megaImage.classList.remove('is-switching');
      triggers.forEach((trigger) => {
        trigger.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
      });
    }, 180);
  }

  _initToggle(shadow) {
    const toggle = shadow.getElementById('cnToggle');
    const panel = shadow.getElementById('cnMobilePanel');

    toggle.addEventListener('click', () => {
      const isOpen = this._nav.classList.toggle('mobile-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      if (!isOpen) this._closeMenus(shadow);
    });
  }

  _closeMenus(shadow) {
    clearTimeout(this._closeTimer);
    clearTimeout(this._linkFadeTimer);
    this._activeMenu = null;
    this._nav.classList.remove('desktop-open', 'mobile-open', 'dropdown-open');
    this._nav.dataset.activeMenu = '';
    this._megaLinks.classList.remove('is-switching');
    this._megaImage.classList.remove('is-switching');
    shadow.querySelectorAll('.cn-nav-trigger').forEach((trigger) => {
      trigger.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
    });
    shadow.querySelectorAll('.cn-mobile-group').forEach((group) => {
      group.classList.remove('open');
      group.querySelector('.cn-mobile-trigger').setAttribute('aria-expanded', 'false');
    });
    const toggle = shadow.getElementById('cnToggle');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    shadow.getElementById('cnMobilePanel').setAttribute('aria-hidden', 'true');
  }

  _initThemeObserver() {
    const sections = document.querySelectorAll('[data-theme]');
    if (!sections.length) return;

    const navHeight = 64;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          this._nav.classList.remove('theme-light', 'theme-hero');
          if (entry.target.dataset.theme === 'dark') this._nav.classList.add('theme-light');
          else if (entry.target.dataset.theme === 'hero') this._nav.classList.add('theme-hero');
        });
      },
      {
        root: null,
        rootMargin: `-${navHeight}px 0px -${window.innerHeight - navHeight - 10}px 0px`,
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));
  }
}

customElements.define('card-nav', CardNav);
