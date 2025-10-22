#!/usr/bin/env node

/**
 * Sync existing HTML content with new structured data system
 * This script extracts content from existing HTML and populates JSON files
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const CONFIG = {
    dataDir: path.join(__dirname, '../../data'),
    siteDir: path.join(__dirname, '../..')
};

/**
 * Parse existing HTML to extract structured data
 */
function parseExistingHTML() {
    console.log('🔄 Parsing existing HTML content...');

    try {
        // Read existing HTML files
        const indexHTML = fs.readFileSync(path.join(CONFIG.siteDir, 'index.html'), 'utf8');
        const researchHTML = fs.readFileSync(path.join(CONFIG.siteDir, 'research.html'), 'utf8');
        const newsHTML = fs.readFileSync(path.join(CONFIG.siteDir, 'news.html'), 'utf8');

        // Parse with JSDOM
        const indexDOM = new JSDOM(indexHTML);
        const researchDOM = new JSDOM(researchHTML);
        const newsDOM = new JSDOM(newsHTML);

        // Extract personal information from index
        const personalInfo = extractPersonalInfo(indexDOM.window.document);

        // Extract publications from research page
        const publications = extractPublications(researchDOM.window.document);

        // Extract news from news page
        const news = extractNews(newsDOM.window.document);

        return { personalInfo, publications, news };

    } catch (error) {
        console.error('❌ Error parsing existing HTML:', error.message);
        return null;
    }
}

/**
 * Extract personal information from index page
 */
function extractPersonalInfo(document) {
    const info = {
        name: 'Roman Korol',
        title: 'Postdoctoral Fellow',
        institution: {
            name: 'University of Rochester',
            url: 'https://www.rochester.edu/',
            department: 'Franco Group',
            departmentUrl: 'https://sas.rochester.edu/chm/groups/franco/'
        }
    };

    // Extract from page content
    const logoElement = document.querySelector('#logo');
    if (logoElement) {
        info.name = logoElement.textContent.trim();
    }

    const titleElement = document.querySelector('#header p');
    if (titleElement) {
        const titleText = titleElement.textContent;
        // Parse "Postdoctoral Fellow @ UofR in the Franco Group"
        const match = titleText.match(/(.+?)\s*@\s*(.+?)\s*in the\s*(.+)/);
        if (match) {
            info.title = match[1].trim();
        }
    }

    // Extract social links
    info.social = {};
    const socialLinks = document.querySelectorAll('a[href*="linkedin"], a[href*="twitter"], a[href*="facebook"], a[href*="researchgate"]');
    socialLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href.includes('linkedin')) info.social.linkedin = href;
        if (href.includes('twitter')) info.social.twitter = href;
        if (href.includes('facebook')) info.social.facebook = href;
        if (href.includes('researchgate')) info.social.researchgate = href;
    });

    return info;
}

/**
 * Extract publications from research page
 */
function extractPublications(document) {
    const publications = [];

    // Look for publication entries
    const pubElements = document.querySelectorAll('[id]');

    pubElements.forEach((element, index) => {
        const id = element.getAttribute('id');
        if (id && id !== 'nav' && id !== 'header' && element.textContent.includes('Korol')) {
            const text = element.textContent;

            // Try to parse publication info
            const yearMatch = text.match(/\b(20\d{2})\b/);
            const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

            // Find associated image
            const img = element.querySelector('img');
            const image = img ? img.getAttribute('src') : `images/publications/${index + 1}.jpg`;

            const publication = {
                id: id,
                title: `Publication ${index + 1}`, // Placeholder
                authors: ['R Korol'], // Placeholder
                journal: 'Journal Name', // Placeholder
                year: year,
                image: image,
                abstract: text.substring(0, 200) + '...', // First part of text
                type: 'journal',
                status: 'published'
            };

            publications.push(publication);
        }
    });

    return publications;
}

/**
 * Extract news items from news page
 */
function extractNews(document) {
    const news = [];

    // This is a simplified extraction - in practice, you'd parse the actual news structure
    const newsElements = document.querySelectorAll('.modal_multi');

    newsElements.forEach((element, index) => {
        const img = element.querySelector('img');
        const imageSrc = img ? img.getAttribute('src') : null;

        if (imageSrc && imageSrc.includes('news/')) {
            const newsItem = {
                id: `news-${index + 1}`,
                title: `News Item ${index + 1}`,
                date: new Date().toISOString().split('T')[0],
                category: 'academic',
                summary: 'News summary extracted from existing content',
                content: 'Full news content would be extracted here',
                images: [imageSrc],
                featured: index < 3,
                tags: ['extracted']
            };

            news.push(newsItem);
        }
    });

    return news;
}

