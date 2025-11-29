#!/usr/bin/env npx ts-node
/**
 * GVTEWAY Layout Migration Script
 * Migrates pages from legacy PageLayout to GvtewayAppLayout
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const GVTEWAY_APP_DIR = path.join(__dirname, '../apps/gvteway/src/app');

// Find all page.tsx files using PageLayout
function findPagesToMigrate(): string[] {
  const result = execSync(
    `find ${GVTEWAY_APP_DIR} -name "page.tsx" | xargs grep -l "PageLayout" 2>/dev/null || true`,
    { encoding: 'utf-8' }
  );
  return result.trim().split('\n').filter(Boolean);
}

// Determine the navigation variant based on imports
function getVariant(content: string): string {
  if (content.includes('MembershipNavigationPublic')) return 'membership';
  if (content.includes('CreatorNavigationPublic')) return 'creator-public';
  if (content.includes('CreatorNavigationAuthenticated')) return 'creator-auth';
  if (content.includes('ConsumerNavigationAuthenticated')) return 'consumer-auth';
  return 'consumer-public'; // default
}

// Migrate a single file
function migrateFile(filePath: string): void {
  console.log(`Migrating: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const variant = getVariant(content);
  
  // Skip if already migrated
  if (content.includes('GvtewayAppLayout')) {
    console.log(`  Already migrated, skipping.`);
    return;
  }
  
  // Update imports
  const importPatterns = [
    /import\s*{\s*[^}]*ConsumerNavigationPublic[^}]*}\s*from\s*["']@\/components\/navigation["'];?\n?/g,
    /import\s*{\s*[^}]*ConsumerNavigationAuthenticated[^}]*}\s*from\s*["']@\/components\/navigation["'];?\n?/g,
    /import\s*{\s*[^}]*MembershipNavigationPublic[^}]*}\s*from\s*["']@\/components\/navigation["'];?\n?/g,
    /import\s*{\s*[^}]*CreatorNavigationPublic[^}]*}\s*from\s*["']@\/components\/navigation["'];?\n?/g,
    /import\s*{\s*[^}]*CreatorNavigationAuthenticated[^}]*}\s*from\s*["']@\/components\/navigation["'];?\n?/g,
  ];
  
  for (const pattern of importPatterns) {
    content = content.replace(pattern, '');
  }
  
  // Add GvtewayAppLayout import after "use client" or at top
  const appLayoutImport = `import { GvtewayAppLayout, GvtewayLoadingLayout } from "@/components/app-layout";\n`;
  
  if (content.includes('"use client"')) {
    content = content.replace('"use client";', `"use client";\n\n${appLayoutImport}`);
  } else if (content.includes("'use client'")) {
    content = content.replace("'use client';", `'use client';\n\n${appLayoutImport}`);
  } else {
    content = appLayoutImport + content;
  }
  
  // Remove legacy imports from @ghxstship/ui
  const legacyUiImports = [
    'PageLayout',
    'Footer',
    'FooterColumn', 
    'FooterLink',
    'Section',
    'Container',
  ];
  
  for (const imp of legacyUiImports) {
    // Remove from import statement
    content = content.replace(new RegExp(`\\s*${imp},?\\s*`, 'g'), (match, offset) => {
      // Only remove if within an import statement
      const before = content.substring(Math.max(0, offset - 200), offset);
      if (before.includes('import {') && !before.includes('}')) {
        return '';
      }
      return match;
    });
  }
  
  // Clean up empty lines in imports
  content = content.replace(/import\s*{\s*,/g, 'import {');
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/,\s*}/g, ' }');
  content = content.replace(/{\s*}/g, '{ }');
  
  fs.writeFileSync(filePath, content);
  console.log(`  Migrated with variant: ${variant}`);
}

// Main
const pages = findPagesToMigrate();
console.log(`Found ${pages.length} pages to migrate\n`);

for (const page of pages) {
  try {
    migrateFile(page);
  } catch (error) {
    console.error(`  Error: ${error}`);
  }
}

console.log('\nMigration complete!');
console.log('Note: Manual review required for JSX structure changes.');
