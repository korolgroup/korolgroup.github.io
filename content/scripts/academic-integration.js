#!/usr/bin/env node

/**
 * Academic Integration for Roman Korol's Website
 * Integrates with academic systems and automatically updates content
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
    dataDir: path.join(__dirname, '../../data'),
    pdfDir: path.join(__dirname, '../../pdf'),
    latexDir: path.join(__dirname, '../../make_pdf'),
    bibtexFile: path.join(__dirname, '../../make_pdf/references.bib')
};

/**
 * Parse BibTeX file to extract publication data
 */
function parseBibtexFile(bibtexPath) {
    if (!fs.existsSync(bibtexPath)) {
        console.warn('⚠️  BibTeX file not found, using existing data');
        return null;
    }

    try {
        const bibtexContent = fs.readFileSync(bibtexPath, 'utf8');
        const publications = [];

        // Simple BibTeX parser (for demonstration)
        const entryRegex = /@(\w+)\{([^,]+),\s*([\s\S]*?)\n\}/g;
        let match;

        while ((match = entryRegex.exec(bibtexContent)) !== null) {
            const [, type, key, content] = match;
            const fields = {};

            const fieldRegex = /(\w+)\s*=\s*\{([^}]*)\}/g;
            let fieldMatch;

            while ((fieldMatch = fieldRegex.exec(content)) !== null) {
                fields[fieldMatch[1]] = fieldMatch[2];
            }

            if (type.toLowerCase() === 'article' && fields.title) {
                publications.push({
                    id: key,
                    title: fields.title,
                    authors: fields.author ? fields.author.split(' and ') : [],
                    journal: fields.journal || 'Unknown Journal',
                    year: parseInt(fields.year) || new Date().getFullYear(),
                    doi: fields.doi || null,
                    abstract: fields.abstract || '',
                    type: 'journal',
                    status: 'published'
                });
            }
        }

        return publications;
    } catch (error) {
        console.error('❌ Error parsing BibTeX file:', error.message);
        return null;
    }
}

/**
 * Generate LaTeX CV from personal data
 */
function generateLatexCV(personalData, publicationsData) {
    const template = `
\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{classic}
\\moderncvcolor{blue}

\\usepackage[scale=0.75]{geometry}

% Personal data
\\name{${personalData.name.split(' ')[0]}}{${personalData.name.split(' ')[1]}}
\\title{${personalData.title}}
\\address{${personalData.institution.name}}{}{}
\\email{${personalData.social.email}}

\\begin{document}
\\makecvtitle

\\section{Education}
${personalData.background.education.map(edu =>
    `\\cventry{}{${edu.degree}}{${edu.institution}}{${edu.country || ''}}{}{}`
).join('\\n')}

\\section{Research Interests}
\\cvitem{Focus}{${personalData.research.focus}}
\\cvitem{Description}{${personalData.research.description}}

\\section{Publications}
${publicationsData ? publicationsData.publications.map((pub, index) =>
    `\\cvitem{${pub.year}}{${pub.authors.join(', ')}. \\textit{${pub.title}}. ${pub.journal}, ${pub.year}.}`
).join('\\n') : ''}

\\section{Skills}
\\cvitem{Research}{${personalData.interests.join(', ')}}

\\end{document}`;

    return template;
}

/**
 * Update publications from external sources
 */
async function updatePublicationsFromSources() {
    console.log('📚 Updating publications from academic sources...');

    // In a real implementation, this would:
    // 1. Connect to ORCID API
    // 2. Query Google Scholar
    // 3. Check institutional repositories
    // 4. Parse BibTeX files

    const bibtexPublications = parseBibtexFile(CONFIG.bibtexFile);

    if (bibtexPublications) {
        const currentData = JSON.parse(fs.readFileSync(
            path.join(CONFIG.dataDir, 'publications.json'), 'utf8'
        ));

        // Merge with existing data (simple approach)
        const mergedPublications = [...currentData.publications];

        bibtexPublications.forEach(bibPub => {
            const exists = mergedPublications.find(pub => pub.id === bibPub.id);
            if (!exists) {
                mergedPublications.push(bibPub);
                console.log(`➕ Added new publication: ${bibPub.title}`);
            }
        });

        currentData.publications = mergedPublications;
        currentData.statistics.total_publications = mergedPublications.length;
        currentData.statistics.last_updated = new Date().toISOString().split('T')[0];

        fs.writeFileSync(
            path.join(CONFIG.dataDir, 'publications.json'),
            JSON.stringify(currentData, null, 2)
        );

        console.log('✅ Publications updated successfully');
    }
}

/**
 * Generate academic documents
 */
function generateAcademicDocuments() {
    console.log('📄 Generating academic documents...');

    try {
        const personalData = JSON.parse(fs.readFileSync(
            path.join(CONFIG.dataDir, 'personal.json'), 'utf8'
        ));

        const publicationsData = JSON.parse(fs.readFileSync(
            path.join(CONFIG.dataDir, 'publications.json'), 'utf8'
        ));

        // Generate LaTeX CV
        const cvLatex = generateLatexCV(personalData, publicationsData);
        const cvPath = path.join(CONFIG.latexDir, 'CV_Generated.tex');
        fs.writeFileSync(cvPath, cvLatex);
        console.log('✅ Generated LaTeX CV');

        // Compile LaTeX to PDF (if pdflatex is available)
        try {
            const pdflatexPath = execSync('which pdflatex', { encoding: 'utf8' }).trim();
            if (pdflatexPath) {
                process.chdir(CONFIG.latexDir);
                execSync('pdflatex CV_Generated.tex', { stdio: 'ignore' });

                // Move PDF to pdf directory
                const generatedPdf = path.join(CONFIG.latexDir, 'CV_Generated.pdf');
                const targetPdf = path.join(CONFIG.pdfDir, 'CV_Generated.pdf');
                if (fs.existsSync(generatedPdf)) {
                    fs.copyFileSync(generatedPdf, targetPdf);
                    console.log('✅ Generated PDF CV');
                }
            }
        } catch (error) {
            console.warn('⚠️  LaTeX compilation skipped (pdflatex not found)');
        }

    } catch (error) {
        console.error('❌ Error generating academic documents:', error.message);
    }
}

