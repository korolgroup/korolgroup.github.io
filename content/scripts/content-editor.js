#!/usr/bin/env node

/**
 * Simple Content Editor for Roman Korol's Website
 * Provides CLI interface for editing structured content
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const CONFIG = {
    dataDir: path.join(__dirname, '../../data')
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Prompt user for input
 */
function prompt(question) {
    return new Promise(resolve => {
        rl.question(question, answer => resolve(answer.trim()));
    });
}

/**
 * Load and display current data
 */
function loadAndDisplayData(filename) {
    const filepath = path.join(CONFIG.dataDir, filename);
    try {
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        console.log(`\n📄 Current ${filename}:`);
        console.log(JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error(`❌ Error loading ${filename}:`, error.message);
        return null;
    }
}

/**
 * Save data to file
 */
function saveData(filename, data) {
    const filepath = path.join(CONFIG.dataDir, filename);
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`✅ Saved ${filename}`);
        return true;
    } catch (error) {
        console.error(`❌ Error saving ${filename}:`, error.message);
        return false;
    }
}

/**
 * Add new publication
 */
async function addPublication() {
    console.log('\n➕ Adding New Publication');
    console.log('=' .repeat(30));

    const pub = {
        id: await prompt('Publication ID (e.g., korol2024): '),
        title: await prompt('Title: '),
        authors: (await prompt('Authors (comma-separated): ')).split(',').map(a => a.trim()),
        journal: await prompt('Journal: '),
        year: parseInt(await prompt('Year: ')),
        doi: await prompt('DOI (optional): ') || null,
        abstract: await prompt('Abstract: '),
        type: await prompt('Type (journal/conference/preprint): ') || 'journal',
        status: await prompt('Status (published/submitted/in_preparation): ') || 'published'
    };

    // Load existing publications
    const publicationsData = loadAndDisplayData('publications.json');
    if (!publicationsData) return;

    // Add new publication
    publicationsData.publications.unshift(pub); // Add to beginning
    publicationsData.statistics.total_publications = publicationsData.publications.length;
    publicationsData.statistics.last_updated = new Date().toISOString().split('T')[0];

    // Save
    if (saveData('publications.json', publicationsData)) {
        console.log(`✅ Added publication: ${pub.title}`);
    }
}

/**
 * Add news item
 */
async function addNewsItem() {
    console.log('\n📰 Adding News Item');
    console.log('=' .repeat(30));

    const newsItem = {
        id: await prompt('News ID (e.g., 2024-09-conference): '),
        title: await prompt('Title: '),
        date: await prompt('Date (YYYY-MM-DD): '),
        category: await prompt('Category (academic/research/personal/awards/outreach): ') || 'academic',
        summary: await prompt('Summary: '),
        content: await prompt('Full content: '),
        featured: (await prompt('Featured? (y/n): ')).toLowerCase() === 'y',
        tags: (await prompt('Tags (comma-separated): ')).split(',').map(t => t.trim()).filter(t => t)
    };

    // Load existing news
    const newsData = loadAndDisplayData('news.json');
    if (!newsData) return;

    // Add new news item
    newsData.news.unshift(newsItem); // Add to beginning (most recent first)
    newsData.last_updated = new Date().toISOString().split('T')[0];

    // Save
    if (saveData('news.json', newsData)) {
        console.log(`✅ Added news item: ${newsItem.title}`);
    }
}

/**
 * Edit personal information
 */
async function editPersonalInfo() {
    console.log('\n👤 Editing Personal Information');
    console.log('=' .repeat(30));

    const personalData = loadAndDisplayData('personal.json');
    if (!personalData) return;

    console.log('\nCurrent information:');
    console.log(`Name: ${personalData.name}`);
    console.log(`Title: ${personalData.title}`);
    console.log(`Institution: ${personalData.institution.name}`);

    const field = await prompt('\nWhich field to edit? (name/title/institution): ');

    switch (field.toLowerCase()) {
        case 'name':
            personalData.name = await prompt('New name: ');
            break;
        case 'title':
            personalData.title = await prompt('New title: ');
            break;
        case 'institution':
            personalData.institution.name = await prompt('New institution name: ');
            personalData.institution.url = await prompt('New institution URL: ');
            break;
        default:
            console.log('❌ Invalid field');
            return;
    }

    if (saveData('personal.json', personalData)) {
        console.log(`✅ Updated ${field}`);
    }
}

