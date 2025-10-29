# Publication HTML Generator

This script automatically generates properly formatted publication HTML from DOIs using the CrossRef API.

## Features

- ✅ Fetches metadata from CrossRef API (title, authors, journal, volume, pages, year)
- ✅ Formats authors with initials without dots: `L E Longobardi` not `L.E. Longobardi`
- ✅ Spaces between initials: `R V` not `RV`
- ✅ Highlights specified author in bold (default: `R Korol`)
- ✅ Triple spacing (`&nbsp;&nbsp;&nbsp;`) between citation elements
- ✅ Proper journal abbreviations (can override)
- ✅ Complete HTML structure with modal image popup
- ✅ Matches exact formatting of papers 0, 1, 4 in research.html

## Installation

No external dependencies required (uses Python standard library: `urllib`, `json`)

## Usage

### Command

```bash
python generate_publication.py input_file.txt [--output publications.html] [--highlight "R Korol"]
```

### Input File Format

The input file should contain one publication per line in the format:
```
DOI|ALT_TEXT|SUMMARY
```

Lines starting with `#` are treated as comments and ignored.

**Important**: Publications are assigned IDs in **reverse order**:
- Last line in file = ID 0
- Second-to-last = ID 1
- etc.

### Example Input File

```text
# Publications for website
# Format: DOI|ALT_TEXT|SUMMARY

10.1021/acs.jpcc.7b12744|Log-log plot showing conductance patterns|We study DNA conductance computationally...

10.1021/jacs.6b11190|Molecular structures of boron radicals|We utilize bulky borocyclic radicals...

10.15330/pcss.22.2.380-387|SEM images of ZnO nanoparticles|We optimize ZnO nanoparticle synthesis...
```

In this example:
- Last line (ZnO) → ID 0
- Middle line (boron) → ID 1
- First line (DNA) → ID 2

### Parameters

| Parameter | Required | Description | Default |
|-----------|----------|-------------|---------|
| `input_file` | Yes | Input file with DOI\|ALT_TEXT\|SUMMARY format | - |
| `--highlight` | No | Author name to highlight in bold (matches family name) | `"R Korol"` |
| `--output` | No | Output file | `publications_output.html` |

## How It Works

### 1. Automatic ID Assignment
Publications are numbered in **reverse order** from the input file. This matches the typical workflow where newer publications are added to the end of the file but get higher ID numbers.

### 2. Automatic Image Detection
For each publication ID, the script looks for image files in this order:
- `images/publications/ID.jpg`
- `images/publications/ID.png`
- `images/publications/ID.jpeg`

If no image is found, it defaults to `.jpg` and shows a warning.

### 3. Journal Abbreviations
The script handles journal names intelligently:

**Step 1**: CrossRef API provides both full name and short title
- Full: "Journal of the American Chemical Society"
- Short: "J. Am. Chem. Soc."

**Step 2**: If short title exists, use it directly (most journals)

**Step 3**: If no short title, look up full name in built-in dictionary

**Step 4**: If not in dictionary, prompt user for abbreviation and save it to the script

### 4. Author Highlighting
The `--highlight` parameter matches authors by family name:
- Highlight "R Korol" matches: "R Korol", "R V Korol", "Roman Korol"
- Makes matching flexible across papers with different name formats

## Testing Results

All test publications formatted correctly:

### Paper 0 (ZnO Nanorods - ID 0)
- ✅ DOI: 10.15330/pcss.22.2.380-387
- ✅ Authors: `<b>R V Korol</b>`, `O M Yanchuk`, etc.
- ✅ Journal: Phys. Chem. Solid St. (from CrossRef short title)
- ✅ Citation: 22 (2), 380-387

### Paper 1 (Boron Radicals - ID 1)
- ✅ DOI: 10.1021/jacs.6b11190
- ✅ Authors: `L E Longobardi`, `P Zatsepin`, `<b>R Korol</b>`, etc.
- ✅ Journal: J. Am. Chem. Soc. (from CrossRef short title)
- ✅ Citation: 139 (1), 426-435

### Paper 2 (DNA Nanoelectronics - ID 2)
- ✅ DOI: 10.1021/acs.jpcc.7b12744
- ✅ Authors: `<b>R Korol</b> and D Segal`
- ✅ Journal: J. Phys. Chem. C (from CrossRef short title)
- ✅ Citation: 122 (8), 4206-4216

**All formatting matches exactly**: triple spacing, bolded author, correct journal abbreviations

## Output Format

The script generates HTML in this exact format:

```html
<li>
    <article class="box post">
        <header>
            <h3><a href="javascript:unhide('1');">
                Title from DOI</a></h3>
        </header>
        <div id="1" class="hidden">
            Authors,&nbsp;&nbsp;&nbsp;
        <i>Journal</i>&nbsp;&nbsp;&nbsp;<b>Year</b>&nbsp;&nbsp;&nbsp;Volume (Issue), Pages,&nbsp;&nbsp;&nbsp;<a
            href="https://doi.org/...">DOI</a>.
        <a class="image left"><img class="myBtn_multi" src="/images/publications/1.png"
            alt="Alt text"></a>

        <!-- The Modal -->
        <div class="modal modal_multi">
            <span class="close close_multi">×</span>
            <img class="modal-content"
                src="/images/publications/1.png" alt="Alt text"></a>
        </div>
        <p>Summary text here
        </p>
        </div>
    </article>
</li>
```

## Built-in Journal Abbreviations

The script includes abbreviations for journals without CrossRef short titles:

- Journal of the American Chemical Society → J. Am. Chem. Soc.
- Journal of Physical Chemistry A/B/C → J. Phys. Chem. A/B/C
- The Journal of Chemical Physics → J. Chem. Phys.
- Physical Review Letters → Phys. Rev. Lett.
- Physical Review A/B/E → Phys. Rev. A/B/E
- Computer Physics Communications → Comp. Phys. Comm.
- Geochimica et Cosmochimica Acta → Geochim. et Cosmochim. Acta
- Physics and Chemistry of Solid State → Phys. Chem. Solid St.
- ACS Earth and Space Chemistry → ACS Earth Space Chem.

**Note**: Most major journals provide short titles via CrossRef, so the dictionary is mainly for obscure journals

## Workflow

### Adding New Publications

1. **Prepare images**: Save figures as `images/publications/N.jpg` (or `.png`) where N is the next ID number

2. **Create input file**: Add new publications to the END of your input file:
   ```
   DOI|ALT_TEXT|SUMMARY
   ```

3. **Run generator**:
   ```bash
   python generate_publication.py publications.txt
   ```

4. **Copy HTML**: Copy the generated HTML from `publications_output.html` into:
   - `en/research.html` (publications section)
   - `fr/recherche.html` (with translated title and summary)

5. **Handle unknown journals**: If prompted, provide abbreviations. The script will save them automatically.

### Example Session

```bash
$ python generate_publication.py my_pubs.txt
Processing publication 1/3 (ID=2): 10.1021/acs.jpcc.7b12744
Processing publication 2/3 (ID=1): 10.1021/jacs.6b11190
Processing publication 3/3 (ID=0): 10.15330/pcss.22.2.380-387

Generated 3 publications in publications_output.html
```

## Files

- [generate_publication.py](generate_publication.py) - Main script
- [test_publications.txt](test_publications.txt) - Example input file format
- [PUBLICATION_GENERATOR_README.md](PUBLICATION_GENERATOR_README.md) - This file
