
/* NAVBAR SCROLL BACKGROUND */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
});


/* MEGA MENU */
const triggers = document.querySelectorAll('.nav-trigger');
const megaMenu = document.getElementById('megaMenu');
const megaLinks = document.getElementById('megaLinks');
const megaLabel = document.getElementById('megaLabel');

const menuData = {
    about: {
        label: 'GET TO KNOW ME',
        links: [
            'About me',
            'Qualifications',
            'Skills',
            'Gallery'
        ]
    },
    contact: {
        label: 'LET’S CONNECT',
        links: [
            'LinkedIn',
            'Email',
            'Cell',
            'WhatsApp'
        ]
    }
};

let activeMenu = null;
let closeTimer;
let linkFadeTimer;

function createArrow() {
    return `
        <svg viewBox="0 0 24 24">
            <path d="M7 17L17 7M7 7H17V17"/>
        </svg>
    `;
}

function openMenu(menu) {
    clearTimeout(closeTimer);
    clearTimeout(linkFadeTimer);

    if (activeMenu === menu && megaMenu.classList.contains('open')) {
        return;
    }

    activeMenu = menu;

    const data = menuData[menu];
    const isSwitching = navbar.classList.contains('menu-open');

    if (isSwitching) {
        megaLinks.classList.add('is-switching');

        linkFadeTimer = setTimeout(() => {
            updateMegaContent(data);
            requestAnimationFrame(() => {
                megaLinks.classList.remove('is-switching');
            });
        }, 180);
    } else {
        updateMegaContent(data);
        megaLinks.classList.add('is-switching');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                megaLinks.classList.remove('is-switching');
            });
        });
    }

    navbar.classList.add('menu-open');

    triggers.forEach(trigger => {
        trigger.classList.toggle('active', trigger.dataset.menu === menu);
    });

    megaMenu.classList.add('open');
}

function updateMegaContent(data) {
    megaLabel.textContent = data.label;
    megaLinks.innerHTML = data.links.map(link => {
    const href = link === 'About me' ? '#about' : '#';

    return `
        <a href="${href}" class="mega-link">
            <span>${link}</span>
            ${createArrow()}
        </a>
    `;
}).join('');
}

function closeMenu() {
    closeTimer = setTimeout(() => {
        clearTimeout(linkFadeTimer);
        activeMenu = null;
        navbar.classList.remove('menu-open');
        megaMenu.classList.remove('open');

        triggers.forEach(trigger => {
            trigger.classList.remove('active');
        });
    }, 180);
}

triggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', () => {
        openMenu(trigger.dataset.menu);
    });

    trigger.addEventListener('click', () => {
        if (activeMenu === trigger.dataset.menu && navbar.classList.contains('menu-open')) {
            clearTimeout(closeTimer);
            closeMenu();
        } else {
            openMenu(trigger.dataset.menu);
        }
    });
});

navbar.addEventListener('mouseleave', closeMenu);

navbar.addEventListener('mouseenter', () => {
    clearTimeout(closeTimer);
});


/* HERO SCROLL ANIMATION */
const hero = document.getElementById('hero');
const heroWrapper = document.getElementById('heroWrapper');

function animateHero() {
    const wrapperRect = heroWrapper.getBoundingClientRect();
    const scrollDistance = heroWrapper.offsetHeight - window.innerHeight;

    const progress = Math.min(
        Math.max(-wrapperRect.top / scrollDistance, 0),
        1
    );

    const easedProgress = progress * progress * (3 - 2 * progress);

    const margin = 30 * easedProgress;
    const scale = 1 - (0.06 * easedProgress);
    const radius = 0 + (24 * easedProgress);

    hero.style.width = `calc(100% - ${margin * 2}px)`;
    hero.style.height = `calc(100vh - ${margin * 2}px)`;
    hero.style.top = `${margin}px`;
    hero.style.borderRadius = `${radius}px`;
    hero.style.transform = `scale(${scale})`;
}

let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            animateHero();
            ticking = false;
        });

        ticking = true;
    }
}, { passive: true });

window.addEventListener('resize', animateHero);

animateHero();


/* ABOUT GALLERY SCROLL ANIMATION */
const aboutSection = document.getElementById('about');
const aboutCards = {
    left: document.querySelector('.about-card-left'),
    center: document.querySelector('.about-card-center'),
    right: document.querySelector('.about-card-right')
};

function animateAbout() {
    if (!aboutSection) return;

    const rect = aboutSection.getBoundingClientRect();
    const scrollDistance = aboutSection.offsetHeight - window.innerHeight;

    const progress = Math.min(
        Math.max(-rect.top / scrollDistance, 0),
        1
    );

    // Smooth easing
    const eased = progress * progress * (3 - 2 * progress);

    // Card separation
    const cardWidth = aboutCards.center.offsetWidth;
    const gap = window.innerWidth <= 768 ? 12 : 30;
    const distance = cardWidth + gap;

    // Left card
    aboutCards.left.style.transform = `
        translate3d(calc(-50% - ${distance * eased}px), -50%, 0)
        rotate(${-5 + (5 * eased)}deg)
    `;

    // Right card
    aboutCards.right.style.transform = `
        translate3d(calc(-50% + ${distance * eased}px), -50%, 0)
        rotate(${5 - (5 * eased)}deg)
    `;

    // Outer card visibility
    aboutCards.left.style.opacity = 0.55 + (0.45 * eased);
    aboutCards.right.style.opacity = 0.55 + (0.45 * eased);

    // Outer card scale
    const sideScale = 0.92 + (0.08 * eased);

    aboutCards.left.style.scale = sideScale;
    aboutCards.right.style.scale = sideScale;
}

let aboutTicking = false;

function requestAboutAnimation() {
    if (!aboutTicking) {
        window.requestAnimationFrame(() => {
            animateAbout();
            aboutTicking = false;
        });

        aboutTicking = true;
    }
}

window.addEventListener('scroll', requestAboutAnimation, { passive: true });
window.addEventListener('resize', requestAboutAnimation);

animateAbout();
