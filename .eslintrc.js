module.exports = {
    env: {
        browser: true,
        es6: true,
        jquery: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'script'
    },
    globals: {
        'jQuery': 'readonly',
        '$': 'readonly',
        'breakpoints': 'readonly',
        'unhide': 'readonly'
    },
    rules: {
        // Code Quality
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-unused-vars': 'error',
        'no-undef': 'error',

        // Best Practices
        'eqeqeq': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'prefer-const': 'error',

        // Style
        'indent': ['error', 4],
        'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'never'],

        // Accessibility
        'jsx-a11y/alt-text': 'off', // We're not using JSX

        // Performance
        'no-loop-func': 'error',
        'no-inner-declarations': 'error'
    },
    overrides: [
        {
            files: ['assets/js/performance.js'],
            rules: {
                'no-console': 'off' // Allow console in performance monitoring
            }
        }
    ]
};