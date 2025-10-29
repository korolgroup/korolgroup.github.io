#!/usr/bin/env python3
"""
Generate publication HTML from DOI.
Fetches metadata from CrossRef API and formats it exactly like the research.html publications.

Usage:
    python generate_publication.py publications.txt

Input file format (one publication per line, pipe-separated):
    DOI|ALT_TEXT|SUMMARY
"""

import argparse
import sys
import re
import urllib.request
import json
import os

# Dictionary of journal abbreviations
# Maps full journal names (or partial matches) to their abbreviations
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
    "Geochimica et Cosmochimica Acta": "Geochim. et Cosmochim. Acta",
    "Physics and Chemistry of Solid State": "Phys. Chem. Solid St.",
    "ACS Earth and Space Chemistry": "ACS Earth Space Chem.",
}


def format_author_name(author):
    """
    Format author name as initials without dots and space between them.
    Example: "John Smith" -> "J Smith", "J.K. Rowling" -> "J K Rowling"
    """
    given = author.get('given', '')
    family = author.get('family', '')

    if not given:
        return family

    # Extract initials from given name(s)
    # Split by spaces, hyphens, or dots
    parts = re.split(r'[\s\-\.]+', given)
    initials = ' '.join([p[0] for p in parts if p])

    return f"{initials} {family}"


def format_authors(authors, highlight_name="R Korol"):
    """
    Format list of authors with proper spacing.
    Highlights the specified author name in bold.
    Matches against family name if highlight_name contains space.
    """
    formatted = []
    # Extract family name from highlight_name for matching
    highlight_family = highlight_name.split()[-1] if highlight_name else None

    for author in authors:
        name = format_author_name(author)
        if name:  # Only add if name is not empty
            # Check if this author should be highlighted
            should_highlight = False
            if highlight_name:
                # Match full name or just family name
                if highlight_name in name or (highlight_family and highlight_family in name):
                    should_highlight = True

            if should_highlight:
                formatted.append(f"<b>{name}</b>")
            else:
                formatted.append(name)

    # Handle empty list
    if not formatted:
        return "Unknown Authors"

    # Join with commas and "and" before last author
    if len(formatted) == 1:
        return formatted[0]
    elif len(formatted) == 2:
        return f"{formatted[0]} and {formatted[1]}"
    else:
        return ', '.join(formatted[:-1]) + f' and {formatted[-1]}'


def fetch_doi_metadata(doi):
    """
    Fetch publication metadata from CrossRef API.
    """
    url = f"https://api.crossref.org/works/{doi}"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'PublicationGenerator/1.0 (mailto:Roman.Korol@USherbrooke.ca)'}
    )

    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data['message']
    except Exception as e:
        print(f"Error fetching DOI metadata for {doi}: {e}", file=sys.stderr)
        return None


def extract_page_range(metadata):
    """
    Extract page range from metadata.
    Returns formatted as "first-last" or just article number.
    """
    page = metadata.get('page')
    article_number = metadata.get('article-number')

    if page:
        return page
    elif article_number:
        return article_number
    return ""


def get_journal_abbreviation(full_name, abbreviations_dict):
    """
    Get journal abbreviation from dictionary.
    Returns abbreviation if found, otherwise returns full name.
    """
    # Try exact match first
    if full_name in abbreviations_dict:
        return abbreviations_dict[full_name]

    # Try partial match
    for key, abbrev in abbreviations_dict.items():
        if key.lower() in full_name.lower() or full_name.lower() in key.lower():
            return abbrev

    # Not found, return full name
    return full_name


