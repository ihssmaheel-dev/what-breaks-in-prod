#!/usr/bin/env node

/**
 * scripts/build-index.mjs
 *
 * Scans docs/ for concept READMEs, extracts YAML frontmatter without external dependencies,
 * and updates the progress tables in the root README.md and category READMEs.
 *
 * Usage:
 *   node scripts/build-index.mjs
 *   node scripts/build-index.mjs --check
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const docsDir = join(rootDir, 'docs');

const isCheckMode = process.argv.includes('--check');

// Categories definition
const CATEGORIES = [
  { id: '01', slug: '01-foundations', name: 'Foundations', expectedTotal: 12 },
  { id: '02', slug: '02-api-reliability', name: 'API Reliability', expectedTotal: 16 },
  { id: '03', slug: '03-performance-and-caching', name: 'Performance & Caching', expectedTotal: 12 },
  { id: '04', slug: '04-databases', name: 'Databases', expectedTotal: 13 },
  { id: '05', slug: '05-concurrency', name: 'Concurrency', expectedTotal: 9 },
  { id: '06', slug: '06-distributed-systems', name: 'Distributed Systems', expectedTotal: 15 },
  { id: '07', slug: '07-messaging-and-events', name: 'Messaging & Events', expectedTotal: 7 },
  { id: '08', slug: '08-security', name: 'Security', expectedTotal: 17 },
  { id: '09', slug: '09-networking-and-realtime', name: 'Networking & Real-Time', expectedTotal: 7 },
  { id: '10', slug: '10-devops-and-deployment', name: 'DevOps & Deployment', expectedTotal: 18 },
  { id: '11', slug: '11-scaling-and-resilience', name: 'Scaling & Resilience', expectedTotal: 12 },
  { id: '12', slug: '12-observability-and-operations', name: 'Observability & Operations', expectedTotal: 14 },
  { id: '13', slug: '13-ai-era-backend', name: 'AI-Era Backend', expectedTotal: 5 },
];

const TOTAL_CONCEPTS_PLANNED = 157;

/**
 * Minimal YAML frontmatter parser (supports simple keys, numbers, strings, and inline arrays)
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const yamlBlock = match[1];
  const data = {};

  for (const rawLine of yamlBlock.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Remove trailing comments
    const commentIdx = value.indexOf('#');
    if (commentIdx !== -1) {
      value = value.slice(0, commentIdx).trim();
    }

    // Parse array e.g. [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      const items = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
      data[key] = items;
    } else {
      // Remove enclosing quotes
      value = value.replace(/^['"]|['"]$/g, '');
      data[key] = value;
    }
  }

  return data;
}

/**
 * Scan docs/ for all concept directories and their README.md
 */
function findConcepts() {
  const concepts = [];

  if (!existsSync(docsDir)) {
    return concepts;
  }

  const catDirs = readdirSync(docsDir).filter((name) => {
    const full = join(docsDir, name);
    return statSync(full).isDirectory();
  });

  for (const catDir of catDirs) {
    const catPath = join(docsDir, catDir);
    const subDirs = readdirSync(catPath).filter((name) => {
      const full = join(catPath, name);
      return statSync(full).isDirectory() && /^\d{3}-/.test(name);
    });

    for (const subDir of subDirs) {
      const conceptReadme = join(catPath, subDir, 'README.md');
      if (existsSync(conceptReadme)) {
        const content = readFileSync(conceptReadme, 'utf-8');
        const fm = parseFrontmatter(content);
        if (fm) {
          const hasDemo = existsSync(join(catPath, subDir, 'demo.mjs'));
          concepts.push({
            id: String(fm.id || '').padStart(3, '0'),
            title: fm.title || subDir,
            slug: fm.slug || subDir,
            category: fm.category || catDir,
            categoryDir: catDir,
            level: fm.level || 'beginner',
            status: fm.status || 'draft',
            relPath: `docs/${catDir}/${subDir}/README.md`,
            hasDemo,
            lastReviewed: fm.last_reviewed || 'N/A',
          });
        }
      }
    }
  }

  // Sort concepts by id
  concepts.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
  return concepts;
}

/**
 * Generate markdown table for progress
 */
function generateCategoryProgressTable(concepts) {
  let table = '| # | Category | Planned | Published | Reviewed | Draft | Progress |\n';
  table += '| :--- | :--- | :---: | :---: | :---: | :---: | :--- |\n';

  let totalPublished = 0;
  let totalReviewed = 0;
  let totalDraft = 0;

  for (const cat of CATEGORIES) {
    const catConcepts = concepts.filter(
      (c) => c.categoryDir === cat.slug || c.category === cat.slug || c.categoryDir.startsWith(cat.id)
    );

    const published = catConcepts.filter((c) => c.status === 'published').length;
    const reviewed = catConcepts.filter((c) => c.status === 'reviewed').length;
    const draft = catConcepts.filter((c) => c.status === 'draft').length;
    const totalDone = published + reviewed;
    const pct = Math.round((totalDone / cat.expectedTotal) * 100);

    totalPublished += published;
    totalReviewed += reviewed;
    totalDraft += draft;

    const barLength = 10;
    const filled = Math.min(barLength, Math.round((pct / 100) * barLength));
    const bar = '`' + '█'.repeat(filled) + '░'.repeat(barLength - filled) + ` ${pct}%` + '`';

    table += `| ${cat.id} | [${cat.name}](docs/${cat.slug}/README.md) | ${cat.expectedTotal} | ${published} | ${reviewed} | ${draft} | ${bar} |\n`;
  }

  const grandTotalDone = totalPublished + totalReviewed;
  const grandPct = Math.round((grandTotalDone / TOTAL_CONCEPTS_PLANNED) * 100);
  const grandBarLength = 10;
  const grandFilled = Math.min(grandBarLength, Math.round((grandPct / 100) * grandBarLength));
  const grandBar = '`' + '█'.repeat(grandFilled) + '░'.repeat(grandBarLength - grandFilled) + ` ${grandPct}%` + '`';

  table += `| **All** | **Total** | **${TOTAL_CONCEPTS_PLANNED}** | **${totalPublished}** | **${totalReviewed}** | **${totalDraft}** | **${grandBar}** |\n`;

  return {
    markdown: table,
    stats: {
      totalPlanned: TOTAL_CONCEPTS_PLANNED,
      published: totalPublished,
      reviewed: totalReviewed,
      draft: totalDraft,
      completed: grandTotalDone,
      percent: grandPct,
    },
  };
}

