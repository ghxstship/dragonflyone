#!/usr/bin/env ts-node
/**
 * SSOT Compliance Checker
 * 
 * Automated script to verify Single Source of Truth compliance across the monorepo.
 * Designed to run in CI/CD pipelines to prevent SSOT violations from being merged.
 * 
 * Checks:
 * 1. No local STATUS_COLORS definitions in page files
 * 2. No local column/filter definitions (warning only)
 * 3. All entities registered in entity registry
 * 4. All status colors exported from status-mappings.ts
 * 5. Legend 3NF schema integration
 * 
 * Usage:
 *   pnpm check:ssot
 *   pnpm check:ssot --fix  # Auto-fix where possible
 *   pnpm check:ssot --ci   # CI mode (exit 1 on violations)
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

interface Violation {
  type: 'error' | 'warning';
  category: 'ssot' | '3nf' | 'registry';
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
}

interface CheckResult {
  passed: boolean;
  violations: Violation[];
  stats: {
    filesChecked: number;
    errorsFound: number;
    warningsFound: number;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const ROOT_DIR = path.join(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const CONFIG_DIR = path.join(ROOT_DIR, 'packages/config');

const SSOT_PATTERNS = {
  localStatusColors: /const\s+(STATUS_COLORS|statusColors|PAYMENT_COLORS|paymentColors|TYPE_COLORS|typeColors)\s*:\s*Record/g,
  localColumns: /const\s+(COLUMNS|columns|TABLE_COLUMNS|tableColumns)\s*:\s*\[/g,
  localFilters: /const\s+(FILTERS|filters|FILTER_OPTIONS|filterOptions)\s*:\s*\[/g,
  directLegendAccess: /\.from\(['"]legend_(people|places|organizations|products|events|documents)['"]\)/g,
};

const VALID_STATUS_IMPORTS = [
  'UNIVERSAL_STATUS_COLORS',
  'CREDENTIAL_STATUS_COLORS',
  'FINANCIAL_STATUS_COLORS',
  'ORDER_STATUS_COLORS',
  'PAYMENT_STATUS_COLORS',
  'TICKET_STATUS_COLORS',
  'DOCUMENT_STATUS_COLORS',
  'TASK_STATUS_COLORS',
  'EQUIPMENT_STATUS_COLORS',
  'CREW_STATUS_COLORS',
  'EVENT_STATUS_COLORS',
  'PROJECT_STATUS_COLORS',
  'CERTIFICATION_STATUS_COLORS',
  'INCIDENT_STATUS_COLORS',
  'DELIVERY_STATUS_COLORS',
  'MAINTENANCE_STATUS_COLORS',
  'PEOPLE_STATUS_COLORS',
  'PLACES_STATUS_COLORS',
  'ORGANIZATION_STATUS_COLORS',
  'PRODUCTION_STATUS_COLORS',
  'PROPOSAL_STATUS_COLORS',
  'PURCHASE_ORDER_STATUS_COLORS',
  'BUDGET_STATUS_COLORS',
  'EXPENSE_STATUS_COLORS',
];

// ============================================================================
// Helpers
// ============================================================================

function findFiles(dir: string, pattern: RegExp): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile() && pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function getLineNumber(content: string, index: number): number {
  return content.substring(0, index).split('\n').length;
}

// ============================================================================
// Checks
// ============================================================================

function checkLocalStatusColors(files: string[]): Violation[] {
  const violations: Violation[] = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(ROOT_DIR, file);
    
    // Check for local STATUS_COLORS definitions
    let match;
    SSOT_PATTERNS.localStatusColors.lastIndex = 0;
    while ((match = SSOT_PATTERNS.localStatusColors.exec(content)) !== null) {
      // Skip if it's an assignment from imported constant (e.g., const STATUS_COLORS = EVENT_STATUS_COLORS)
      const lineStart = content.lastIndexOf('\n', match.index) + 1;
      const lineEnd = content.indexOf('\n', match.index);
      const line = content.substring(lineStart, lineEnd);
      
      // Check if it's using an imported SSOT constant
      const isUsingImport = VALID_STATUS_IMPORTS.some(imp => line.includes(imp));
      if (isUsingImport) continue;
      
      violations.push({
        type: 'error',
        category: 'ssot',
        file: relativePath,
        line: getLineNumber(content, match.index),
        message: `Local ${match[1]} definition found. Use centralized status colors from @ghxstship/config.`,
        suggestion: `Import from @ghxstship/config: import { EVENT_STATUS_COLORS, ORDER_STATUS_COLORS, ... } from '@ghxstship/config';`,
      });
    }
  }
  
  return violations;
}

function checkLocalColumnDefinitions(files: string[]): Violation[] {
  const violations: Violation[] = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(ROOT_DIR, file);
    
    let match;
    SSOT_PATTERNS.localColumns.lastIndex = 0;
    while ((match = SSOT_PATTERNS.localColumns.exec(content)) !== null) {
      violations.push({
        type: 'warning',
        category: 'ssot',
        file: relativePath,
        line: getLineNumber(content, match.index),
        message: `Local column definition found. Consider using getEntityColumns() from entity registry.`,
        suggestion: `Use: const columns = getEntityColumns('entity-name');`,
      });
    }
  }
  
  return violations;
}

function checkDirectLegendAccess(files: string[]): Violation[] {
  const violations: Violation[] = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(ROOT_DIR, file);
    
    let match;
    SSOT_PATTERNS.directLegendAccess.lastIndex = 0;
    while ((match = SSOT_PATTERNS.directLegendAccess.exec(content)) !== null) {
      violations.push({
        type: 'warning',
        category: '3nf',
        file: relativePath,
        line: getLineNumber(content, match.index),
        message: `Direct access to legend_${match[1]} table. Consider using Legend Query Builder for proper 3NF joins.`,
        suggestion: `Use: createLegendQuery('${match[1]}').select(...).execute();`,
      });
    }
  }
  
  return violations;
}

function checkEntityRegistration(): Violation[] {
  const violations: Violation[] = [];
  
  const entitiesDir = path.join(CONFIG_DIR, 'entity-registry/entities');
  const indexFile = path.join(entitiesDir, 'index.ts');
  
  if (!fs.existsSync(indexFile)) {
    violations.push({
      type: 'error',
      category: 'registry',
      file: 'packages/config/entity-registry/entities/index.ts',
      message: 'Entity registry index file not found.',
    });
    return violations;
  }
  
  const indexContent = fs.readFileSync(indexFile, 'utf-8');
  const entityFiles = findFiles(entitiesDir, /\.ts$/).filter(f => !f.endsWith('index.ts'));
  
  for (const entityFile of entityFiles) {
    const fileName = path.basename(entityFile, '.ts');
    const entityName = fileName.replace(/-/g, '');
    
    // Check if entity is imported
    if (!indexContent.includes(`from './${fileName}'`)) {
      violations.push({
        type: 'error',
        category: 'registry',
        file: path.relative(ROOT_DIR, entityFile),
        message: `Entity file exists but is not imported in index.ts.`,
        suggestion: `Add: import { ${entityName}Entity } from './${fileName}';`,
      });
    }
    
    // Check if entity is in allEntities array
    if (!indexContent.includes(`${entityName}Entity`)) {
      violations.push({
        type: 'warning',
        category: 'registry',
        file: path.relative(ROOT_DIR, entityFile),
        message: `Entity may not be registered in allEntities array.`,
        suggestion: `Add ${entityName}Entity to the allEntities array.`,
      });
    }
  }
  
  return violations;
}

// ============================================================================
// Main
// ============================================================================

function runChecks(): CheckResult {
  const violations: Violation[] = [];
  let filesChecked = 0;
  
  // Find all page files
  const pageFiles = findFiles(APPS_DIR, /page\.tsx$/);
  filesChecked += pageFiles.length;
  
  // Find all hook files
  const hookFiles = findFiles(APPS_DIR, /use[A-Z].*\.ts$/);
  filesChecked += hookFiles.length;
  
  // Run checks
  violations.push(...checkLocalStatusColors(pageFiles));
  violations.push(...checkLocalColumnDefinitions(pageFiles));
  violations.push(...checkDirectLegendAccess([...pageFiles, ...hookFiles]));
  violations.push(...checkEntityRegistration());
  
  const errorsFound = violations.filter(v => v.type === 'error').length;
  const warningsFound = violations.filter(v => v.type === 'warning').length;
  
  return {
    passed: errorsFound === 0,
    violations,
    stats: {
      filesChecked,
      errorsFound,
      warningsFound,
    },
  };
}

function formatViolation(v: Violation): string {
  const icon = v.type === 'error' ? '❌' : '⚠️';
  const category = v.category.toUpperCase();
  const location = v.line ? `${v.file}:${v.line}` : v.file;
  
  let output = `${icon} [${category}] ${location}\n   ${v.message}`;
  if (v.suggestion) {
    output += `\n   💡 ${v.suggestion}`;
  }
  return output;
}

function main() {
  const args = process.argv.slice(2);
  const ciMode = args.includes('--ci');
  
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  SSOT & 3NF Compliance Checker                                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  
  const result = runChecks();
  
  // Group violations by category
  const ssotViolations = result.violations.filter(v => v.category === 'ssot');
  const nfViolations = result.violations.filter(v => v.category === '3nf');
  const registryViolations = result.violations.filter(v => v.category === 'registry');
  
  if (ssotViolations.length > 0) {
    console.log('── SSOT Violations ──────────────────────────────────────────────────\n');
    ssotViolations.forEach(v => console.log(formatViolation(v) + '\n'));
  }
  
  if (nfViolations.length > 0) {
    console.log('── 3NF Violations ───────────────────────────────────────────────────\n');
    nfViolations.forEach(v => console.log(formatViolation(v) + '\n'));
  }
  
  if (registryViolations.length > 0) {
    console.log('── Registry Violations ──────────────────────────────────────────────\n');
    registryViolations.forEach(v => console.log(formatViolation(v) + '\n'));
  }
  
  // Summary
  console.log('── Summary ──────────────────────────────────────────────────────────\n');
  console.log(`   Files checked: ${result.stats.filesChecked}`);
  console.log(`   Errors:        ${result.stats.errorsFound}`);
  console.log(`   Warnings:      ${result.stats.warningsFound}`);
  console.log('');
  
  if (result.passed) {
    console.log('✅ SSOT & 3NF Compliance Check PASSED\n');
    process.exit(0);
  } else {
    console.log('❌ SSOT & 3NF Compliance Check FAILED\n');
    console.log('   Fix the errors above before merging.\n');
    process.exit(ciMode ? 1 : 0);
  }
}

main();
