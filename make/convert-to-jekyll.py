#!/usr/bin/env python3
"""
Convert HTML pages to Jekyll format by extracting front matter and content only.
"""
import re
import sys
from pathlib import Path

def extract_metadata(html_content):
    """Extract title, description, and keywords from HTML."""
    title_match = re.search(r'<title>(.*?)</title>', html_content, re.DOTALL)
    desc_match = re.search(r'<meta name="description" content="(.*?)"', html_content)
    keywords_match = re.search(r'<meta name="keywords" content="(.*?)"', html_content)

    title = title_match.group(1).strip() if title_match else "Korol Group"
    description = desc_match.group(1).strip() if desc_match else ""
    keywords = keywords_match.group(1).strip() if keywords_match else ""

    return title, description, keywords

def extract_content(html_content):
    """Extract only the main content between header and footer."""
    # Find the start of main content (after </section> closing header)
    # and before footer

    # Pattern 1: <main id="main-content">...</main>
    pattern = r'</section>\s*<!-- Main -->.*?<main id="main-content">(.*?)</main>'
    match = re.search(pattern, html_content, re.DOTALL)

    if match:
        return match.group(1).strip()

    # Pattern 2: <section id="main">...</section> (used in activities, learn, etc.)
    pattern2 = r'<!-- Main -->\s*<section id="main">(.*?)</section>\s*<!-- Footer -->'
    match2 = re.search(pattern2, html_content, re.DOTALL)

    if match2:
        return match2.group(1).strip()

    # Pattern 3: <section id="main">... (no closing </section> before footer - research, publications)
    pattern3 = r'<!-- Main -->\s*<section id="main">(.*?)<!-- Footer -->'
    match3 = re.search(pattern3, html_content, re.DOTALL)

    if match3:
        content = match3.group(1).strip()
        return content

    # Fallback: try to find content between main tags
    pattern4 = r'<main[^>]*>(.*?)</main>'
    match4 = re.search(pattern4, html_content, re.DOTALL)

    if match4:
        return match4.group(1).strip()

    return None

def extract_custom_scripts(html_content):
    """Extract any custom page-specific scripts from <head>."""
    # Look for custom scripts (not the theme script)
    custom_scripts = []

    # Find scripts between theme script and </head>
    pattern = r'<!-- Publication unhide functionality -->.*?</script>'
    matches = re.findall(pattern, html_content, re.DOTALL)

    if matches:
        return '\n'.join(matches)

    return None

def convert_file(input_path, output_path, lang='en'):
    """Convert a single HTML file to Jekyll format."""
    print(f"Converting {input_path}...")

    with open(input_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Extract metadata
    title, description, keywords = extract_metadata(html_content)

    # Extract content
    content = extract_content(html_content)

    if not content:
        print(f"  WARNING: Could not extract content from {input_path}")
        return False

    # Extract custom scripts if any
    custom_scripts = extract_custom_scripts(html_content)

    # Fix image paths: ../images/ -> /images/
    content = content.replace('src="../images/', 'src="/images/')
    content = content.replace('href="../images/', 'href="/images/')
    content = content.replace('srcset="images/', 'srcset="/images/')

    # Fix CSS paths
    content = content.replace('../assets/', '/assets/')

    # Fix relative page links - add -jekyll suffix to internal HTML links
    # First, handle all href attributes
    import re

    # Pattern to match href="pagename.html" and replace with href="/lang/pagename.html"
    def fix_page_link(match):
        page = match.group(1)
        # Don't modify if it's already an absolute path, anchor, external link, or mailto
        if page.startswith(('http://', 'https://', '/', '#', 'mailto:')):
            return f'href="{page}"'
        # Convert relative links to absolute paths
        if page.endswith('.html'):
            return f'href="/{lang}/{page}"'
        return match.group(0)

    content = re.sub(r'href="([^"]*)"', fix_page_link, content)

    # Generate permalink from input filename (not output which has -jekyll)
    input_filename = Path(input_path).name
    permalink = f'/{lang}/{input_filename}'

    # Create front matter
    front_matter = f"""---
layout: default
title: "{title}"
description: "{description}"
keywords: "{keywords}"
lang: {lang}
permalink: {permalink}
"""

    # Add custom scripts section if exists (within the front matter)
    if custom_scripts:
        front_matter += "custom_scripts: |\n"
        for line in custom_scripts.split('\n'):
            front_matter += f"  {line}\n"

    # Close front matter
    front_matter += "---\n\n"

    # Combine
    jekyll_content = front_matter + content

    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(jekyll_content)

    print(f"  [OK] Created {output_path}")
    return True

def main():
    """Convert all HTML files in en/ and fr/ directories."""
    base_dir = Path(__file__).parent

    # English pages
    en_dir = base_dir / 'en'
    for html_file in en_dir.glob('*.html'):
        if html_file.name == 'index-jekyll.html':
            continue  # Skip already converted example

        output_file = en_dir / f"{html_file.stem}-jekyll.html"
        convert_file(html_file, output_file, lang='en')

    # French pages
    fr_dir = base_dir / 'fr'
    for html_file in fr_dir.glob('*.html'):
        output_file = fr_dir / f"{html_file.stem}-jekyll.html"
        convert_file(html_file, output_file, lang='fr')

    print("\n[SUCCESS] Conversion complete!")
    print("\nNext steps:")
    print("1. Test converted pages: http://localhost:4000/en/[page]-jekyll.html")
    print("2. If working, backup originals: rename .html to .html.bak")
    print("3. Rename -jekyll.html files to .html")

if __name__ == '__main__':
    main()