/**
 * Add resource
 */
async function addResource() {
    console.log('\n📚 Adding Resource');
    console.log('=' .repeat(30));

    const resourcesData = loadAndDisplayData('resources.json');
    if (!resourcesData) return;

    console.log('\nAvailable sections:');
    Object.keys(resourcesData.sections).forEach((key, index) => {
        console.log(`${index + 1}. ${resourcesData.sections[key].title} (${key})`);
    });

    const sectionKey = await prompt('\nSection key: ');
    if (!resourcesData.sections[sectionKey]) {
        console.log('❌ Invalid section');
        return;
    }

    const resource = {
        title: await prompt('Resource title: '),
        type: await prompt('Type (course/tutorial/tool/database/educational): '),
        description: await prompt('Description: '),
        links: []
    };

    // Add links
    let addMore = true;
    while (addMore) {
        const link = {
            title: await prompt('Link title: '),
            url: await prompt('Link URL: '),
            provider: await prompt('Provider: ')
        };
        resource.links.push(link);

        addMore = (await prompt('Add another link? (y/n): ')).toLowerCase() === 'y';
    }

    // Add to section
    resourcesData.sections[sectionKey].resources.push(resource);
    resourcesData.last_updated = new Date().toISOString().split('T')[0];

    if (saveData('resources.json', resourcesData)) {
        console.log(`✅ Added resource to ${sectionKey}: ${resource.title}`);
    }
}

/**
 * List all content
 */
function listContent() {
    console.log('\n📋 Content Overview');
    console.log('=' .repeat(30));

    const files = ['personal.json', 'publications.json', 'news.json', 'resources.json', 'activities.json'];

    files.forEach(file => {
        const data = loadAndDisplayData(file);
        if (data) {
            if (file === 'publications.json') {
                console.log(`📚 Publications: ${data.publications.length} items`);
            } else if (file === 'news.json') {
                console.log(`📰 News: ${data.news.length} items`);
            } else if (file === 'resources.json') {
                const totalResources = Object.values(data.sections)
                    .reduce((total, section) => total + section.resources.length, 0);
                console.log(`📚 Resources: ${totalResources} items across ${Object.keys(data.sections).length} sections`);
            } else if (file === 'activities.json') {
                const totalActivities = Object.values(data.sections)
                    .reduce((total, section) => total + section.activities.length, 0);
                console.log(`🎯 Activities: ${totalActivities} items across ${Object.keys(data.sections).length} sections`);
            }
        }
    });
}

/**
 * Backup content
 */
function backupContent() {
    const backupDir = path.join(CONFIG.dataDir, '../backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);
    fs.mkdirSync(backupPath);

    const files = ['personal.json', 'publications.json', 'news.json', 'resources.json', 'activities.json'];

    files.forEach(file => {
        const sourcePath = path.join(CONFIG.dataDir, file);
        const targetPath = path.join(backupPath, file);

        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });

    console.log(`✅ Backup created: ${backupPath}`);
}

/**
 * Main menu
 */
async function showMainMenu() {
    console.clear();
    console.log('🎓 Roman Korol\'s Website Content Editor');
    console.log('=' .repeat(40));
    console.log('1. Add Publication');
    console.log('2. Add News Item');
    console.log('3. Edit Personal Info');
    console.log('4. Add Resource');
    console.log('5. List All Content');
    console.log('6. Backup Content');
    console.log('7. Exit');
    console.log('=' .repeat(40));

    const choice = await prompt('Choose an option (1-7): ');

    switch (choice) {
        case '1':
            await addPublication();
            break;
        case '2':
            await addNewsItem();
            break;
        case '3':
            await editPersonalInfo();
            break;
        case '4':
            await addResource();
            break;
        case '5':
            listContent();
            break;
        case '6':
            backupContent();
            break;
        case '7':
            console.log('👋 Goodbye!');
            rl.close();
            return;
        default:
            console.log('❌ Invalid choice');
    }

    await prompt('\nPress Enter to continue...');
    await showMainMenu();
}

// Start the application
if (require.main === module) {
    console.log('🚀 Starting Content Editor...');
    showMainMenu().catch(console.error);
}

module.exports = {
    addPublication,
    addNewsItem,
    editPersonalInfo,
    addResource,
    listContent,
    backupContent
};