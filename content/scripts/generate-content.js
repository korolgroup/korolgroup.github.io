#!/usr/bin/env node

/**
 * Content Generator for Roman Korol's Website
 * Generates HTML content from structured JSON data
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    dataDir: path.join(__dirname, '../../data'),
    templateDir: path.join(__dirname, '../templates'),
    outputDir: path.join(__dirname, '../..'),
    baseUrl: 'https://romankorol.com'
};

/**
 * Load JSON data file
 */
function loadData(filename) {
    const filepath = path.join(CONFIG.dataDir, filename);
    try {
        const data = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading ${filename}:`, error.message);
        return null;
    }
}

/**
 * Load template file
 */
function loadTemplate(filename) {
    const filepath = path.join(CONFIG.templateDir, filename);
    try {
        return fs.readFileSync(filepath, 'utf8');
    } catch (error) {
        console.error(`Error loading template ${filename}:`, error.message);
        return '';
    }
}

/**
 * Simple template engine
 */
function renderTemplate(template, data) {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, key) => {
        const value = key.split('.').reduce((obj, prop) => obj?.[prop], data);
        return value !== undefined ? value : match;
    });
}

/**
 * Generate publication HTML
 */
function generatePublicationHTML(pub) {
    const authorsStr = pub.authors.join(', ').replace('R Korol', '<b>R Korol</b>');
    const awards = pub.awards ? pub.awards.map(award =>
        `<span class="award">${award}</span>`).join(' ') : '';

    return `
    <div class="publication" data-year="${pub.year}" data-status="${pub.status}">
        <div id="${pub.id}" class="hidden">
            ${authorsStr} <i>${pub.journal}</i> <b>${pub.year}</b>
            ${pub.doi ? `<a href="https://doi.org/${pub.doi}">${pub.doi}</a>` : ''}
            ${awards}
            <a class="image left">
                <img class="myBtn_multi" src="${pub.image}"
                     alt="Publication thumbnail for ${pub.title}"
                     title="${pub.title}">
            </a>
            <div class="modal modal_multi">
                <span class="close close_multi">×</span>
                <img class="modal-content" src="${pub.image}"
                     alt="Research figure: ${pub.title}">
            </div>
            <p>${pub.abstract}</p>
        </div>
    </div>`;
}

/**
 * Generate news item HTML
 */
function generateNewsHTML(item) {
    const dateFormatted = new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const images = item.images?.map(img =>
        `<img class="modal-content" src="${img}"
              alt="${item.title}" loading="lazy">`).join('') || '';

    const tags = item.tags?.map(tag =>
        `<span class="tag">${tag}</span>`).join(' ') || '';

    return `
    <article class="news-item ${item.featured ? 'featured' : ''}"
             data-category="${item.category}">
        <header>
            <h3>${item.title}</h3>
            <div class="date">${dateFormatted}</div>
            <div class="category">${item.category}</div>
        </header>
        <p>${item.summary}</p>
        <div class="content">${item.content}</div>
        <div class="images">${images}</div>
        <div class="tags">${tags}</div>
    </article>`;
}

/**
 * Generate resource section HTML
 */
function generateResourceHTML(section) {
    const resources = section.resources.map(resource => {
        const links = resource.links.map(link =>
            `<li><a href="${link.url}" target="_blank" rel="noopener noreferrer">
                <strong>${link.title}</strong></a> - ${link.provider}</li>`
        ).join('');

        return `
        <div class="resource">
            <h4>${resource.title}</h4>
            <p>${resource.description}</p>
            <ul>${links}</ul>
        </div>`;
    }).join('');

    return `
    <section class="resource-section">
        <h3>${section.title}</h3>
        <p>${section.description}</p>
        ${resources}
    </section>`;
}

/**
 * Generate activity section HTML
 */
function generateActivityHTML(section) {
    const activities = section.activities.map(activity => `
        <div class="activity">
            <h4>${activity.title}</h4>
            <p>${activity.description}</p>
            ${activity.image ?
                `<img src="${activity.image}"
                      alt="${activity.title}"
                      class="activity-image" loading="lazy">` : ''}
            <div class="activity-meta">
                ${activity.date ? `<span class="date">${activity.date}</span>` : ''}
                ${activity.location ? `<span class="location">${activity.location}</span>` : ''}
            </div>
        </div>
    `).join('');

    return `
    <section id="${section.id}" class="activity-section">
        <h3>${section.title}</h3>
        <p>${section.description}</p>
        <div class="activities">${activities}</div>
    </section>`;
}

/**
 * Generate structured data for SEO
 */
function generateStructuredData(personal, publications) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": personal.name,
        "jobTitle": personal.title,
        "worksFor": {
            "@type": "Organization",
            "name": personal.institution.name,
            "url": personal.institution.url
        },
        "url": CONFIG.baseUrl,
        "sameAs": Object.values(personal.social),
        "knowsAbout": ["Quantum Dynamics", "Computational Chemistry", "Semiclassical Methods"],
        "alumniOf": personal.background.education.map(edu => ({
            "@type": "Organization",
            "name": edu.institution,
            "url": edu.url
        }))
    };

    if (publications) {
        structuredData.hasCredential = publications.publications.map(pub => ({
            "@type": "ScholarlyArticle",
            "name": pub.title,
            "author": pub.authors,
            "datePublished": pub.year.toString(),
            "publisher": pub.journal,
            "url": pub.doi ? `https://doi.org/${pub.doi}` : undefined
        }));
    }

    return JSON.stringify(structuredData, null, 2);
}

