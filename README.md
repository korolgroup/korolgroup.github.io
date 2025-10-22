# Roman Korol - Academic Website

A modern, performant academic website for Roman Korol, Postdoctoral Fellow at the University of Rochester in the Franco Group.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/username/roman-korol-website.git
cd roman-korol-website

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the site.

## 📋 Features

- **Modern Performance**: Optimized for speed with critical CSS inlining, resource preloading, and lazy loading
- **Accessibility**: WCAG 2.1 AA compliant with skip navigation, proper alt text, and keyboard navigation
- **SEO Optimized**: Comprehensive meta tags, Open Graph, and Twitter Cards
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Academic Integration**: LaTeX workflow for generating CVs, publication lists, and research documents
- **Development Workflow**: Modern build tools, linting, testing, and CI/CD pipeline

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES2020)
- **Build Tools**: Sass, Terser, npm scripts
- **Testing**: HTML Validate, Stylelint, ESLint, PA11y, Lighthouse
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Performance**: Critical CSS, resource preloading, compression
- **Academic**: LaTeX for PDF document generation

## 📁 Project Structure

```
├── assets/
│   ├── css/              # Compiled CSS
│   ├── js/               # JavaScript modules
│   ├── sass/             # Sass source files
│   └── fonts/            # Web fonts
├── images/               # Optimized images
├── pdf/                  # Generated academic documents
├── make_pdf/             # LaTeX source files
├── .github/workflows/    # CI/CD pipelines
├── *.html               # Website pages
└── dist/                # Production build
```

## 🔧 Development

### Commands

```bash
# Development
npm run dev              # Start dev server with live reload
npm run watch:css        # Watch Sass files
npm run watch:js         # Watch JavaScript files

# Building
npm run build            # Production build
npm run build:css        # Compile and minify CSS
npm run build:js         # Minify JavaScript

# Testing
npm test                 # Run all tests
npm run test:html        # HTML validation
npm run test:css         # CSS linting
npm run test:js          # JavaScript linting
npm run test:accessibility  # Accessibility testing

# Code Quality
npm run lint             # Run linting
npm run format           # Format code with Prettier
npm run analyze          # Check bundle sizes

# Academic Documents
make pdf                 # Generate PDFs from LaTeX
```

### Development Guidelines

1. **Code Style**: Follow the ESLint and Stylelint configurations
2. **Accessibility**: Maintain WCAG 2.1 AA compliance
3. **Performance**: Keep CSS under 50KB, JavaScript under 10KB
4. **Testing**: All changes must pass CI/CD pipeline
5. **Documentation**: Update docs for significant changes

## 📝 Content Management

### Pages
- `index.html` - Homepage with introduction and overview
- `research.html` - Research projects and publications
- `news.html` - Latest news and updates
- `learn.html` - Educational resources and links
- `activities.html` - Professional activities and outreach

### Academic Documents
LaTeX sources in `make_pdf/` generate:
- `CV_Korol.pdf` - Curriculum Vitae
- `Publist.pdf` - Publication List
- `Research.pdf` - Research Summary

## 🚀 Deployment

### Automatic Deployment
- Push to `main` branch triggers automated deployment
- GitHub Actions runs tests and builds production version
- Deploys to GitHub Pages or configured hosting

### Manual Deployment
```bash
npm run deploy
# Upload dist/ folder to web server
```

## 📊 Performance

The site is optimized for performance with:
- Critical CSS inlined for faster rendering
- JavaScript bundled and minified
- Images optimized and lazy-loaded
- Browser caching configured
- Compression enabled

Target metrics:
- Performance Score: >85
- Accessibility Score: >95
- Best Practices: >90
- SEO Score: >90

## 🔧 Configuration

### Environment Setup
1. Install Node.js 18+ and npm
2. For LaTeX documents: Install LaTeX distribution
3. For deployment: Configure hosting credentials

### Browser Support
- Modern browsers (last 2 versions)
- Progressive enhancement for older browsers
- Core functionality works without JavaScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following style guidelines
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The base template "Strongly Typed" is by HTML5 UP and is licensed under the CCA 3.0 license.

## 📞 Contact

Roman Korol
Postdoctoral Fellow
University of Rochester
[Website](https://romankorol.com) | [Email](mailto:roman@example.com)

## 🙏 Acknowledgments

- [HTML5 UP](https://html5up.net/) for the base template
- [Franco Group](https://sas.rochester.edu/chm/groups/franco/) at University of Rochester
- Open source community for tools and libraries

---

Built with ❤️ for academic excellence and open science.