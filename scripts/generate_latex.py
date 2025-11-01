#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate LaTeX publication list from _data/publications.yml.
Creates pubs.tex file that can be included in CV and publication list.

Usage:
    python scripts/generate_latex.py
"""

import yaml
from pathlib import Path
import sys
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def format_author_latex(author, is_last=False, is_second_to_last=False):
    """Format a single author for LaTeX."""
    family = author.get('family', '')
    given = author.get('given', '')
    is_corresponding = author.get('corresponding', False)

    # Build name with asterisk after family name
    if is_corresponding:
        family_with_asterisk = f"{family}*"
        if given:
            name = f"{family_with_asterisk}, {given}"
        else:
            name = family_with_asterisk
    else:
        if given:
            name = f"{family}, {given}"
        else:
            name = family

    # Add separator
    if is_last:
        return name
    elif is_second_to_last:
        return f"{name};"
    else:
        return f"{name};"


def format_authors_latex(authors):
    """Format author list for LaTeX."""
    if not authors:
        return "Unknown Authors"

    n = len(authors)
    formatted = []

    for i, author in enumerate(authors):
        is_last = (i == n - 1)
        is_second_to_last = (i == n - 2)
        formatted.append(format_author_latex(author, is_last, is_second_to_last))

    return ' '.join(formatted)


def format_publication_latex(pub, pub_number):
    """Format a single publication for LaTeX."""
    # Authors
    authors = format_authors_latex(pub.get('authors', []))

    # Title
    title = pub.get('title', 'Untitled')

    # Journal
    journal_abbrev = pub['journal']['abbrev']

    # Year
    year = pub.get('year', '')

    # Volume, issue, pages
    volume = pub.get('volume', '')
    issue = pub.get('issue', '')
    pages = pub.get('pages', '')

    # DOI
    doi = pub.get('doi', '')

    # Build citation
    latex = f"\\item[{pub_number}.] {authors} {title}. "
    latex += f"\\textit{{{journal_abbrev}}} \\textbf{{{year}}}"

    if volume or issue or pages:
        latex += ", "
        if volume:
            latex += f"{volume}"
        if issue:
            latex += f" ({issue})"
        if pages:
            if volume:
                latex += f", {pages}"
            else:
                latex += f"{pages}"

    if doi:
        latex += f". DOI: \\href{{https://doi.org/{doi}}}{{{doi}}}"

    latex += "\n\\vspace{0.1cm}\n"

    return latex


def generate_pubs_tex(publications, output_file):
    """Generate pubs.tex file."""
    # Sort publications by ID in reverse order (newest first)
    sorted_pubs = sorted(publications, key=lambda x: x.get('id', 0), reverse=True)

    # Generate LaTeX
    latex_lines = ["\n\\begin{enumerate}\n"]

    for i, pub in enumerate(sorted_pubs):
        pub_number = len(sorted_pubs) - i
        latex_lines.append(format_publication_latex(pub, pub_number))

    latex_lines.append("\\end{enumerate}\n")

    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(latex_lines)

    print(f"✓ Generated {output_file}")
    print(f"  Total publications: {len(sorted_pubs)}")


def main():
    repo_root = Path(__file__).parent.parent
    data_file = repo_root / '_data' / 'publications.yml'
    output_file = repo_root / 'pdf' / 'pubs.tex'

    # Load publications
    if not data_file.exists():
        print(f"Error: {data_file} not found")
        return

    with open(data_file, 'r', encoding='utf-8') as f:
        publications = yaml.safe_load(f) or []

    if not publications:
        print("Warning: No publications found in YAML file")
        return

    # Ensure output directory exists
    output_file.parent.mkdir(parents=True, exist_ok=True)

    # Generate pubs.tex
    generate_pubs_tex(publications, output_file)

    print("\n✓ LaTeX publication list generated successfully")
    print(f"  You can now compile pdf/CV_Korol.tex and pdf/Publist.tex")


if __name__ == '__main__':
    main()