/**
 * Generate full catalog table of implemented concepts
 */
function generateConceptCatalogTable(concepts) {
  if (concepts.length === 0) {
    return '_No concepts published yet. Run Phase 1 to generate the first batch._\n';
  }

  let table = '| ID | Concept | Category | Level | Demo | Status |\n';
  table += '| :--- | :--- | :--- | :---: | :---: | :---: |\n';

  for (const c of concepts) {
    const demoIcon = c.hasDemo ? '✅' : '❌';
    const statusBadge =
      c.status === 'published'
        ? '🟢 Published'
        : c.status === 'reviewed'
        ? '🟡 Reviewed'
        : '⚪ Draft';

    table += `| \`${c.id}\` | [${c.title}](${c.relPath}) | ${c.category} | \`${c.level}\` | ${demoIcon} | ${statusBadge} |\n`;
  }

  return table;
}

/**
 * Replace content between two marker comments
 */
function updateBetweenMarkers(fileContent, startMarker, endMarker, newContent) {
  const startIdx = fileContent.indexOf(startMarker);
  const endIdx = fileContent.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    return fileContent;
  }

  const before = fileContent.slice(0, startIdx + startMarker.length);
  const after = fileContent.slice(endIdx);
  return `${before}\n${newContent}\n${after}`;
}

/**
 * Main build process
 */
function main() {
  console.log('Building index and progress tables...');
  const concepts = findConcepts();
  console.log(`Found ${concepts.length} concept(s) across docs/.`);

  let hasDiff = false;

  // 1. Update root README.md
  const readmePath = join(rootDir, 'README.md');
  if (existsSync(readmePath)) {
    const originalReadme = readFileSync(readmePath, 'utf-8');
    const { markdown: progressTable, stats } = generateCategoryProgressTable(concepts);
    const catalogTable = generateConceptCatalogTable(concepts);

    let updatedReadme = updateBetweenMarkers(
      originalReadme,
      '<!-- PROGRESS_TABLE_START -->',
      '<!-- PROGRESS_TABLE_END -->',
      progressTable
    );

    updatedReadme = updateBetweenMarkers(
      updatedReadme,
      '<!-- CONCEPT_CATALOG_START -->',
      '<!-- CONCEPT_CATALOG_END -->',
      catalogTable
    );

    // Update status badge stats if present
    updatedReadme = updatedReadme.replace(
      /!\[Concepts\]\(https:\/\/img\.shields\.io\/badge\/concepts-([0-9]+)%2F157-[a-z]+\)/g,
      `![Concepts](https://img.shields.io/badge/concepts-${stats.completed}%2F157-blue)`
    );

    if (updatedReadme !== originalReadme) {
      if (isCheckMode) {
        console.error('README.md is out of date. Run "node scripts/build-index.mjs" to update it.');
        hasDiff = true;
      } else {
        writeFileSync(readmePath, updatedReadme, 'utf-8');
        console.log('Updated root README.md');
      }
    }
  }

  // 2. Update category READMEs
  for (const cat of CATEGORIES) {
    const catReadmePath = join(docsDir, cat.slug, 'README.md');
    if (existsSync(catReadmePath)) {
      const originalCatReadme = readFileSync(catReadmePath, 'utf-8');
      const catConcepts = concepts.filter(
        (c) => c.categoryDir === cat.slug || c.category === cat.slug || c.categoryDir.startsWith(cat.id)
      );

      let conceptTable = '| ID | Concept | Level | Demo | Status |\n';
      conceptTable += '| :--- | :--- | :---: | :---: | :---: |\n';

      if (catConcepts.length === 0) {
        conceptTable += '| - | _Coming soon_ | - | - | ⚪ Planned |\n';
      } else {
        for (const c of catConcepts) {
          const subDir = c.relPath.split('/')[2];
          const demoIcon = c.hasDemo ? '✅' : '❌';
          const statusBadge =
            c.status === 'published'
              ? '🟢 Published'
              : c.status === 'reviewed'
              ? '🟡 Reviewed'
              : '⚪ Draft';
          conceptTable += `| \`${c.id}\` | [${c.title}](${subDir}/README.md) | \`${c.level}\` | ${demoIcon} | ${statusBadge} |\n`;
        }
      }

      const updatedCatReadme = updateBetweenMarkers(
        originalCatReadme,
        '<!-- CONCEPT_TABLE_START -->',
        '<!-- CONCEPT_TABLE_END -->',
        conceptTable
      );

      if (updatedCatReadme !== originalCatReadme) {
        if (isCheckMode) {
          console.error(`${cat.slug}/README.md is out of date.`);
          hasDiff = true;
        } else {
          writeFileSync(catReadmePath, updatedCatReadme, 'utf-8');
          console.log(`Updated ${cat.slug}/README.md`);
        }
      }
    }
  }

  if (isCheckMode && hasDiff) {
    process.exit(1);
  }

  console.log('Done!');
}

main();