def generate_publication_html(doi, pub_id, image_file, summary, alt_text="", highlight_author="R Korol", journal_abbrevs=None):
    """
    Generate complete publication HTML block.
    """
    if journal_abbrevs is None:
        journal_abbrevs = JOURNAL_ABBREVIATIONS

    # Fetch metadata
    metadata = fetch_doi_metadata(doi)
    if not metadata:
        return None, None

    # Extract fields
    title = metadata.get('title', ['Untitled'])[0]
    authors = metadata.get('author', [])

    # Get journal name - prefer short title if available
    short_title = metadata.get('short-container-title')
    full_journal = metadata.get('container-title', ['Unknown Journal'])[0]
    has_short_title = bool(short_title and len(short_title) > 0)

    # Use short title directly if available, otherwise look up abbreviation
    if has_short_title:
        container_title = short_title[0]
    else:
        container_title = get_journal_abbreviation(full_journal, journal_abbrevs)

    year = metadata.get('published', {}).get('date-parts', [[None]])[0][0]
    volume = metadata.get('volume', '')
    issue = metadata.get('issue', '')
    pages = extract_page_range(metadata)

    # Format components
    author_string = format_authors(authors, highlight_author)

    # Build citation line
    citation = f"{author_string},&nbsp;&nbsp;&nbsp;\n"
    citation += f"\t\t\t\t\t\t\t\t\t<i>{container_title}</i>&nbsp;&nbsp;&nbsp;<b>{year}</b>&nbsp;&nbsp;&nbsp;"

    # Add volume and issue
    if volume:
        citation += f"{volume}"
    if issue:
        citation += f" ({issue})"

    # Add pages
    if pages:
        if volume or issue:
            citation += f", {pages}"
        else:
            citation += f"{pages}"

    # Add DOI link
    citation += f",&nbsp;&nbsp;&nbsp;<a\n\t\t\t\t\t\t\t\t\t\thref=\"https://doi.org/{doi}\">{doi}</a>."

    # Use title as alt text if not provided
    if not alt_text:
        alt_text = title

    # Generate HTML
    html = f"""
\t\t\t\t\t\t\t<li>
\t\t\t\t\t\t\t\t<article class="box post">
\t\t\t\t\t\t\t\t\t<header>
\t\t\t\t\t\t\t\t\t\t<h3><a href="javascript:unhide('{pub_id}');">
\t\t\t\t\t\t\t\t\t\t\t{title}</a></h3>
\t\t\t\t\t\t\t\t\t</header>
\t\t\t\t\t\t\t\t\t<div id="{pub_id}" class="hidden">
\t\t\t\t\t\t\t\t\t\t{citation}
\t\t\t\t\t\t\t\t\t<a class="image left"><img class="myBtn_multi" src="/images/publications/{image_file}"
\t\t\t\t\t\t\t\t\t\talt="{alt_text}"></a>

\t\t\t\t\t\t\t\t\t<!-- The Modal -->
\t\t\t\t\t\t\t\t\t<div class="modal modal_multi">

\t\t\t\t\t\t\t\t\t\t<span class="close close_multi">×</span>
\t\t\t\t\t\t\t\t\t\t<img class="modal-content"
\t\t\t\t\t\t\t\t\t\t\tsrc="/images/publications/{image_file}" alt="{alt_text}"></a>
\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t<p>{summary}
\t\t\t\t\t\t\t\t\t</p>
\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t</article>

\t\t\t\t\t\t\t</li>
"""

    return html, (full_journal, container_title, has_short_title)


def update_journal_abbreviations(new_abbreviations):
    """
    Update the script file with new journal abbreviations.
    """
    script_path = __file__

    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the JOURNAL_ABBREVIATIONS dictionary
    pattern = r'JOURNAL_ABBREVIATIONS = \{[^}]*\}'

    # Build new dictionary string
    dict_entries = []
    for full_name, abbrev in sorted(new_abbreviations.items()):
        dict_entries.append(f'    "{full_name}": "{abbrev}",')

    new_dict = "JOURNAL_ABBREVIATIONS = {\n" + "\n".join(dict_entries) + "\n}"

    # Replace in content
    new_content = re.sub(pattern, new_dict, content, flags=re.DOTALL)

    # Write back
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Updated {script_path} with new journal abbreviations")


