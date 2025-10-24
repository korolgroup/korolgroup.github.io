# Jekyll Conversion Guide for Korol Group Website

This document explains the Jekyll restructuring of the website to eliminate header/footer repetition.

## What is Jekyll?

Jekyll is a static site generator that GitHub Pages uses by default. It allows you to use templates and includes to avoid repeating code across pages.

## Current Structure

```
_config.yml              # Jekyll configuration
_layouts/
  default.html          # Main page template
_includes/
  header.html           # Shared header component
  footer.html           # Shared footer component
en/
  index-jekyll.html     # Example converted page
```

## How It Works

### 1. Page Front Matter
Each page starts with YAML front matter (between `---` markers):

```yaml
---
layout: default
title: "Page Title"
description: "Page description for SEO"
lang: en
preload_image: "/images/some-image.jpg"
---
```

### 2. The Layout Template
The `_layouts/default.html` file contains:
- `<html>`, `<head>`, and `<body>` tags
- Meta tags for SEO
- Theme switching JavaScript
- CSS/JS includes
- Placeholders for header (`{% include header.html %}`)
- Placeholder for content (`{{ content }}`)
- Placeholder for footer (`{% include footer.html %}`)

### 3. Include Files
- `_includes/header.html` - Language toggle, logo, navigation
- `_includes/footer.html` - Contact info, social links, scripts

### 4. Page Content
Each page contains ONLY the unique content (no `<html>`, `<head>`, header, or footer).

## Conversion Process

### For Each HTML Page:

1. **Add Front Matter** at the very top:
   ```yaml
   ---
   layout: default
   title: "Your Page Title"
   description: "SEO description"
   keywords: "keywords, for, seo"
   lang: en  # or 'fr' for French pages
   ---
   ```

2. **Remove Everything Before Content**:
   - Delete from `<!DOCTYPE HTML>` through `</section>` (after header)
   - Delete the opening `<main id="main-content">` tag

3. **Keep Only Page-Specific Content**:
   - Start from the first `<section>` of actual page content
   - Keep all unique content sections

4. **Remove Everything After Content**:
   - Delete the closing `</main>` tag
   - Delete entire footer section
   - Delete all `<script>` tags
   - Delete `</body>` and `</html>`

5. **Fix Asset Paths**:
   - Change `../assets/` to `/assets/`
   - Change `../images/` to `/images/`
   - Change relative links to absolute (starting with `/`)

## Example Conversion

### Before (original HTML):
```html
<!DOCTYPE HTML>
<html lang="en">
<head>
  <title>Page Title</title>
  ...all meta tags...
</head>
<body>
  <!-- Header -->
  <section id="header">
    ...navigation...
  </section>

  <main id="main-content">
    <section id="features">
      ...page content...
    </section>
  </main>

  <!-- Footer -->
  <section id="footer">
    ...footer...
  </section>
</body>
</html>
```

### After (Jekyll version):
```html
---
layout: default
title: "Page Title"
lang: en
---

<section id="features">
  ...page content...
</section>
```

## Bilingual Support

The templates automatically handle language switching:
- Set `lang: en` or `lang: fr` in front matter
- Header/footer text adjusts automatically
- Language toggle links generated automatically

## Testing Locally

If you have Jekyll installed:
```bash
jekyll serve
```

Visit `http://localhost:4000` to preview.

## Deploying to GitHub Pages

1. Push the `jekyll` branch to GitHub
2. In repository settings → Pages → Source, select the `jekyll` branch
3. GitHub will automatically build and deploy

## Benefits

✅ **No Repetition**: Header/footer defined once in `_includes/`
✅ **Easy Updates**: Change header/footer in one place
✅ **Cleaner Pages**: Only unique content in each file
✅ **Better Maintainability**: Consistent structure across all pages
✅ **Automatic Building**: GitHub Pages builds automatically on push

## Next Steps

1. Review the example: `en/index-jekyll.html`
2. Convert one page at a time
3. Test each conversion locally if possible
4. Once all pages converted, rename originals (`.html.bak`) and Jekyll versions to `.html`
5. Push to GitHub and test live site

## Files to Convert

### English Pages:
- [x] index.html (example: index-jekyll.html)
- [ ] research.html
- [ ] team.html
- [ ] news.html
- [ ] openings.html
- [ ] activities.html
- [ ] learn.html
- [ ] publications.html

### French Pages:
- [ ] index.html
- [ ] recherche.html
- [ ] equipe.html
- [ ] nouvelles.html
- [ ] postes.html
- [ ] activites.html
- [ ] apprendre.html
- [ ] publications.html

## Troubleshooting

**Issue**: Page not rendering
- Check front matter is valid YAML
- Ensure `layout: default` is set
- Verify no extra spaces/tabs in front matter

**Issue**: Links broken
- Use absolute paths starting with `/`
- Jekyll processes from project root

**Issue**: Styles not loading
- Check CSS path is `/assets/css/main.css` not `../assets/css/main.css`

## Notes

- Original files remain untouched on `master` branch
- This conversion is on the `jekyll` branch
- Can test thoroughly before merging
- Easy to rollback if needed
