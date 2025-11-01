# Build Process for Korol Group Website

## Overview

The website uses a **data-driven architecture** where content is stored in YAML files (`_data/`) and generates both a Jekyll website and LaTeX PDF documents.

**IMPORTANT**: PDF generation is **manual** and requires running Python scripts. Jekyll plugins are disabled when using GitHub Pages.

## Quick Start

### Full Build (Website + PDFs)

```bash
python scripts/build_all.py
```

This is the recommended command that handles everything:
1. Validates all YAML data files
2. Generates `pdf/pubs.tex` from `_data/publications.yml`
3. Compiles PDFs (CV and publication list)
4. Builds Jekyll website to `_site/`

### Development Workflow

```bash
# First time: Generate PDFs
python scripts/generate_latex.py
cd pdf
pdflatex -interaction=nonstopmode Publist.tex
pdflatex -interaction=nonstopmode CV_Korol.tex
cd ..

# Start development server
bundle exec jekyll serve

# Visit http://127.0.0.1:4000 in your browser
# Make changes to files
# Jekyll auto-regenerates the website
# Hard refresh browser (Ctrl+F5) to see changes
```

## Build Commands

### Python Build Script (Recommended)

```bash
# Full build
python scripts/build_all.py

# Skip PDF compilation
python scripts/build_all.py --skip-pdf

# Skip Jekyll build
python scripts/build_all.py --skip-jekyll
```

### Individual Steps

```bash
# Validate YAML only
python scripts/validate_data.py

# Generate LaTeX only
python scripts/generate_latex.py

# Compile PDFs only
cd pdf
pdflatex -interaction=nonstopmode Publist.tex
pdflatex -interaction=nonstopmode CV_Korol.tex
cd ..

# Build Jekyll website only
bundle exec jekyll build

# Serve Jekyll locally with auto-regeneration
bundle exec jekyll serve
```

## When PDFs Need Regeneration

PDFs must be **manually regenerated** when you change:
- `_data/publications.yml` - Publication list content

PDFs do **NOT** need regeneration when you change:
- Website HTML/CSS files
- Other `_data/` files (news, team)
- Images

### How to Regenerate PDFs

```bash
# Option 1: Full rebuild
python scripts/build_all.py

# Option 2: Just PDFs
python scripts/generate_latex.py
cd pdf && pdflatex -interaction=nonstopmode Publist.tex && pdflatex -interaction=nonstopmode CV_Korol.tex && cd ..
```

## Requirements

### Required
- Ruby with Jekyll and Bundler
- Python 3.x
- PyYAML package (`pip install pyyaml`)

### Optional (for PDF generation)
- pdflatex (TeX Live or MiKTeX)

If pdflatex is not available, the build will skip PDF generation and show a warning.

## Workflow Examples

### Adding a New Publication

```bash
# Option 1: Interactive (recommended)
python scripts/add_publication.py --doi "10.1021/xxx.yyy"

# Option 2: Manual editing
# Edit _data/publications.yml directly

# Then:
# 1. Add publication image to images/publications/N.jpg (where N is the ID)
# 2. Regenerate PDFs and rebuild website
python scripts/build_all.py

# 3. If Jekyll server is running, hard refresh browser (Ctrl+F5)
```

### Adding News

```bash
# Interactive helper
python scripts/add_news.py

# Then rebuild
python scripts/build_all.py
# Or just: bundle exec jekyll build (news doesn't affect PDFs)
```

### Testing Changes Locally

```bash
# Start development server
bundle exec jekyll serve

# Visit http://127.0.0.1:4000 in your browser
# Make changes to HTML/CSS files
# Jekyll auto-regenerates
# Hard refresh browser (Ctrl+F5) to see changes

# If you changed publications.yml:
# 1. Stop Jekyll server (Ctrl+C)
# 2. Regenerate PDFs
python scripts/generate_latex.py
cd pdf && pdflatex -interaction=nonstopmode Publist.tex && pdflatex -interaction=nonstopmode CV_Korol.tex && cd ..
# 3. Restart Jekyll server
bundle exec jekyll serve
# 4. Hard refresh browser
```

