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
            return localStorage.getItem(STORAGE_KEY) || THEMES.AUTO;
        } catch (e) {
            return THEMES.AUTO;
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
        const body = document.body;

        // Remove existing theme attributes
        body.removeAttribute('data-theme');

        if (theme === THEMES.AUTO) {
            // Let CSS media query handle auto theme
            // Don't set data-theme attribute
        } else {
            // Explicitly set theme
            body.setAttribute('data-theme', theme);
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

        switch (currentTheme) {
            case THEMES.LIGHT:
                nextTheme = THEMES.DARK;
                break;
            case THEMES.DARK:
                nextTheme = THEMES.AUTO;
                break;
            case THEMES.AUTO:
            default:
                nextTheme = THEMES.LIGHT;
                break;
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
            position: fixed;
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
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", system-ui, sans-serif;
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

        const effectiveTheme = getEffectiveTheme(theme);
        let icon, title;

        switch (theme) {
            case THEMES.LIGHT:
                icon = '☀️';
                title = 'Light theme active. Click for dark theme.';
                break;
            case THEMES.DARK:
                icon = '🌙';
                title = 'Dark theme active. Click for auto theme.';
                break;
            case THEMES.AUTO:
            default:
                icon = effectiveTheme === THEMES.DARK ? '🌓' : '🌞';
                title = 'Auto theme active (follows system). Click for light theme.';
                break;
        }

        button.textContent = icon;
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
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", system-ui, sans-serif;
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