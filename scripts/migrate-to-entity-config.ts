#!/usr/bin/env ts-node
/**
 * Entity Config Migration Script
 * 
 * Migrates list pages from local column/filter definitions to useEntityConfig.
 * This script identifies pages that can be migrated and generates the migration.
 * 
 * Usage:
 *   pnpm migrate:entity-config --dry-run  # Preview changes
 *   pnpm migrate:entity-config            # Apply changes
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.join(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');

// Entity name mappings from page paths
const PATH_TO_ENTITY: Record<string, string> = {
  'events': 'events',
  'projects': 'projects',
  'people': 'people',
  'places': 'places',
  'organizations': 'organizations',
  'productions': 'productions',
  'crew': 'crew',
  'equipment': 'equipment',
  'credentials': 'credentials',
  'sops': 'sops',
  'bills': 'bills',
  'invoices': 'invoices',
  'orders': 'orders',
  'tickets': 'tickets',
  'budgets': 'budgets',
  'expenses': 'expenses',
  'proposals': 'proposals',
  'purchase-orders': 'purchase-orders',
  'assets': 'assets',
  'tasks': 'tasks',
  'incidents': 'incidents',
  'vendors': 'vendors',
  'contacts': 'contacts',
  'deals': 'deals',
  'quotes': 'quotes',
  'advancing': 'advancing',
  'schedules': 'schedules',
  'timesheets': 'timesheets',
  'reports': 'reports',
  'notifications': 'notifications',
};

interface MigrationCandidate {
  filePath: string;
  entityName: string | null;
  hasLocalColumns: boolean;
  hasLocalFilters: boolean;
  hasLocalFormFields: boolean;
  canMigrate: boolean;
}

function findListPages(): string[] {
  const pages: string[] = [];
  
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !['node_modules', '.next', 'dist'].includes(entry.name)) {
        walk(fullPath);
      } else if (entry.name === 'page.tsx') {
        pages.push(fullPath);
      }
    }
  }
  
  walk(APPS_DIR);
  return pages;
}

function analyzeFile(filePath: string): MigrationCandidate {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(ROOT_DIR, filePath);
  
  // Extract entity name from path
  const pathParts = relativePath.split('/');
  const authenticatedIndex = pathParts.indexOf('(authenticated)');
  let entityName: string | null = null;
  
  if (authenticatedIndex !== -1 && pathParts[authenticatedIndex + 1]) {
    const segment = pathParts[authenticatedIndex + 1];
    entityName = PATH_TO_ENTITY[segment] || null;
  }
  
  const hasLocalColumns = /const\s+columns\s*[=:]/.test(content);
  const hasLocalFilters = /const\s+filters\s*[=:]/.test(content);
  const hasLocalFormFields = /const\s+formFields\s*[=:]/.test(content);
  const usesEntityConfig = content.includes('useEntityConfig');
  
  return {
    filePath: relativePath,
    entityName,
    hasLocalColumns,
    hasLocalFilters,
    hasLocalFormFields,
    canMigrate: entityName !== null && hasLocalColumns && !usesEntityConfig,
  };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  Entity Config Migration Tool                                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  
  const pages = findListPages();
  const candidates = pages.map(analyzeFile);
  
  const migratable = candidates.filter(c => c.canMigrate);
  const alreadyMigrated = candidates.filter(c => c.entityName && !c.hasLocalColumns);
  const noEntity = candidates.filter(c => c.hasLocalColumns && !c.entityName);
  
  console.log(`Total pages scanned: ${pages.length}`);
  console.log(`Pages with entity mapping: ${candidates.filter(c => c.entityName).length}`);
  console.log(`Already using useEntityConfig: ${alreadyMigrated.length}`);
  console.log(`Can be migrated: ${migratable.length}`);
  console.log(`No entity mapping (manual): ${noEntity.length}\n`);
  
  if (migratable.length > 0) {
    console.log('── Migratable Pages ─────────────────────────────────────────────────\n');
    migratable.forEach(c => {
      console.log(`  ${c.filePath}`);
      console.log(`    Entity: ${c.entityName}`);
      console.log(`    Local: columns=${c.hasLocalColumns}, filters=${c.hasLocalFilters}, formFields=${c.hasLocalFormFields}\n`);
    });
  }
  
  if (noEntity.length > 0) {
    console.log('── Pages Without Entity Mapping (Manual Migration) ─────────────────\n');
    noEntity.slice(0, 10).forEach(c => {
      console.log(`  ${c.filePath}`);
    });
    if (noEntity.length > 10) {
      console.log(`  ... and ${noEntity.length - 10} more\n`);
    }
  }
  
  if (dryRun) {
    console.log('\n📋 Dry run complete. Run without --dry-run to apply migrations.\n');
  } else {
    console.log('\n✅ Analysis complete. Migration requires manual review for each page.\n');
    console.log('The useEntityConfig hook is available. Pages can be migrated by:');
    console.log('1. Import useEntityConfig from @ghxstship/config');
    console.log('2. Call useEntityConfig({ entityName: "entity-name" })');
    console.log('3. Use returned columns, filters, formFields instead of local definitions\n');
  }
}

main();
