#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Master build script - regenerates website and PDFs from _data/

This script:
1. Validates YAML data files
2. Generates LaTeX files from YAML
3. Compiles PDFs (if pdflatex available)
4. Builds Jekyll website

Usage:
    python scripts/build_all.py
    python scripts/build_all.py --skip-pdf    # Skip PDF compilation
    python scripts/build_all.py --skip-jekyll # Skip Jekyll build
"""

import subprocess
import sys
import argparse
from pathlib import Path
import yaml
import shutil
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def print_header(message):
    """Print a formatted header."""
    print(f"\n{'='*60}")
    print(f"▶ {message}")
    print(f"{'='*60}")


def run_command(cmd, description, shell=True, check=True):
    """Run a command and handle errors."""
    print_header(description)
    try:
        result = subprocess.run(cmd, shell=shell, check=check, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        if result.returncode == 0:
            print(f"✓ {description} complete")
            return True
        else:
            print(f"✗ {description} failed")
            if result.stderr:
                print(result.stderr)
            return False
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        if e.stderr:
            print(e.stderr)
        return False
    except FileNotFoundError:
        print(f"✗ Command not found. {description} skipped.")
        return False


def validate_yaml_files(repo_root):
    """Validate YAML data files."""
    print_header("Validating YAML data files")

    data_dir = repo_root / '_data'
    required_files = ['publications.yml', 'news_en.yml', 'news_fr.yml', 'team.yml']

    all_valid = True
    for filename in required_files:
        filepath = data_dir / filename
        if not filepath.exists():
            print(f"⚠ Warning: {filename} not found")
            continue

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
                print(f"✓ {filename}: Valid YAML")

                # Additional checks
                if filename == 'publications.yml':
                    if data:
                        print(f"  Found {len(data)} publications")
                elif filename in ['news_en.yml', 'news_fr.yml']:
                    if data:
                        print(f"  Found {len(data)} news items")
                elif filename == 'team.yml':
                    if data and 'current' in data:
                        print(f"  Found {len(data['current'])} current members")

        except yaml.YAMLError as e:
            print(f"✗ {filename}: Invalid YAML - {e}")
            all_valid = False

    if all_valid:
        print(f"\n✓ All YAML files validated")
    else:
        print(f"\n✗ Some YAML files have errors")

    return all_valid


def generate_latex(repo_root):
    """Generate LaTeX files from YAML."""
    script_path = repo_root / 'scripts' / 'generate_latex.py'
    return run_command(
        f'"{sys.executable}" "{script_path}"',
        "Generating LaTeX publication list from YAML"
    )


def compile_pdfs(repo_root):
    """Compile LaTeX PDFs."""
    pdf_dir = repo_root / 'make' / 'pdf'

    if not pdf_dir.exists():
        print(f"⚠ PDF directory not found: {pdf_dir}")
        return False

    # Check if pdflatex is available
    try:
        subprocess.run(['pdflatex', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠ pdflatex not found - skipping PDF compilation")
        print("  Install TeX Live or MiKTeX to enable PDF generation")
        return False

    # Compile CV
    cv_success = run_command(
        f'cd "{pdf_dir}" && pdflatex -interaction=nonstopmode CV_Korol.tex',
        "Compiling CV_Korol.pdf",
        check=False
    )

    # Compile publication list
    publist_success = run_command(
        f'cd "{pdf_dir}" && pdflatex -interaction=nonstopmode Publist.tex',
        "Compiling Publist.pdf",
        check=False
    )

    # Copy PDFs to web-accessible location if compilation succeeded
    pdf_output = repo_root / 'pdf'
    pdf_output.mkdir(exist_ok=True)

    if cv_success and (pdf_dir / 'CV_Korol.pdf').exists():
        shutil.copy(pdf_dir / 'CV_Korol.pdf', pdf_output / 'CV_Korol.pdf')
        print(f"✓ Copied CV_Korol.pdf to pdf/")

    if publist_success and (pdf_dir / 'Publist.pdf').exists():
        shutil.copy(pdf_dir / 'Publist.pdf', pdf_output / 'Publist.pdf')
        print(f"✓ Copied Publist.pdf to pdf/")

    return cv_success or publist_success


def build_jekyll(repo_root):
    """Build Jekyll website."""
    # Check if bundle is available
    try:
        subprocess.run(['bundle', '--version'], capture_output=True, check=True)
        return run_command(
            f'cd "{repo_root}" && bundle exec jekyll build',
            "Building Jekyll website"
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠ bundle not found - trying jekyll directly")
        return run_command(
            f'cd "{repo_root}" && jekyll build',
            "Building Jekyll website",
            check=False
        )


def main():
    parser = argparse.ArgumentParser(
        description='Build Korol Group website and PDFs from _data/'
    )
    parser.add_argument('--skip-pdf', action='store_true',
                        help='Skip PDF compilation')
    parser.add_argument('--skip-jekyll', action='store_true',
                        help='Skip Jekyll build')
    args = parser.parse_args()

    print("\n🔨 Building Korol Group Website")

    repo_root = Path(__file__).parent.parent

    # Step 1: Validate YAML
    if not validate_yaml_files(repo_root):
        print("\n⚠ Validation errors found. Continue? (y/n)")
        if input().strip().lower() != 'y':
            sys.exit(1)

    # Step 2: Generate LaTeX
    if not generate_latex(repo_root):
        print("\n⚠ LaTeX generation failed")

    # Step 3: Compile PDFs
    if not args.skip_pdf:
        compile_pdfs(repo_root)
    else:
        print("\n⊘ Skipping PDF compilation (--skip-pdf)")

    # Step 4: Build Jekyll
    if not args.skip_jekyll:
        if build_jekyll(repo_root):
            print("\n✅ Build complete! Site ready in _site/")
        else:
            print("\n⚠ Jekyll build had issues")
    else:
        print("\n⊘ Skipping Jekyll build (--skip-jekyll)")

    print("\n" + "="*60)
    print("Build process finished")
    print("="*60)


if __name__ == '__main__':
    main()
