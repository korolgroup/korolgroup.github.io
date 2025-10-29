#!/usr/bin/env python3
"""
Add news items to _data/news_en.yml and _data/news_fr.yml interactively.

Usage:
    python scripts/add_news.py
"""

import yaml
from pathlib import Path
from datetime import datetime


def get_input(prompt, required=True):
    """Get user input with optional requirement."""
    while True:
        value = input(prompt).strip()
        if value or not required:
            return value
        print("This field is required. Please enter a value.")


def main():
    print("\n" + "="*60)
    print("Add News Item to Korol Group Website")
    print("="*60 + "\n")

    # Get language
    while True:
        lang = input("Language (en/fr/both): ").strip().lower()
        if lang in ['en', 'fr', 'both']:
            break
        print("Please enter 'en', 'fr', or 'both'")

    # Get common fields
    date_str = get_input(f"Date (YYYY-MM-DD, press Enter for today): ", required=False)
    if not date_str:
        date_str = datetime.now().strftime("%Y-%m-%d")

    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        year = date_obj.year
    except ValueError:
        print("Invalid date format. Using today.")
        date_obj = datetime.now()
        date_str = date_obj.strftime("%Y-%m-%d")
        year = date_obj.year

    # Get content for each language
    news_items = {}

    if lang in ['en', 'both']:
        print("\n--- English Content ---")
        title_en = get_input("Title: ")
        content_en = get_input("Content (can use markdown): ")
        news_items['en'] = {
            'date': date_str,
            'year': year,
            'title': title_en,
            'content': content_en
        }

    if lang in ['fr', 'both']:
        print("\n--- French Content ---")
        title_fr = get_input("Titre: ")
        content_fr = get_input("Contenu (peut utiliser markdown): ")
        news_items['fr'] = {
            'date': date_str,
            'year': year,
            'title': title_fr,
            'content': content_fr
        }

    # Handle images
    add_images = input("\nAdd images? (y/n): ").strip().lower() == 'y'
    images = []

    if add_images:
        print("\nImage paths can be:")
        print("  - /images/news/filename.jpg (for images in news folder)")
        print("  - /images/filename.jpg (for general images)")
        print("\nEnter image filenames (comma-separated, or press Enter when done):")

        while True:
            img_input = input("Images: ").strip()
            if not img_input:
                break

            for img_file in img_input.split(','):
                img_file = img_file.strip()
                if not img_file:
                    continue

                # Determine path
                if img_file.startswith('/'):
                    # Full path provided
                    if '/news/' in img_file:
                        path = img_file.rsplit('/', 1)[0] + '/'
                        file = img_file.rsplit('/', 1)[1]
                    else:
                        path = '/images/'
                        file = img_file.replace('/images/', '')
                else:
                    # Assume news folder
                    path = '/images/news/'
                    file = img_file

                alt_text = input(f"  Alt text for {file}: ").strip()
                title_text = input(f"  Title for {file} (optional): ").strip()

                img_entry = {
                    'file': file,
                    'path': path,
                    'alt': alt_text
                }

                if title_text:
                    img_entry['title'] = title_text

                images.append(img_entry)

            break

        if images:
            featured_idx = input(f"\nWhich image is featured? (1-{len(images)}, or 0 for none): ").strip()
            try:
                featured_idx = int(featured_idx)
                if 1 <= featured_idx <= len(images):
                    images[featured_idx - 1]['featured'] = True
            except ValueError:
                pass

    # Add images to entries
    if images:
        for lang_key in news_items:
            news_items[lang_key]['images'] = images

    # Load existing news and prepend new items
    repo_root = Path(__file__).parent.parent

    for lang_key, item in news_items.items():
        data_file = repo_root / '_data' / f'news_{lang_key}.yml'

        if data_file.exists():
            with open(data_file, 'r', encoding='utf-8') as f:
                existing = yaml.safe_load(f) or []
        else:
            existing = []

        # Prepend new item (newest first)
        existing.insert(0, item)

        # Save
        with open(data_file, 'w', encoding='utf-8') as f:
            yaml.dump(existing, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

        print(f"\n✓ Added news item to {data_file}")

    print("\n✓ Done! Run 'python scripts/build_all.py' to rebuild the website.")


if __name__ == '__main__':
    main()
