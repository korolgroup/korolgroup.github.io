# Korol Group Website - Development Guide

## Overview

This is a professional bilingual (French/English) website for a research group at a francophone university. The website uses Jekyll static site generator and is hosted on GitHub Pages.

## Architecture: Data-Driven Design

The website follows a **data-driven architecture** where all content is stored as structured YAML files in `_data/`, ensuring consistency and eliminating code duplication.

### Key Principle: Single Source of Truth

All dynamic content (publications, news, team members) is stored in `_data/` directory. This same data generates:
- English website pages (via Jekyll templates)
- French website pages (via Jekyll templates)
- LaTeX CV and publication list (via Python scripts)
- PDF documents (compiled from generated LaTeX)

## Directory Structure

```
website/
├── _data/                          # ← SINGLE SOURCE OF TRUTH
│   ├── publications.yml            # Publication metadata
│   ├── news_en.yml                 # English news items
│   ├── news_fr.yml                 # French news items
│   ├── team.yml                    # Team members (current & former)
│   └── (other data files as needed)
│
├── _layouts/                       # Jekyll templates
│   ├── default.html                # Base template
│   ├── publications.html           # Publication page template
│   ├── news.html                   # News page template
│   └── team.html                   # Team page template
│
├── _includes/                      # Reusable components
│   ├── header.html
│   └── footer.html
│
├── scripts/                        # Build automation
│   ├── build_all.py                # Master build script
│   ├── add_publication.py          # Helper: Add publication from DOI
│   ├── add_news.py                 # Helper: Add news item interactively
│   ├── generate_latex.py           # Generate LaTeX from YAML
│   └── (other utilities)
│
├── images/
│   ├── publications/               # Publication figures (0.jpg, 1.jpg, ...)
│   ├── news/                       # News images
│   ├── team/                       # Team member photos
│   └── (general website images)    # Banner, campus, logos, etc.
│
├── make/
│   └── pdf/                        # Generated LaTeX/PDFs
│       ├── CV_Korol.tex            # ← GENERATED from _data
│       ├── Publist.tex             # Uses pubs.tex (generated)
│       ├── pubs.tex                # ← GENERATED from _data
│       └── *.pdf                   # Compiled outputs
│
├── en/                             # English pages
│   ├── index.html
│   ├── news.html                   # Uses layout: news
│   ├── team.html                   # Uses layout: team
│   └── research.html               # Uses layout: publications
│
└── fr/                             # French pages
    ├── index.html
    ├── nouvelles.html              # Uses layout: news
    ├── equipe.html                 # Uses layout: team
    └── recherche.html              # Uses layout: publications
```

## Workflow: Adding Content

### Adding a Publication

**Option 1: From DOI (Recommended)**
```bash
python scripts/add_publication.py --doi "10.1021/xxx.yyy"
```
- Fetches metadata from CrossRef API
- Prompts for English/French summaries and alt text
- Adds entry to `_data/publications.yml`
- Assigns next available ID automatically

**Option 2: Manual editing**
Edit `_data/publications.yml` directly following the existing format.

**Then:**
1. Add figure image: `images/publications/N.jpg` (where N is the publication ID)
2. Rebuild: `python scripts/build_all.py`

### Adding a News Item

```bash
python scripts/add_news.py
```
- Interactive prompts for English/French content
- Supports multiple images
- Automatically adds to `_data/news_en.yml` and/or `_data/news_fr.yml`

**Then:**
1. Ensure images are in `images/news/` (if referenced)
2. Rebuild: `python scripts/build_all.py`

### Adding/Updating Team Members

Edit `_data/team.yml` directly (simple YAML format):
- Add to `current:` list for current members
- Add to `former:` list for alumni
- Include bilingual fields (`en` and `fr`)

**Then:**
1. Add photo to `images/team/` if needed
2. Rebuild: `python scripts/build_all.py`

## Build Process

**IMPORTANT**: PDF generation is **MANUAL**. Run the Python build script whenever you change `_data/publications.yml`.

### Master Build Command (Recommended)

```bash
python scripts/build_all.py
```

This script:
1. Validates all YAML data files
2. Generates `make/pdf/pubs.tex` from `_data/publications.yml`
3. Compiles LaTeX PDFs (CV and publication list) - if pdflatex available
4. Builds Jekyll website to `_site/`

### Build Options

```bash
python scripts/build_all.py --skip-pdf      # Skip PDF compilation
python scripts/build_all.py --skip-jekyll   # Skip Jekyll build
```

