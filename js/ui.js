/**
 * UI Utilities and Navigation for Life OS
 */

const UI = {
    init() {
        this.setupNavigation();
        this.setupThemeToggle();
        this.updateCurrentDate();
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const views = document.querySelectorAll('.view');
        const pageTitle = document.getElementById('page-title');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active nav
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                // Update view
                const viewId = `view-${item.dataset.view}`;
                views.forEach(v => {
                    if (v.id === viewId) {
                        v.classList.add('active');
                        v.classList.remove('hidden');
                    } else {
                        v.classList.remove('active');
                        v.classList.add('hidden');
                    }
                });

                // Update Title
                pageTitle.textContent = item.querySelector('span').textContent;
            });
        });
    },

    setupThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        const icon = toggleBtn.querySelector('i');
        const root = document.documentElement;

        // Load saved theme
        const savedTheme = window.Storage.get(window.STORAGE_KEYS.THEME) || 'dark';
        if (savedTheme === 'light') {
            root.setAttribute('data-theme', 'light');
            icon.classList.replace('ph-moon', 'ph-sun');
        }

        toggleBtn.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme');
            if (currentTheme === 'light') {
                root.removeAttribute('data-theme');
                icon.classList.replace('ph-sun', 'ph-moon');
                window.Storage.set(window.STORAGE_KEYS.THEME, 'dark');
            } else {
                root.setAttribute('data-theme', 'light');
                icon.classList.replace('ph-moon', 'ph-sun');
                window.Storage.set(window.STORAGE_KEYS.THEME, 'light');
            }
        });
    },

    updateCurrentDate() {
        const dateEl = document.getElementById('current-date');
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    },

    // Modal Helpers
    openModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
};

window.UI = UI;
