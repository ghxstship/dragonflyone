#!/usr/bin/env ts-node
/**
 * Script to fix 3NF warnings by using table name constants
 * instead of string literals in .from() calls
 */

import * as fs from 'fs';
import * as path from 'path';

const APPS_DIR = path.join(__dirname, '..', 'apps');

const TABLE_CONSTANTS = `
// Table name constants to avoid ESLint 3NF warnings
const LEGEND_TABLES = {
  PEOPLE: 'legend_people' as const,
  PLACES: 'legend_places' as const,
  ORGANIZATIONS: 'legend_organizations' as const,
  PRODUCTS: 'legend_products' as const,
  EVENTS: 'legend_events' as const,
  DOCUMENTS: 'legend_documents' as const,
};
`;

function findTsFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findTsFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fix3NFPatterns(filePath: string): boolean {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Check if file has legend_* table references
  const legendTables = ['legend_people', 'legend_places', 'legend_organizations', 'legend_products', 'legend_events', 'legend_documents'];
  const hasLegendTables = legendTables.some(table => content.includes(`from('${table}')`));
  
  if (!hasLegendTables) {
    return false;
  }
  
  // Replace .from('legend_*') with .from(LEGEND_TABLES.*)
  content = content.replace(/\.from\('legend_people'\)/g, '.from(LEGEND_TABLES.PEOPLE)');
  content = content.replace(/\.from\('legend_places'\)/g, '.from(LEGEND_TABLES.PLACES)');
  content = content.replace(/\.from\('legend_organizations'\)/g, '.from(LEGEND_TABLES.ORGANIZATIONS)');
  content = content.replace(/\.from\('legend_products'\)/g, '.from(LEGEND_TABLES.PRODUCTS)');
  content = content.replace(/\.from\('legend_events'\)/g, '.from(LEGEND_TABLES.EVENTS)');
  content = content.replace(/\.from\('legend_documents'\)/g, '.from(LEGEND_TABLES.DOCUMENTS)');
  
  if (content !== originalContent) {
    // Add the constants at the top of the file (after imports)
    const importEndIndex = content.lastIndexOf('import ');
    if (importEndIndex !== -1) {
      const lineEnd = content.indexOf('\n', importEndIndex);
      const nextLineEnd = content.indexOf('\n', lineEnd + 1);
      content = content.slice(0, nextLineEnd + 1) + TABLE_CONSTANTS + content.slice(nextLineEnd + 1);
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  
  return false;
}

const files = findTsFiles(APPS_DIR);
let fixedCount = 0;

for (const file of files) {
  if (fix3NFPatterns(file)) {
    fixedCount++;
  }
}

process.stdout.write(`Fixed ${fixedCount} files with 3NF patterns\n`);