### Individual Steps

```bash
# Validate YAML only
python scripts/validate_data.py

# Generate LaTeX only
python scripts/generate_latex.py

# Compile PDFs only
cd make/pdf
pdflatex -interaction=nonstopmode Publist.tex
pdflatex -interaction=nonstopmode CV_Korol.tex
cd ../..

# Build Jekyll only (does NOT regenerate PDFs)
bundle exec jekyll build

# Serve locally for testing (does NOT regenerate PDFs on file change)
bundle exec jekyll serve
```

### Why Manual PDF Generation?

GitHub Pages runs Jekyll in safe mode, which disables custom plugins. Therefore, PDFs cannot be auto-generated during Jekyll builds. You must run `python scripts/build_all.py` manually and commit the generated PDFs to the repository.

**For detailed build instructions, see [BUILD_PROCESS.md](BUILD_PROCESS.md)**

## Data File Formats

### publications.yml

```yaml
- id: 12                           # Unique ID (0, 1, 2, ...)
  doi: "10.1021/xxx"
  title: "Paper Title"
  authors:
    - family: "Korol"
      given: "R"
      highlight: true              # Bold in citations
      corresponding: true          # Add asterisk
    - family: "Doe"
      given: "J"
  journal:
    full: "Full Journal Name"
    abbrev: "J. Abbrev."
  year: 2025
  volume: "129"
  issue: "15"
  pages: "3587-3596"
  image: "12.jpg"                  # In images/publications/
  highlight: true                  # Featured publication
  alt_text:
    en: "English alt text"
    fr: "Texte alternatif français"
  summary:
    en: "English summary..."
    fr: "Résumé français..."
```

### news_en.yml / news_fr.yml

```yaml
- date: "2026-01-05"
  year: 2026
  title: "News Title"
  images:
    - file: "image.jpg"
      path: "/images/news/"
      alt: "Alt text"
      title: "Image title (optional)"
      featured: true              # Optional
  content: |
    Markdown content here.
    Can be multi-line.
```

### team.yml

```yaml
current:
  - name: "Person Name"
    role: "pi"                     # pi, postdoc, phd, masters, undergrad, mascot
    role_display:
      en: "Principal Investigator"
      fr: "Directeur de recherche"
    photo: "/images/team/photo.jpg"
    cv: "/pdf/CV.pdf"              # Optional
    bio:
      en: "English bio"
      fr: "Bio en français"
    interests:
      en: "Research interests"
      fr: "Intérêts de recherche"

former:
  - name: "Former Member"
    role: "phd"
    years: "2026-2030"
    current:
      en: "Current position"
      fr: "Poste actuel"
```

## Important Notes

1. **Never manually edit HTML for content** - All content should be in `_data/` YAML files
2. **Always rebuild after changes** - Run `python scripts/build_all.py`
3. **Bilingual by default** - Every content entry must have both `en` and `fr` fields
4. **Image organization**:
   - Publications: `images/publications/N.jpg` (numbered by ID)
   - News: `images/news/descriptive-name.jpg`
   - Team: `images/team/person-name.jpg`
   - General: `images/` (banner, campus, logos, etc.)
5. **LaTeX auto-generation** - `make/pdf/pubs.tex` is generated from YAML; don't edit it manually

## Deployment

The website is hosted on GitHub Pages. To deploy:

```bash
git add _data/ images/ _layouts/
git commit -m "Update content"
git push origin master
```

GitHub Pages will automatically rebuild the Jekyll site.

## Troubleshooting

### YAML Syntax Errors

```bash
# Validate YAML files
python scripts/build_all.py
```

Look for validation errors in the output.

### Missing Images

The build script will warn about missing images but won't fail. Check:
- `images/publications/` for publication figures
- `images/news/` for news images
- Paths in YAML files are correct

### Jekyll Build Fails

```bash
# Check Jekyll installation
bundle exec jekyll --version

# Clean and rebuild
bundle exec jekyll clean
bundle exec jekyll build
```

### PDF Compilation Fails

Requires pdflatex (TeX Live or MiKTeX):
```bash
# Check if available
pdflatex --version

# Skip PDF generation if not needed
python scripts/build_all.py --skip-pdf
```

## Development Tips

- Test locally: `bundle exec jekyll serve` then visit `http://localhost:4000`
- Use `--skip-pdf` during development to speed up builds
- Commit `_data/` changes frequently - it's your source of truth
- Keep YAML files clean and well-formatted for easy version control
