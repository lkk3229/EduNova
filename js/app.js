/* ============================================
   EduNova — Main JavaScript
   ============================================ */

// Inject responsive stylesheet + iOS / mobile meta tags as early as possible
(function injectResponsiveAssets() {
    try {
        const head = document.head || document.getElementsByTagName('head')[0];
        if (!head) return;

        // Stylesheet
        if (!document.querySelector('link[data-edu-responsive]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/responsive.css';
            link.setAttribute('data-edu-responsive', '');
            head.appendChild(link);
        }

        // Upgrade viewport for iOS safe-area / notch
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';

        // Theme color (Android Chrome address bar)
        const ensureMeta = (name, content, isProperty) => {
            const sel = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
            let m = document.querySelector(sel);
            if (!m) {
                m = document.createElement('meta');
                if (isProperty) m.setAttribute('property', name); else m.setAttribute('name', name);
                head.appendChild(m);
            }
            m.setAttribute('content', content);
        };
        ensureMeta('theme-color', '#0a0b14');
        ensureMeta('color-scheme', 'dark');
        ensureMeta('apple-mobile-web-app-capable', 'yes');
        ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
        ensureMeta('mobile-web-app-capable', 'yes');
        ensureMeta('format-detection', 'telephone=no');
    } catch (e) { /* no-op */ }
})();

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavbar();
    initMobileMenu();
    injectLibraryNavigation();
    injectEnglishSpeakingNavigation();
    initScrollReveal();
    initCounters();
    initSessionNavbar();
    initResponsiveHelpers();
});

