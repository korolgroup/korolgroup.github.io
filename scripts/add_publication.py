#!/usr/bin/env python3
"""
Add publications to _data/publications.yml from DOI.
Fetches metadata from CrossRef API and prompts for bilingual summaries.

Usage:
    python scripts/add_publication.py --doi "10.1021/xxx"
    python scripts/add_publication.py --batch publications.txt
"""

import argparse
import sys
import urllib.request
import json
import yaml
from pathlib import Path

# Journal abbreviation dictionary (sync with generate_publication.py if it exists)
JOURNAL_ABBREVIATIONS = {
    "Journal of the American Chemical Society": "J. Am. Chem. Soc.",
    "Journal of Physical Chemistry A": "J. Phys. Chem. A",
    "Journal of Physical Chemistry B": "J. Phys. Chem. B",
    "Journal of Physical Chemistry C": "J. Phys. Chem. C",
    "The Journal of Chemical Physics": "J. Chem. Phys.",
    "Physical Review Letters": "Phys. Rev. Lett.",
    "Physical Review A": "Phys. Rev. A",
    "Physical Review B": "Phys. Rev. B",
    "Physical Review E": "Phys. Rev. E",
    "Computer Physics Communications": "Comp. Phys. Comm.",
    "Geochimica et Cosmochimica Acta": "Geochimica et Cosmochimica Acta",
    "Physics and Chemistry of Solid State": "Phys. Chem. Solid St.",
    "ACS Earth and Space Chemistry": "ACS Earth Space Chem.",
}


def fetch_doi_metadata(doi):
    """Fetch publication metadata from CrossRef API."""
    url = f"https://api.crossref.org/works/{doi}"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'PublicationAdder/1.0 (mailto:Roman.Korol@USherbrooke.ca)'}
    )

    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data['message']
    except Exception as e:
        print(f"Error fetching DOI metadata for {doi}: {e}", file=sys.stderr)
        return None


def get_journal_abbreviation(full_name, short_title):
    """Get journal abbreviation."""
    # Prefer CrossRef short title
    if short_title and len(short_title) > 0:
        return short_title[0]

    # Check abbreviation dictionary
    for key, abbrev in JOURNAL_ABBREVIATIONS.items():
        if key.lower() in full_name.lower() or full_name.lower() in key.lower():
            return abbrev

    # Return full name if not found
    return full_name


def extract_page_range(metadata):
    """Extract page range from metadata."""
    page = metadata.get('page')
    article_number = metadata.get('article-number')

    if page:
        return page
    elif article_number:
        return article_number
    return ""


def get_next_id(data_file):
    """Get the next available publication ID."""
    if not data_file.exists():
        return 0

    with open(data_file, 'r', encoding='utf-8') as f:
        try:
            pubs = yaml.safe_load(f) or []
            if not pubs:
                return 0
            max_id = max(pub.get('id', -1) for pub in pubs)
            return max_id + 1
        except yaml.YAMLError:
            return 0


def create_publication_entry(doi, pub_id, highlight_author="Korol"):
    """Create a publication entry from DOI."""
    metadata = fetch_doi_metadata(doi)
    if not metadata:
        return None

    # Extract fields
    title = metadata.get('title', ['Untitled'])[0]
    authors_raw = metadata.get('author', [])

    # Get journal info
    short_title = metadata.get('short-container-title')
    full_journal = metadata.get('container-title', ['Unknown Journal'])[0]
    abbrev = get_journal_abbreviation(full_journal, short_title)

    year = metadata.get('published', {}).get('date-parts', [[None]])[0][0]
    volume = metadata.get('volume', '')
    issue = metadata.get('issue', '')
    pages = extract_page_range(metadata)

    # Format authors
    authors = []
    for author in authors_raw:
        family = author.get('family', '')
        given = author.get('given', '')

        # Check if this author should be highlighted
        is_highlight = highlight_author.lower() in family.lower()

        # Format initials (simple version - just take first letter of each part)
        if given:
            parts = given.replace('.', ' ').replace('-', ' ').split()
            initials = ' '.join([p[0] for p in parts if p])
        else:
            initials = ""

        authors.append({
            'family': family,
            'given': initials if initials else given,
            'highlight': is_highlight
        })

    # Prompt for summaries
    print(f"\n{'='*60}")
    print(f"Publication: {title}")
    print(f"{'='*60}\n")

    summary_en = input("English summary: ").strip()
    summary_fr = input("French summary (Résumé en français): ").strip()

    alt_text_en = input("English alt text for image: ").strip()
    alt_text_fr = input("French alt text for image (Texte alternatif en français): ").strip()

    is_highlight = input("Highlight this publication? (y/n): ").strip().lower() == 'y'

    # Create entry
    entry = {
        'id': pub_id,
        'doi': doi,
        'title': title,
        'authors': authors,
        'journal': {
            'full': full_journal,
            'abbrev': abbrev
        },
        'year': year,
        'image': f"{pub_id}.jpg"
    }

    if volume:
        entry['volume'] = str(volume)
    if issue:
        entry['issue'] = str(issue)
    if pages:
        entry['pages'] = pages
    if is_highlight:
        entry['highlight'] = True

    entry['alt_text'] = {
        'en': alt_text_en,
        'fr': alt_text_fr
    }
    entry['summary'] = {
        'en': summary_en,
        'fr': summary_fr
    }

    return entry


def main():
    parser = argparse.ArgumentParser(
        description='Add publications to _data/publications.yml from DOI'
    )
    parser.add_argument('--doi', help='DOI of the publication')
    parser.add_argument('--batch', help='Batch file with DOI|ALT_EN|SUMMARY_EN format')
    parser.add_argument('--highlight', default='Korol', help='Author name to highlight')

    args = parser.parse_args()

    if not args.doi and not args.batch:
        parser.error("Either --doi or --batch must be specified")

    # Locate data file
    repo_root = Path(__file__).parent.parent
    data_file = repo_root / '_data' / 'publications.yml'

    # Load existing publications
    if data_file.exists():
        with open(data_file, 'r', encoding='utf-8') as f:
            publications = yaml.safe_load(f) or []
    else:
        publications = []

    # Single DOI mode
    if args.doi:
        next_id = get_next_id(data_file)
        entry = create_publication_entry(args.doi, next_id, args.highlight)

        if entry:
            publications.append(entry)
            print(f"\n✓ Added publication {next_id}: {entry['title']}")
            print(f"  Remember to add image: images/publications/{next_id}.jpg")

    # Batch mode
    elif args.batch:
        print("Batch mode not yet implemented - use --doi for now")
        sys.exit(1)

    # Save back to file
    with open(data_file, 'w', encoding='utf-8') as f:
        yaml.dump(publications, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

    print(f"\n✓ Updated {data_file}")
    print(f"  Total publications: {len(publications)}")


if __name__ == '__main__':
    main()
