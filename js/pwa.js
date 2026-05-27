/* ============================================
   EduNova — PWA Registration & App Install
   Handles Android "Add to Home Screen" prompt
   and iOS install instructions
   ============================================ */

(function () {
    'use strict';

    // ---- Register Service Worker ----
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js')
                .then(reg => {
                    console.log('[EduNova PWA] Service Worker registered. Scope:', reg.scope);
                })
                .catch(err => {
                    console.warn('[EduNova PWA] Service Worker registration failed:', err);
                });
        });
    }

    // ---- Android / Chrome "Add to Home Screen" prompt ----
    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        deferredPrompt = event;

        // Show all Android install buttons now that install is available
        const androidBtns = document.querySelectorAll('.pwa-install-android');
        androidBtns.forEach(btn => {
            btn.style.display = 'flex';
            btn.classList.add('pwa-available');
        });

        // Show the floating install banner (if present)
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) {
            banner.classList.add('pwa-banner-visible');
        }
    });

    // Triggered when user clicks any Android install button
    window.installPWA = function () {
        if (!deferredPrompt) {
            // Already installed or not supported — show guidance
            showInstallGuide('android');
            return;
        }
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') {
                console.log('[EduNova PWA] User accepted install');
                trackAppInstall('android');
                hidePWABanner();
            } else {
                console.log('[EduNova PWA] User dismissed install prompt');
            }
            deferredPrompt = null;
        });
    };

    // iOS install instructions (no programmatic prompt available on iOS)
    window.showIOSInstall = function () {
        showInstallGuide('ios');
    };

    function showInstallGuide(platform) {
        const modal = document.getElementById('pwaInstallModal');
        const androidSteps = document.getElementById('pwaAndroidSteps');
        const iosSteps = document.getElementById('pwaIOSSteps');
        if (!modal) return;

        if (androidSteps) androidSteps.style.display = platform === 'android' ? 'block' : 'none';
        if (iosSteps) iosSteps.style.display = platform === 'ios' ? 'block' : 'none';

        modal.classList.add('pwa-modal-open');
        document.body.style.overflow = 'hidden';
    }

    window.closePWAModal = function () {
        const modal = document.getElementById('pwaInstallModal');
        if (modal) modal.classList.remove('pwa-modal-open');
        document.body.style.overflow = '';
    };

    function hidePWABanner() {
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.classList.remove('pwa-banner-visible');
    }

    function trackAppInstall(platform) {
        // Simple install counter via localStorage
        try {
            const key = 'edunova_pwa_installed';
            localStorage.setItem(key, JSON.stringify({ platform, date: new Date().toISOString() }));
        } catch (e) { /* ignore */ }
    }

    // Close modal on outside click
    document.addEventListener('click', e => {
        const modal = document.getElementById('pwaInstallModal');
        if (modal && e.target === modal) {
            window.closePWAModal();
        }
    });

    // Close floating banner
    window.dismissPWABanner = function () {
        hidePWABanner();
        sessionStorage.setItem('edunova_pwa_banner_dismissed', '1');
    };

    // Don't re-show banner if dismissed this session
    window.addEventListener('DOMContentLoaded', () => {
        if (sessionStorage.getItem('edunova_pwa_banner_dismissed')) {
            hidePWABanner();
        }
        // Detect if already running as installed PWA
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            document.body.classList.add('pwa-installed');
        }
    });

    // Fired when app is successfully installed
    window.addEventListener('appinstalled', () => {
        console.log('[EduNova PWA] App installed!');
        deferredPrompt = null;
        hidePWABanner();
        // Show a brief success toast
        if (window.showToast) {
            window.showToast('EduNova app installed! 🎉 Find it on your home screen.', 'success');
        }
    });

})();