/**
 * Generate sitemap.xml
 */
function generateSitemap() {
    const pages = [
        { url: '', changefreq: 'monthly', priority: '1.0' },
        { url: 'research.html', changefreq: 'monthly', priority: '0.9' },
        { url: 'news.html', changefreq: 'weekly', priority: '0.8' },
        { url: 'learn.html', changefreq: 'monthly', priority: '0.7' },
        { url: 'activities.html', changefreq: 'monthly', priority: '0.7' }
    ];

    const urls = pages.map(page => `
    <url>
        <loc>${CONFIG.baseUrl}/${page.url}</loc>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Main content generation function
 */
function generateContent() {
    console.log('🚀 Starting content generation...');

    // Load all data
    const personal = loadData('personal.json');
    const publications = loadData('publications.json');
    const news = loadData('news.json');
    const resources = loadData('resources.json');
    const activities = loadData('activities.json');

    if (!personal) {
        console.error('❌ Failed to load personal data');
        return;
    }

    // Generate content sections
    const generatedContent = {
        publications: publications ? publications.publications.map(generatePublicationHTML).join('') : '',
        news: news ? news.news.map(generateNewsHTML).join('') : '',
        resources: resources ? Object.values(resources.sections).map(generateResourceHTML).join('') : '',
        activities: activities ? Object.values(activities.sections).map(generateActivityHTML).join('') : '',
        structuredData: generateStructuredData(personal, publications),
        sitemap: generateSitemap()
    };

    // Write generated content files
    const contentOutputDir = path.join(__dirname, '../generated');
    if (!fs.existsSync(contentOutputDir)) {
        fs.mkdirSync(contentOutputDir, { recursive: true });
    }

    Object.entries(generatedContent).forEach(([key, content]) => {
        const filename = key === 'sitemap' ? `${key}.xml` :
                        key === 'structuredData' ? `${key}.json` : `${key}.html`;
        const filepath = path.join(contentOutputDir, filename);
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`✅ Generated ${filename}`);
    });

    console.log('🎉 Content generation completed!');
    console.log(`📁 Generated files saved to: ${contentOutputDir}`);
}

// CLI interface
if (require.main === module) {
    const command = process.argv[2];

    switch (command) {
        case 'generate':
        case undefined:
            generateContent();
            break;
        case 'watch':
            console.log('👀 Watching for data changes...');
            const chokidar = require('chokidar');
            chokidar.watch(CONFIG.dataDir).on('change', () => {
                console.log('📝 Data file changed, regenerating content...');
                generateContent();
            });
            break;
        default:
            console.log('Usage: node generate-content.js [generate|watch]');
    }
}

module.exports = {
    generateContent,
    loadData,
    renderTemplate,
    generatePublicationHTML,
    generateNewsHTML,
    generateResourceHTML,
    generateActivityHTML,
    generateStructuredData,
    generateSitemap
};