### Deploying to GitHub Pages

```bash
# 1. Ensure PDFs are up to date
python scripts/build_all.py

# 2. Commit all changes
git add _data/ images/ pdf/*.pdf
git commit -m "Update content and regenerate PDFs"

# 3. Push to GitHub
git push origin master

# GitHub Pages will automatically build the Jekyll website
# (But cannot regenerate PDFs - so commit them!)
```

## File Organization

```
website/
├── _data/
│   ├── publications.yml          # ← Edit here for publications
│   ├── news_en.yml              # ← Edit here for English news
│   ├── news_fr.yml              # ← Edit here for French news
│   └── team.yml                 # ← Edit here for team members
│
├── _plugins/
│   └── latex_generator.rb        # (Not used - GitHub Pages safe mode)
│
├── scripts/
│   ├── build_all.py              # ← Master build script (RECOMMENDED)
│   ├── generate_latex.py         # ← LaTeX generator
│   ├── add_publication.py        # ← Helper to add publications
│   ├── add_news.py               # ← Helper to add news
│   └── validate_data.py          # ← YAML validator
│
├── pdf/
│   ├── pubs.tex                  # ← Auto-generated from YAML
│   ├── Publist.tex               # ← Template (includes pubs.tex)
│   ├── CV_Korol.tex              # ← Template (includes pubs.tex)
│   ├── Publist.pdf               # ← Compiled PDF (commit to git!)
│   └── CV_Korol.pdf              # ← Compiled PDF (commit to git!)
│
├── _layouts/                     # Jekyll templates
├── _includes/                    # Reusable components
├── en/                          # English pages
├── fr/                          # French pages
└── images/                      # All images
```

## Troubleshooting

### PDFs Not Updating on Website

**Problem**: Changed publications.yml but PDFs still show old content

**Solution**:
1. Regenerate PDFs: `python scripts/generate_latex.py` then compile
2. Commit the new PDFs: `git add pdf/*.pdf`
3. Hard refresh browser (Ctrl+F5)

### Jekyll Plugin Not Running

**Problem**: `_plugins/latex_generator.rb` isn't doing anything

**Explanation**: This is expected. GitHub Pages runs Jekyll in safe mode which disables custom plugins. The plugin was an attempt at automation but cannot work with GitHub Pages.

**Solution**: Use the Python build script instead: `python scripts/build_all.py`

### pdflatex Not Found

**Problem**: Warning about pdflatex not found

**Solution**:
- **Windows**: Install MiKTeX from https://miktex.org/
- **Linux**: `sudo apt-get install texlive-full`
- **Mac**: Install MacTeX from https://www.tug.org/mactex/
- **Alternative**: Skip PDF generation, PDFs can be compiled on another machine

### Unicode Errors in PDFs

**Problem**: LaTeX compilation warnings about Unicode characters (₃, ₂, etc.)

**Status**: Expected for publications with subscripts/superscripts
- The PDFs still compile successfully
- Warnings can be safely ignored
- Subscripts may not render perfectly but are readable

### Website Shows Old Content

**Problem**: Hard refresh doesn't show changes

**Checklist**:
1. Did you run `bundle exec jekyll build` or `python scripts/build_all.py`?
2. Are you viewing `http://127.0.0.1:4000` (not `http://localhost:5500`)?
3. Did you do a hard refresh (Ctrl+F5)?
4. Check if Jekyll server shows "Regenerating" after file save

## Summary

| Task | Command | Affects PDFs? |
|------|---------|---------------|
| Full build | `python scripts/build_all.py` | Yes |
| Add publication | `python scripts/add_publication.py` | No (run build_all after) |
| Generate LaTeX | `python scripts/generate_latex.py` | No (need pdflatex) |
| Compile PDFs | `cd pdf && pdflatex ...` | Yes |
| Build website | `bundle exec jekyll build` | No |
| Dev server | `bundle exec jekyll serve` | No |

**Key Point**: PDF generation is **always manual**. Run `python scripts/build_all.py` whenever you change `publications.yml`.
