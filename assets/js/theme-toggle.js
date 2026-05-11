/**
 * Dark Theme Toggle for Roman Korol's Website
 * Handles theme switching with localStorage persistence
 */

(function() {
    'use strict';

    // Theme configuration
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark',
        AUTO: 'auto'
    };

    const STORAGE_KEY = 'romankorol-theme';

    /**
     * Get system theme preference
     */
    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
    }

    /**
     * Get saved theme preference
     */
    function getSavedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY) || THEMES.LIGHT;
        } catch (e) {
            return THEMES.LIGHT;
        }
    }

    /**
     * Save theme preference
     */
    function saveTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            console.warn('Unable to save theme preference');
        }
    }

    /**
     * Apply theme to document
     */
    function applyTheme(theme) {
        const html = document.documentElement;

        // Remove existing theme attributes
        html.removeAttribute('data-theme');

        if (theme === THEMES.AUTO) {
            // Let CSS media query handle auto theme
            // Don't set data-theme attribute
        } else {
            // Explicitly set theme
            html.setAttribute('data-theme', theme);
        }

        // Update toggle button if it exists
        updateToggleButton(theme);

        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: {
                theme: theme,
                effectiveTheme: getEffectiveTheme(theme)
            }
        }));
    }

    /**
     * Get the effective theme (what's actually being displayed)
     */
    function getEffectiveTheme(selectedTheme) {
        if (selectedTheme === THEMES.AUTO) {
            return getSystemTheme();
        }
        return selectedTheme;
    }

    /**
     * Cycle to next theme
     */
    function cycleTheme() {
        const currentTheme = getSavedTheme();
        let nextTheme;

        // Toggle between light and dark only
        if (currentTheme === THEMES.DARK) {
            nextTheme = THEMES.LIGHT;
        } else {
            nextTheme = THEMES.DARK;
        }

        saveTheme(nextTheme);
        applyTheme(nextTheme);
    }

    /**
     * Create theme toggle button
     */
    function createToggleButton() {
        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Toggle color theme');
        button.setAttribute('title', 'Toggle between light, dark, and auto themes');

        // Add button styles
        button.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: var(--toggle-bg, rgba(255, 255, 255, 0.9));
            border: 2px solid var(--toggle-border, #ddd);
            border-radius: 50%;
            width: 48px;
            height: 48px;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        `;

        // Add hover effect
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });

        // Add click handler
        button.addEventListener('click', cycleTheme);

        // Add keyboard support
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                cycleTheme();
            }
        });

        return button;
    }

    /**
     * Update toggle button appearance
     */
    function updateToggleButton(theme) {
        const button = document.querySelector('.theme-toggle');
        if (!button) return;

        let iconHTML, title;

        // Toggle between light and dark only - Using inline SVG for reliability
        if (theme === THEMES.DARK) {
            iconHTML = '<svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor"><path d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"/></svg>';
            title = 'Dark theme active. Click for light theme.';
        } else {
            iconHTML = '<svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor"><path d="M256 159.1c-53.02 0-95.1 42.98-95.1 95.1S202.1 351.1 256 351.1s95.1-42.98 95.1-95.1S309 159.1 256 159.1zM509.3 347L446.1 255.1l63.15-91.01c6.332-9.125 1.104-21.74-9.826-23.72l-109.6-19.86l-19.86-109.6c-1.977-10.93-14.59-16.16-23.72-9.826L255.1 65.89L164.1 2.736c-9.125-6.332-21.74-1.107-23.72 9.826L121.6 122.6L11.97 142.4C1.042 144.4-4.189 157.8 2.142 166.8L65.89 255.1L2.142 347c-6.332 9.125-1.105 21.74 9.826 23.72l109.6 19.86l19.86 109.6c1.977 10.93 14.59 16.16 23.72 9.826l91.01-63.15l91.01 63.15c9.127 6.334 21.75 1.107 23.72-9.826l19.86-109.6l109.6-19.86C510.4 368.8 515.6 355.1 509.3 347zM256 383.1c-70.69 0-127.1-57.31-127.1-127.1c0-70.69 57.31-127.1 127.1-127.1s127.1 57.3 127.1 127.1C383.1 326.7 326.7 383.1 256 383.1z"/></svg>';
            title = 'Light theme active. Click for dark theme.';
        }

        button.innerHTML = iconHTML;
        button.setAttribute('title', title);
        button.setAttribute('aria-label', title);
    }

    /**
     * Add CSS custom properties for theme toggle
     */
    function addToggleStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .theme-toggle {
                --toggle-bg: rgba(255, 255, 255, 0.9);
                --toggle-border: #ddd;
                color: #2a2a2a;
            }

            .theme-toggle i {
                color: inherit;
            }

            [data-theme="dark"] .theme-toggle {
                --toggle-bg: rgba(42, 42, 42, 0.9);
                --toggle-border: #444;
                color: #e0e0e0;
            }

            @media (prefers-color-scheme: dark) {
                body:not([data-theme="light"]) .theme-toggle {
                    --toggle-bg: rgba(42, 42, 42, 0.9);
                    --toggle-border: #444;
                    color: #e0e0e0;
                }
            }

            .theme-toggle:focus {
                outline: 2px solid #4a9eff;
                outline-offset: 2px;
            }

            .theme-toggle:active {
                transform: scale(0.95) !important;
            }

            /* Mobile adjustments */
            @media (max-width: 768px) {
                .theme-toggle {
                    top: 10px;
                    right: 10px;
                    width: 40px;
                    height: 40px;
                    font-size: 16px;
                }
            }

            /* Hide toggle button when printing */
            @media print {
                .theme-toggle {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Listen for system theme changes
     */
    function setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            mediaQuery.addEventListener('change', () => {
                const currentTheme = getSavedTheme();
                if (currentTheme === THEMES.AUTO) {
                    // Re-apply auto theme to trigger updates
                    applyTheme(THEMES.AUTO);
                }
            });
        }
    }

    /**
     * Initialize theme system
     */
    function initTheme() {
        // Add toggle styles
        addToggleStyles();

        // Apply saved theme
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme);

        // Create and insert toggle button
        const toggleButton = createToggleButton();
        document.body.appendChild(toggleButton);

        // Setup system theme listener
        setupSystemThemeListener();

        // Update button appearance
        updateToggleButton(savedTheme);

        console.log('🎨 Theme system initialized');
    }

    /**
     * Public API
     */
    window.ThemeToggle = {
        getTheme: getSavedTheme,
        setTheme: function(theme) {
            if (Object.values(THEMES).includes(theme)) {
                saveTheme(theme);
                applyTheme(theme);
            }
        },
        cycleTheme: cycleTheme,
        getEffectiveTheme: function() {
            return getEffectiveTheme(getSavedTheme());
        },
        THEMES: THEMES
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }

    // Also expose theme change event for other scripts
    window.addEventListener('themechange', (e) => {
        console.log('Theme changed to:', e.detail.theme, '(effective:', e.detail.effectiveTheme, ')');
    });

})();