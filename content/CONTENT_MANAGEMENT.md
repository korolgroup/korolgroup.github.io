# Content Management System

This document explains how to use the content management system for Roman Korol's academic website.

## Overview

The website now uses a structured content management approach with:
- **JSON Data Files** for all content storage
- **Automated Generation** of HTML from structured data
- **Academic Integration** with LaTeX and external sources
- **Content Validation** and quality checks
- **Easy Editing Interface** for content updates

## File Structure

```
data/                     # Structured content data
├── personal.json        # Personal information and biography
├── publications.json    # Research publications and metrics
├── news.json           # News items and announcements
├── resources.json      # Educational resources and links
└── activities.json     # Activities and outreach

content/
├── scripts/            # Content management scripts
│   ├── generate-content.js      # Generate HTML from data
│   ├── academic-integration.js  # Academic system integration
│   └── content-editor.js        # Interactive content editor
├── templates/          # HTML templates
└── generated/         # Auto-generated content files
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Content
```bash
# Generate all content from data files
npm run content:generate

# Watch for changes and auto-regenerate
npm run content:watch
```

### 3. Edit Content
```bash
# Interactive content editor
npm run content:edit

# Or edit JSON files directly in data/ folder
```

### 4. Academic Integration
```bash
# Update publications from external sources
npm run content:academic

# Generate LaTeX documents
node content/scripts/academic-integration.js generate
```

## Content Types

### Personal Information (`personal.json`)

Contains biographical information, education, research interests, and social links.

**Key sections:**
- `name`, `title`, `institution` - Basic info
- `background.education` - Educational history
- `research` - Research focus and advisors
- `social` - Social media and academic profiles
- `documents` - Links to CV, publications, etc.

### Publications (`publications.json`)

Research publications with metadata and statistics.

**Publication structure:**
```json
{
  "id": "unique-identifier",
  "title": "Publication Title",
  "authors": ["Author 1", "Author 2"],
  "journal": "Journal Name",
  "year": 2024,
  "doi": "10.1000/example",
  "abstract": "Publication abstract",
  "image": "images/publications/thumb.jpg",
  "type": "journal|conference|preprint",
  "status": "published|submitted|in_preparation",
  "awards": ["Editor's Pick"]
}
```

### News Items (`news.json`)

News, updates, and announcements with categorization.

**News item structure:**
```json
{
  "id": "2024-09-event",
  "title": "Event Title",
  "date": "2024-09-15",
  "category": "academic|research|personal|awards|outreach",
  "summary": "Brief summary",
  "content": "Full content",
  "images": ["image1.jpg"],
  "featured": true,
  "tags": ["tag1", "tag2"]
}
```

### Resources (`resources.json`)

Educational resources organized by category.

**Resource structure:**
```json
{
  "title": "Resource Title",
  "type": "course|tutorial|tool|database",
  "description": "Resource description",
  "links": [
    {
      "title": "Link Title",
      "url": "https://example.com",
      "provider": "Provider Name"
    }
  ]
}
```

### Activities (`activities.json`)

Professional activities and outreach organized by type.

## Content Management Commands

### Development Workflow
```bash
# Start development with content watching
npm run dev

# Generate content only
npm run content:generate

# Watch for data changes
npm run content:watch
```

### Content Editing
```bash
# Interactive content editor
npm run content:edit

# Backup current content
npm run content:backup
```

### Academic Integration
```bash
# Full academic integration
npm run content:academic

# Individual tasks
node content/scripts/academic-integration.js update    # Update publications
node content/scripts/academic-integration.js validate # Validate data
node content/scripts/academic-integration.js metrics  # Generate metrics
node content/scripts/academic-integration.js generate # Generate documents
```

### Quality Assurance
```bash
# Test content validity
npm run test:content

# Full test suite
npm test
```

## Content Editing Workflows

### Adding New Publication

1. **Manual Method:**
   ```bash
   npm run content:edit
   # Choose "Add Publication"
   ```

2. **JSON Method:**
   Edit `data/publications.json` directly and run:
   ```bash
   npm run content:generate
   ```

3. **Academic Integration:**
   Add to BibTeX file and run:
   ```bash
   npm run content:academic
   ```

### Adding News Item

1. **Interactive:**
   ```bash
   npm run content:edit
   # Choose "Add News Item"
   ```

2. **Direct JSON editing:**
   Add to `data/news.json` and regenerate content

### Updating Personal Information

Edit `data/personal.json` directly or use the content editor.

## Automated Features

### Content Generation
- HTML automatically generated from JSON data
- Templates ensure consistent formatting
- SEO metadata automatically created
- Sitemap.xml generated

### Academic Integration
- Publications can be imported from BibTeX
- LaTeX documents auto-generated from data
- Academic metrics calculated automatically
- Data validation ensures quality

### Performance Optimization
- Structured data for search engines
- Optimized image loading
- Content caching headers
- Automated testing

## Content Validation

The system includes validation for:
- Required fields in all content types
- Date format validation
- URL format checking
- Duplicate detection
- Image file existence
- Academic data integrity

Run validation:
```bash
npm run test:content
```

## Backup and Recovery

### Create Backup
```bash
npm run content:backup
```

Backups are stored in `backups/` with timestamps.

### Restore from Backup
1. Copy backup files to `data/` directory
2. Run `npm run content:generate`

## Integration with External Systems

### Academic Databases
- ORCID integration (planned)
- Google Scholar sync (planned)
- Institutional repository connections (planned)

### LaTeX Integration
- CV auto-generation from personal data
- Publication list compilation
- Research summary creation

### Version Control
- All content changes tracked in Git
- Structured data enables clean diffs
- Easy collaboration on content

## Troubleshooting

### Common Issues

1. **Content not updating:**
   ```bash
   npm run content:generate
   ```

2. **Validation errors:**
   ```bash
   npm run test:content
   ```

3. **Missing dependencies:**
   ```bash
   npm install
   ```

4. **Template errors:**
   Check `content/generated/` for generated files

### Debug Mode
Set `DEBUG=true` when running scripts for verbose output.

## Future Enhancements

- Web-based content editor interface
- Real-time preview during editing
- Automated publication detection
- Content scheduling and publishing
- Multi-language support
- Advanced analytics integration

## Best Practices

1. **Always backup before major changes**
2. **Validate content after edits**
3. **Use semantic versioning for content**
4. **Keep images optimized and accessible**
5. **Test across different devices**
6. **Follow academic citation standards**
7. **Maintain consistent data structure**

---

For technical support or questions about the content management system, refer to the main documentation or contact the development team.