/**
 * Validate academic data integrity
 */
function validateAcademicData() {
    console.log('🔍 Validating academic data integrity...');

    const issues = [];

    try {
        // Check personal data
        const personalData = JSON.parse(fs.readFileSync(
            path.join(CONFIG.dataDir, 'personal.json'), 'utf8'
        ));

        if (!personalData.name || !personalData.title) {
            issues.push('Missing required personal information');
        }

        // Check publications data
        const publicationsData = JSON.parse(fs.readFileSync(
            path.join(CONFIG.dataDir, 'publications.json'), 'utf8'
        ));

        publicationsData.publications.forEach((pub, index) => {
            if (!pub.title || !pub.authors || pub.authors.length === 0) {
                issues.push(`Publication ${index + 1}: Missing title or authors`);
            }

            if (pub.doi && !pub.doi.startsWith('10.')) {
                issues.push(`Publication ${index + 1}: Invalid DOI format`);
            }

            if (!pub.year || pub.year < 1900 || pub.year > new Date().getFullYear() + 2) {
                issues.push(`Publication ${index + 1}: Invalid year`);
            }
        });

        // Check for duplicate publications
        const titles = publicationsData.publications.map(pub => pub.title.toLowerCase());
        const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
        if (duplicates.length > 0) {
            issues.push(`Duplicate publications found: ${duplicates.join(', ')}`);
        }

        if (issues.length === 0) {
            console.log('✅ Academic data validation passed');
        } else {
            console.log('⚠️  Academic data validation issues:');
            issues.forEach(issue => console.log(`   - ${issue}`));
        }

    } catch (error) {
        console.error('❌ Error validating academic data:', error.message);
    }

    return issues;
}

/**
 * Generate academic statistics and metrics
 */
function generateAcademicMetrics() {
    console.log('📊 Generating academic metrics...');

    try {
        const publicationsData = JSON.parse(fs.readFileSync(
            path.join(CONFIG.dataDir, 'publications.json'), 'utf8'
        ));

        const publications = publicationsData.publications;

        // Calculate metrics
        const metrics = {
            total_publications: publications.length,
            publications_by_year: {},
            publications_by_status: {},
            publications_by_type: {},
            latest_publication: null,
            collaboration_network: [],
            last_updated: new Date().toISOString().split('T')[0]
        };

        // Group by year
        publications.forEach(pub => {
            metrics.publications_by_year[pub.year] =
                (metrics.publications_by_year[pub.year] || 0) + 1;

            metrics.publications_by_status[pub.status] =
                (metrics.publications_by_status[pub.status] || 0) + 1;

            metrics.publications_by_type[pub.type] =
                (metrics.publications_by_type[pub.type] || 0) + 1;
        });

        // Find latest publication
        const publishedPubs = publications.filter(pub => pub.status === 'published');
        if (publishedPubs.length > 0) {
            metrics.latest_publication = publishedPubs.reduce((latest, pub) =>
                pub.year > latest.year ? pub : latest
            );
        }

        // Extract collaboration network
        const collaborators = new Set();
        publications.forEach(pub => {
            pub.authors.forEach(author => {
                if (author !== 'R Korol' && !author.includes('Roman')) {
                    collaborators.add(author);
                }
            });
        });
        metrics.collaboration_network = Array.from(collaborators);

        // Update publications data with new metrics
        publicationsData.statistics = { ...publicationsData.statistics, ...metrics };

        fs.writeFileSync(
            path.join(CONFIG.dataDir, 'publications.json'),
            JSON.stringify(publicationsData, null, 2)
        );

        console.log('✅ Academic metrics generated');
        console.log(`   📚 Total publications: ${metrics.total_publications}`);
        console.log(`   👥 Collaborators: ${metrics.collaboration_network.length}`);

    } catch (error) {
        console.error('❌ Error generating academic metrics:', error.message);
    }
}

/**
 * Main academic integration function
 */
async function runAcademicIntegration() {
    console.log('🎓 Starting academic integration...');

    // Run all academic integration tasks
    await updatePublicationsFromSources();
    generateAcademicMetrics();
    validateAcademicData();
    generateAcademicDocuments();

    console.log('🎉 Academic integration completed!');
}

// CLI interface
if (require.main === module) {
    const command = process.argv[2];

    switch (command) {
        case 'update':
            updatePublicationsFromSources();
            break;
        case 'generate':
            generateAcademicDocuments();
            break;
        case 'validate':
            validateAcademicData();
            break;
        case 'metrics':
            generateAcademicMetrics();
            break;
        case 'full':
        case undefined:
            runAcademicIntegration();
            break;
        default:
            console.log('Usage: node academic-integration.js [update|generate|validate|metrics|full]');
    }
}

module.exports = {
    parseBibtexFile,
    generateLatexCV,
    updatePublicationsFromSources,
    generateAcademicDocuments,
    validateAcademicData,
    generateAcademicMetrics,
    runAcademicIntegration
};