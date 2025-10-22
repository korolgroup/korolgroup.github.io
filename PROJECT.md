# Roman Korol's Academic Website

## Project Overview
This is a personal academic website for Roman Korol, a Postdoctoral Fellow at the University of Rochester in the Franco Group. The site serves as a professional portfolio showcasing research, publications, educational resources, and activities.

## Project Type
Static HTML website built on the "Strongly Typed" template from HTML5 UP

## Site Structure
- **Home** (`index.html`) - Main landing page with introduction
- **Research** (`research.html`) - Academic research and publications
- **News** (`news.html`) - Recent updates and announcements
- **Resources** (`learn.html`) - Educational materials organized by:
  - Science
  - Software
  - Coding
  - Opportunities
  - Kids & Teens
- **Activities** (`activities.html`) - Professional and community activities

## Technologies & Dependencies

### Frontend
- **HTML5/CSS3** - Core web technologies
- **HTML5 UP "Strongly Typed"** - Base template framework
- **Font Awesome** - Icon library
- **Google Fonts** - Typography (Source Sans Pro, Arvo)
- **jQuery** - JavaScript functionality and DOM manipulation
- **Custom JavaScript** - Utilities for interactivity (show/hide content)

### Styling & Assets
- **Responsive Design** - Mobile-friendly layout
- **Sass** - CSS preprocessing (source files in `assets/sass/`)
- **Organized Assets** - Structured CSS, JS, fonts, and images

### Document Generation
- **LaTeX** - Academic document preparation
- **PDF Generation** - Automated CV, publication lists, and research summaries

## Architecture

### Directory Structure
```
├── .git/                    # Git repository
├── .claude/                 # Claude AI configuration
├── assets/                  # Static assets
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript files
│   ├── fonts/              # Web fonts
│   └── sass/               # Sass source files
├── images/                  # Image assets
│   ├── activities/         # Activity-related images
│   ├── news/               # News images
│   ├── publications/       # Publication graphics
│   ├── research/           # Research images
│   └── Logos/              # Logo files
├── make_pdf/               # LaTeX source files
├── pdf/                    # Generated PDF documents
├── *.html                  # Site pages
└── PROJECT.md              # This documentation
```

### Key Features
- **Consistent Navigation** - Unified header and navigation across all pages
- **Responsive Layout** - Adapts to different screen sizes
- **Interactive Elements** - JavaScript-powered show/hide functionality
- **Academic Integration** - LaTeX workflow for generating professional documents
- **Version Control** - Git repository for tracking changes
- **AI-Assisted** - Claude configuration for development assistance

### Content Management
- **Static Files** - No database or CMS required
- **Manual Updates** - Content updated directly in HTML files
- **PDF Integration** - Academic documents generated via LaTeX and linked from site
- **Image Organization** - Categorized image assets by content type

## Development Workflow
1. **Content Updates** - Edit HTML files directly
2. **Styling Changes** - Modify Sass files and compile to CSS
3. **Document Updates** - Update LaTeX files in `make_pdf/` and regenerate PDFs
4. **Version Control** - Commit changes using Git
5. **Deployment** - Static files can be hosted on any web server

## Configuration Files
- `.gitignore` - Git ignore patterns (minimal configuration)
- `.claude/settings.local.json` - Claude AI permissions and configuration
- `LICENSE.txt` - HTML5 UP template license
- `README.txt` - Original template documentation

## Target Audience
- Academic peers and collaborators
- Students seeking educational resources
- Potential employers and research partners
- General public interested in scientific research

## Maintenance Notes
- Regular updates to research publications
- News section for recent developments
- Resource links require periodic validation
- PDF documents need regeneration when LaTeX sources change