/* ---- Responsive helpers: 100vh fix, sidebar backdrop, modal scroll-lock ---- */
function initResponsiveHelpers() {
    // True viewport height (--app-vh) for mobile browsers with dynamic toolbars
    const setVh = () => {
        document.documentElement.style.setProperty('--app-vh', `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener('resize', setVh, { passive: true });
    window.addEventListener('orientationchange', setVh);

    // Sidebar backdrop + body scroll-lock + click-outside-to-close
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        let backdrop = document.querySelector('.sidebar-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            document.body.appendChild(backdrop);
        }
        const close = () => {
            sidebar.classList.remove('open');
            backdrop.classList.remove('active');
            document.body.classList.remove('no-scroll');
        };
        // React to open class changes via MutationObserver
        const mo = new MutationObserver(() => {
            const isOpen = sidebar.classList.contains('open');
            backdrop.classList.toggle('active', isOpen);
            document.body.classList.toggle('no-scroll', isOpen);
        });
        mo.observe(sidebar, { attributes: true, attributeFilter: ['class'] });

        backdrop.addEventListener('click', close);

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) close();
        });

        // Auto-close when a nav link is tapped on mobile
        sidebar.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 1024) setTimeout(close, 150);
            });
        });
    }

    // Lock body scroll when any .modal-overlay becomes active
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        const mo = new MutationObserver(() => {
            const anyActive = !!document.querySelector('.modal-overlay.active');
            document.body.classList.toggle('no-scroll', anyActive || document.getElementById('sidebar')?.classList.contains('open'));
        });
        mo.observe(modal, { attributes: true, attributeFilter: ['class'] });
    });
}

function injectLibraryNavigation() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks || navLinks.querySelector('a[href="library.html"]')) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const item = document.createElement('li');
    item.innerHTML = `<a href="library.html"${currentPage === 'library.html' ? ' class="active"' : ''}>Library</a>`;

    const coursesLink = navLinks.querySelector('a[href="courses.html"]')?.parentElement;
    if (coursesLink) {
        coursesLink.insertAdjacentElement('afterend', item);
    } else {
        navLinks.appendChild(item);
    }
}

function injectEnglishSpeakingNavigation() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks || navLinks.querySelector('a[href="english-speaking.html"]')) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const item = document.createElement('li');
    item.innerHTML = `<a href="english-speaking.html"${currentPage === 'english-speaking.html' ? ' class="active"' : ''}>English Speaking</a>`;

    const libraryLink = navLinks.querySelector('a[href="library.html"]')?.parentElement;
    if (libraryLink) {
        libraryLink.insertAdjacentElement('afterend', item);
        return;
    }

    const coursesLink = navLinks.querySelector('a[href="courses.html"]')?.parentElement;
    if (coursesLink) {
        coursesLink.insertAdjacentElement('afterend', item);
    } else {
        navLinks.appendChild(item);
    }
}

/* ---- Preloader ---- */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.remove(), 500);
        }, 1500);
    });

    // Fallback: hide after 3 seconds max
    setTimeout(() => {
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => { if (preloader.parentNode) preloader.remove(); }, 500);
        }
    }, 3000);
}

/* ---- Navbar Scroll Effect ---- */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        toggle.classList.toggle('active');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            toggle.classList.remove('active');
        });
    });
}

/* ---- Scroll Reveal ---- */
function initScrollReveal() {
    const elements = document.querySelectorAll('.feature-card, .step-card, .course-card, .testimonial-card, .contact-item, .edu-level-card, .category-card');

    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal', 'visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

/* ---- Animated Counters ---- */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'), 10);
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        const current = Math.floor(eased * target);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }

    requestAnimationFrame(update);
}

/* ---- Smooth Scroll for anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* ---- Contact Form ---- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        contactForm.reset();
    });
}

/* ---- Notification System ---- */
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;

    // Add styles inline since it's a dynamic element
    Object.assign(toast.style, {
        position: 'fixed',
        top: '24px',
        right: '24px',
        padding: '16px 20px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '99999',
        animation: 'fadeInUp 0.3s ease',
        maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)'
    });

    const colors = {
        success: { bg: 'rgba(0, 184, 148, 0.15)', border: 'rgba(0, 184, 148, 0.3)', color: '#00b894' },
        error: { bg: 'rgba(214, 48, 49, 0.15)', border: 'rgba(214, 48, 49, 0.3)', color: '#d63031' },
        warning: { bg: 'rgba(253, 203, 110, 0.15)', border: 'rgba(253, 203, 110, 0.3)', color: '#fdcb6e' },
        info: { bg: 'rgba(102, 126, 234, 0.15)', border: 'rgba(102, 126, 234, 0.3)', color: '#667eea' }
    };

    const c = colors[type];
    toast.style.background = c.bg;
    toast.style.border = `1px solid ${c.border}`;
    toast.style.color = c.color;

    const closeBtn = toast.querySelector('button');
    Object.assign(closeBtn.style, {
        background: 'none',
        border: 'none',
        color: c.color,
        cursor: 'pointer',
        fontSize: '16px',
        marginLeft: '8px'
    });

    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

/* ---- Toggle Password Visibility ---- */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const btn = input.parentElement.querySelector('.toggle-password i');
    if (input.type === 'password') {
        input.type = 'text';
        btn.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        btn.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

/* ---- Session-Aware Navbar ---- */
const SESSION_MAX_HOURS = 3;

function getValidSession() {
    try {
        const raw = localStorage.getItem('edunova_session');
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (!session || !session.loggedIn) return null;

        // Check 3-hour expiry
        if (session.loginTime) {
            const elapsed = Date.now() - new Date(session.loginTime).getTime();
            if (elapsed > SESSION_MAX_HOURS * 60 * 60 * 1000) {
                localStorage.removeItem('edunova_session');
                return null;
            }
        }
        return session;
    } catch (e) {
        return null;
    }
}

function initSessionNavbar() {
    const navActions = document.querySelector('.nav-actions');
    const session = getValidSession();

    // Always init topbar dropdown (dashboard pages)
    initTopbarDropdown();

    if (!navActions || !session) return; // keep default logged-out buttons on public pages

    // Determine dashboard URL
    const dashboardUrls = {
        admin: 'admin.html',
        teacher: 'teacher-dashboard.html',
        student: 'student-dashboard.html'
    };
    const dashUrl = dashboardUrls[session.role] || 'student-dashboard.html';

    // Get initials from name
    const nameParts = (session.name || 'U').split(' ');
    const initials = nameParts.map(p => p.charAt(0).toUpperCase()).join('').substring(0, 2);

    // Replace nav-actions with logged-in state (keep mobile toggle)
    const mobileToggle = navActions.querySelector('.mobile-toggle');

    navActions.innerHTML = `
        <a href="${dashUrl}" class="btn btn-outline-light btn-sm">
            <i class="fas fa-tachometer-alt"></i> Dashboard
        </a>
        <div class="nav-user-menu" id="navUserMenu">
            <button class="nav-user-btn" id="navUserBtn">
                <div class="nav-avatar">${initials}</div>
                <span class="nav-user-name">${session.name}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="nav-dropdown" id="navDropdown">
                <div class="nav-dropdown-header">
                    <strong>${session.name}</strong>
                    <span>${session.role.charAt(0).toUpperCase() + session.role.slice(1)}</span>
                </div>
                <a href="${dashUrl}"><i class="fas fa-tachometer-alt"></i> My Dashboard</a>
                <a href="library.html"><i class="fas fa-book-open"></i> Library</a>
                <a href="english-speaking.html"><i class="fas fa-microphone-lines"></i> English Speaking</a>
                <a href="courses.html"><i class="fas fa-book-open"></i> Browse Courses</a>
                <div class="nav-dropdown-divider"></div>
                <a href="#" id="navLogoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        </div>
    `;

    // Re-append mobile toggle if it existed
    if (mobileToggle) navActions.appendChild(mobileToggle);

    // Toggle dropdown
    const userBtn = document.getElementById('navUserBtn');
    const dropdown = document.getElementById('navDropdown');
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));

    // Logout
    document.getElementById('navLogoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('edunova_session');
        showNotification('Logged out successfully.', 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    });
}

/* ---- Dashboard Topbar Dropdown ---- */
function initTopbarDropdown() {
    const topbarBtn = document.getElementById('topbarUserBtn');
    const topbarDropdown = document.getElementById('topbarDropdown');
    if (!topbarBtn || !topbarDropdown) return;

    topbarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        topbarDropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => topbarDropdown.classList.remove('open'));
}