def main():
    parser = argparse.ArgumentParser(
        description='Generate publication HTML from DOI list',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Input file format (one publication per line, pipe-separated):
    DOI|ALT_TEXT|SUMMARY

Example:
    10.1021/jacs.6b11190|Figure description here|Summary paragraph text here
    10.1021/acs.jpcc.7b12744|Another figure|Another summary

The script will:
- Automatically assign IDs in reverse order (last line = ID 0)
- Use ID.jpg or ID.png as image filename (checks which exists)
- Look up journal abbreviations from built-in dictionary
- Prompt for abbreviations of unknown journals and save them
        """
    )

    parser.add_argument('input_file', help='Input file with DOI|ALT_TEXT|SUMMARY format')
    parser.add_argument('--highlight', default='R Korol', help='Author name to highlight in bold')
    parser.add_argument('--output', help='Output file (default: publications_output.html)')

    args = parser.parse_args()

    # Read input file
    publications = []
    with open(args.input_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue

            parts = line.split('|')
            if len(parts) >= 3:
                doi = parts[0].strip()
                alt_text = parts[1].strip()
                summary = parts[2].strip()
                publications.append((doi, alt_text, summary))

    if not publications:
        print("No publications found in input file", file=sys.stderr)
        sys.exit(1)

    # Assign IDs in reverse order (last line = 0)
    total = len(publications)
    output_html = []
    unknown_journals = {}  # Map full name to current abbreviation used

    for idx, (doi, alt_text, summary) in enumerate(publications):
        pub_id = total - idx - 1

        # Determine image file extension
        image_base = f"{pub_id}"
        image_file = None
        for ext in ['.jpg', '.png', '.jpeg']:
            test_path = os.path.join('images', 'publications', f"{image_base}{ext}")
            if os.path.exists(test_path):
                image_file = f"{image_base}{ext}"
                break

        if not image_file:
            # Default to .jpg if file doesn't exist yet
            image_file = f"{image_base}.jpg"
            print(f"⚠ Warning: Image file not found for ID {pub_id}, defaulting to {image_file}", file=sys.stderr)

        print(f"Processing publication {idx+1}/{total} (ID={pub_id}): {doi}")

        html, journal_info = generate_publication_html(
            doi,
            pub_id,
            image_file,
            summary,
            alt_text,
            args.highlight
        )

        if html:
            output_html.append(html)

            # Track if journal abbreviation was not found
            if journal_info:
                full_name, used_abbrev, has_short = journal_info
                # Only prompt if no short title and full name equals abbreviation (not found in dict)
                if not has_short and full_name == used_abbrev and full_name not in JOURNAL_ABBREVIATIONS:
                    # Used full name because abbreviation not found
                    unknown_journals[full_name] = used_abbrev

    # Write output
    output_file = args.output or 'publications_output.html'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_html))

    print(f"\nGenerated {len(output_html)} publications in {output_file}")

    # Prompt for unknown journal abbreviations
    if unknown_journals:
        print("\n" + "="*60)
        print("JOURNAL ABBREVIATIONS NEEDED")
        print("="*60)
        print("\nThe following journals were not found in the abbreviation dictionary.")
        print("Please provide abbreviations (press Enter to keep full name):\n")

        updated_abbrevs = dict(JOURNAL_ABBREVIATIONS)

        for full_name in sorted(unknown_journals.keys()):
            abbrev = input(f"\n{full_name}\nAbbreviation: ").strip()
            if abbrev:
                updated_abbrevs[full_name] = abbrev
                print(f"  ✓ Will use: {abbrev}")
            else:
                print(f"  ✓ Will use full name")

        # Update script with new abbreviations
        if len(updated_abbrevs) > len(JOURNAL_ABBREVIATIONS):
            update_journal_abbreviations(updated_abbrevs)


if __name__ == '__main__':
    main()
