#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validate YAML data files for the Korol Group website.
Quick validation without building anything.

Usage:
    python scripts/validate_data.py
"""

import yaml
from pathlib import Path
import sys
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def validate_file(filepath, name, required_fields=None):
    """Validate a single YAML file."""
    print(f"\n{'='*60}")
    print(f"Validating: {name}")
    print(f"{'='*60}")

    if not filepath.exists():
        print(f"⚠ Warning: {name} not found")
        return False

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)

        print(f"✓ Valid YAML syntax")

        if data is None:
            print(f"⚠ Warning: File is empty")
            return True

        # Check structure based on file type
        if isinstance(data, list):
            print(f"  Type: List with {len(data)} items")

            if required_fields and len(data) > 0:
                first_item = data[0]
                missing = []
                for field in required_fields:
                    if field not in first_item:
                        missing.append(field)

                if missing:
                    print(f"  ⚠ First item missing fields: {', '.join(missing)}")
                else:
                    print(f"  ✓ First item has required fields: {', '.join(required_fields)}")

        elif isinstance(data, dict):
            print(f"  Type: Dictionary with keys: {', '.join(data.keys())}")
        else:
            print(f"  Type: {type(data)}")

        return True

    except yaml.YAMLError as e:
        print(f"✗ YAML Syntax Error:")
        print(f"  {e}")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def main():
    print("\n" + "="*60)
    print("YAML Data Validation for Korol Group Website")
    print("="*60)

    repo_root = Path(__file__).parent.parent
    data_dir = repo_root / '_data'

    all_valid = True

    # Validate publications.yml
    all_valid &= validate_file(
        data_dir / 'publications.yml',
        'publications.yml',
        required_fields=['id', 'doi', 'title', 'authors', 'year']
    )

    # Validate news_en.yml
    all_valid &= validate_file(
        data_dir / 'news_en.yml',
        'news_en.yml',
        required_fields=['date', 'year', 'title', 'content']
    )

    # Validate news_fr.yml
    all_valid &= validate_file(
        data_dir / 'news_fr.yml',
        'news_fr.yml',
        required_fields=['date', 'year', 'title', 'content']
    )

    # Validate team.yml
    team_valid = validate_file(
        data_dir / 'team.yml',
        'team.yml'
    )
    all_valid &= team_valid

    # Additional team.yml checks
    if team_valid:
        try:
            with open(data_dir / 'team.yml', 'r', encoding='utf-8') as f:
                team_data = yaml.safe_load(f)
                if 'current' in team_data:
                    print(f"  ✓ Has 'current' members: {len(team_data['current'])}")
                if 'former' in team_data:
                    print(f"  ✓ Has 'former' members: {len(team_data['former'])}")
        except:
            pass

    # Summary
    print("\n" + "="*60)
    if all_valid:
        print("✓ All YAML files are valid!")
        print("="*60)
        sys.exit(0)
    else:
        print("✗ Some YAML files have errors")
        print("="*60)
        sys.exit(1)


if __name__ == '__main__':
    main()