/**
 * Update JSON files with extracted data
 */
function updateJSONFiles(extractedData) {
    console.log('📝 Updating JSON files with extracted data...');

    // Update personal.json with extracted info
    const personalPath = path.join(CONFIG.dataDir, 'personal.json');
    if (fs.existsSync(personalPath)) {
        const currentPersonal = JSON.parse(fs.readFileSync(personalPath, 'utf8'));

        // Merge extracted data with existing
        const updatedPersonal = {
            ...currentPersonal,
            ...extractedData.personalInfo,
            social: {
                ...currentPersonal.social,
                ...extractedData.personalInfo.social
            }
        };

        fs.writeFileSync(personalPath, JSON.stringify(updatedPersonal, null, 2));
        console.log('✅ Updated personal.json');
    }

    // Add extracted publications if they don't exist
    const publicationsPath = path.join(CONFIG.dataDir, 'publications.json');
    if (fs.existsSync(publicationsPath)) {
        const currentPubs = JSON.parse(fs.readFileSync(publicationsPath, 'utf8'));

        extractedData.publications.forEach(extractedPub => {
            const exists = currentPubs.publications.find(pub => pub.id === extractedPub.id);
            if (!exists) {
                currentPubs.publications.push(extractedPub);
                console.log(`➕ Added extracted publication: ${extractedPub.id}`);
            }
        });

        currentPubs.statistics.total_publications = currentPubs.publications.length;
        fs.writeFileSync(publicationsPath, JSON.stringify(currentPubs, null, 2));
        console.log('✅ Updated publications.json');
    }

    // Add extracted news items
    const newsPath = path.join(CONFIG.dataDir, 'news.json');
    if (fs.existsSync(newsPath)) {
        const currentNews = JSON.parse(fs.readFileSync(newsPath, 'utf8'));

        extractedData.news.forEach(extractedNewsItem => {
            const exists = currentNews.news.find(item => item.id === extractedNewsItem.id);
            if (!exists) {
                currentNews.news.push(extractedNewsItem);
                console.log(`➕ Added extracted news item: ${extractedNewsItem.id}`);
            }
        });

        fs.writeFileSync(newsPath, JSON.stringify(currentNews, null, 2));
        console.log('✅ Updated news.json');
    }
}

/**
 * Create migration report
 */
function createMigrationReport(extractedData) {
    const report = {
        timestamp: new Date().toISOString(),
        extracted: {
            personalInfo: extractedData.personalInfo ? 'Success' : 'Failed',
            publications: extractedData.publications.length,
            news: extractedData.news.length
        },
        recommendations: [
            'Review extracted publication titles and abstracts',
            'Add missing DOIs and complete metadata',
            'Verify social media links',
            'Update news content with full descriptions',
            'Add missing images and alt text'
        ]
    };

    const reportPath = path.join(CONFIG.dataDir, '../migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 Migration Report:');
    console.log(`✅ Personal info: ${report.extracted.personalInfo}`);
    console.log(`📚 Publications extracted: ${report.extracted.publications}`);
    console.log(`📰 News items extracted: ${report.extracted.news}`);
    console.log(`📄 Report saved to: ${reportPath}`);

    console.log('\n📝 Next Steps:');
    report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
    });
}

/**
 * Main sync function
 */
function syncWithExisting() {
    console.log('🔄 Starting sync with existing content...');

    // Check if JSDOM is available
    let JSDOM;
    try {
        JSDOM = require('jsdom').JSDOM;
    } catch (error) {
        console.log('⚠️  JSDOM not available, skipping HTML parsing');
        console.log('   To enable HTML parsing: npm install jsdom');
        return;
    }

    const extractedData = parseExistingHTML();

    if (extractedData) {
        updateJSONFiles(extractedData);
        createMigrationReport(extractedData);
        console.log('\n🎉 Sync completed successfully!');
    } else {
        console.log('❌ Sync failed - could not extract data');
    }
}

// CLI interface
if (require.main === module) {
    syncWithExisting();
}

module.exports = {
    parseExistingHTML,
    extractPersonalInfo,
    extractPublications,
    extractNews,
    updateJSONFiles,
    syncWithExisting
};