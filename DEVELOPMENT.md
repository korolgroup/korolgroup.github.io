# Development Guide

This document provides instructions for developing and maintaining Roman Korol's academic website.

## Quick Start

```bash
# Install dependencies
npm install
# or
make install

# Start development server
npm run dev
# or
make dev

# Open http://localhost:3000 in your browser
```

## Project Structure

```
├── assets/
│   ├── css/           # Compiled CSS files
│   ├── js/            # JavaScript files
│   ├── sass/          # Sass source files
│   └── fonts/         # Web fonts
├── images/            # Image assets (organized by content)
├── pdf/              # Generated PDF documents
├── make_pdf/         # LaTeX source files
├── .github/          # GitHub Actions workflows
├── *.html            # Website pages
└── dist/             # Build output (generated)
```

## Development Workflow

### 1. Local Development

```bash
# Start development server with live reload
npm run dev

# Watch for CSS changes
npm run watch:css

# Watch for JS changes
npm run watch:js
```

### 2. Building for Production

```bash
# Full production build
npm run build

# Individual build steps
npm run build:css     # Compile and minify CSS
npm run build:js      # Minify JavaScript
npm run optimize:images  # Optimize images
```

### 3. Testing

```bash
# Run all tests
npm test

# Individual test suites
npm run test:html           # HTML validation
npm run test:css            # CSS linting
npm run test:js             # JavaScript linting
npm run test:accessibility  # Accessibility testing
```

### 4. Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Check bundle sizes
npm run analyze
```

## File Organization

### HTML Files
- `index.html` - Homepage
- `research.html` - Research and publications
- `news.html` - News and updates
- `learn.html` - Educational resources
- `activities.html` - Activities and outreach

### CSS Architecture
- Critical CSS is inlined in HTML for performance
- Non-critical CSS loaded asynchronously
- Sass preprocessing available in `assets/sass/`

### JavaScript Architecture
- Combined into `combined.min.js` for performance
- Individual modules in `assets/js/`:
  - `main.js` - Core site functionality
  - `modal.js` - Modal interactions
  - `performance.js` - Performance monitoring

### Image Optimization
- Organized by content type in `images/`
- Lazy loading implemented for performance
- Automated optimization available via `npm run optimize:images`

## LaTeX Document Generation

The site includes LaTeX sources for academic documents:

```bash
# Generate PDFs (requires LaTeX installation)
make pdf

# Manual generation
cd make_pdf
pdflatex CV_Korol.tex
pdflatex Publist.tex
pdflatex Research.tex
```

## Performance Guidelines

### CSS
- Keep critical CSS under 14KB
- Use CSS custom properties for theming
- Avoid large unused CSS frameworks

### JavaScript
- Keep combined JS under 10KB compressed
- Use native APIs when possible
- Implement progressive enhancement

### Images
- Use WebP format when possible
- Implement lazy loading for non-critical images
- Optimize file sizes without quality loss

## Accessibility Standards

- Maintain WCAG 2.1 AA compliance
- Use semantic HTML elements
- Provide alt text for all images
- Ensure keyboard navigation works
- Test with screen readers

## Browser Support

- Modern browsers (last 2 versions)
- IE11+ for basic functionality
- Progressive enhancement for older browsers

## Deployment

### Automatic Deployment (Recommended)
- Push to `main` branch triggers automated deployment
- GitHub Actions runs tests and builds
- Deploys to GitHub Pages or configured hosting

### Manual Deployment
```bash
# Build and test
npm run deploy

# Upload dist/ folder to web server
```

## Configuration Files

- `package.json` - Node.js dependencies and scripts
- `.eslintrc.js` - JavaScript linting rules
- `.stylelintrc.json` - CSS linting rules
- `.prettierrc` - Code formatting rules
- `lighthouserc.json` - Performance testing config
- `.htaccess` - Server configuration for optimization

## Troubleshooting

### Common Issues

1. **CSS not updating**: Clear browser cache or hard refresh
2. **JS errors**: Check browser console and lint files
3. **Build failures**: Ensure all dependencies are installed
4. **Performance issues**: Run Lighthouse audit

### Debug Commands

```bash
# Verbose build output
npm run build --verbose

# Check for outdated dependencies
npm outdated

# Audit for security vulnerabilities
npm audit
```

## Contributing

1. Create feature branch from `develop`
2. Make changes following code style guidelines
3. Run tests: `npm test`
4. Format code: `npm run format`
5. Submit pull request

## Useful Links

- [HTML5 UP Template](https://html5up.net/strongly-typed)
- [Sass Documentation](https://sass-lang.com/documentation)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Performance Best Practices](https://web.dev/fast/)