#!/usr/bin/env npx ts-node

/**
 * Script to fix unused imports across the codebase
 * Removes unused imports like Badge, z, PlatformRole, useEffect, etc.
 */

import * as fs from 'fs';
import * as path from 'path';

const APPS_DIR = path.join(__dirname, '..', 'apps');

// Patterns to find and remove unused imports
const UNUSED_IMPORT_PATTERNS = [
  // Remove Badge from imports if unused
  { pattern: /,\s*Badge\s*(?=,|\s*})/g, replacement: '' },
  { pattern: /{\s*Badge\s*,/g, replacement: '{' },
  { pattern: /,\s*Badge\s*}/g, replacement: '}' },
  { pattern: /{\s*Badge\s*}/g, replacement: '{}' },
  
  // Remove z from imports if unused  
  { pattern: /import\s*{\s*z\s*}\s*from\s*['"]zod['"];\n?/g, replacement: '' },
  
  // Remove PlatformRole from imports if unused
  { pattern: /,\s*PlatformRole\s*(?=,|\s*})/g, replacement: '' },
  { pattern: /{\s*PlatformRole\s*,/g, replacement: '{' },
  { pattern: /,\s*PlatformRole\s*}/g, replacement: '}' },
  
  // Remove useEffect from imports if unused
  { pattern: /,\s*useEffect\s*(?=,|\s*})/g, replacement: '' },
  { pattern: /{\s*useEffect\s*,/g, replacement: '{' },
  { pattern: /,\s*useEffect\s*}/g, replacement: '}' },
  
  // Remove getServerSupabase from imports if unused
  { pattern: /,\s*getServerSupabase\s*(?=,|\s*})/g, replacement: '' },
  { pattern: /{\s*getServerSupabase\s*,/g, replacement: '{' },
  { pattern: /,\s*getServerSupabase\s*}/g, replacement: '}' },
];

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

function isImportUnused(content: string, importName: string): boolean {
  // Check if the import is used anywhere in the file (excluding import statements)
  const lines = content.split('\n');
  const nonImportLines = lines.filter(line => !line.trim().startsWith('import'));
  const nonImportContent = nonImportLines.join('\n');
  
  // Check for usage patterns
  const usagePatterns = [
    new RegExp(`<${importName}[\\s/>]`),  // JSX usage
    new RegExp(`${importName}\\(`),        // Function call
    new RegExp(`${importName}\\.`),        // Property access
    new RegExp(`:\\s*${importName}[\\s,>\\[]`), // Type annotation
    new RegExp(`as\\s+${importName}`),     // Type assertion
    new RegExp(`<${importName}>`),         // Generic type
  ];
  
  return !usagePatterns.some(pattern => pattern.test(nonImportContent));
}

function removeTypeImport(content: string, importName: string): string {
  // Remove type imports: type ImportName,
  let result = content;
  
  // Pattern: type ImportName, (in the middle)
  result = result.replace(new RegExp(`type\\s+${importName}\\s*,\\s*`, 'g'), '');
  // Pattern: , type ImportName (at the end before })
  result = result.replace(new RegExp(`,\\s*type\\s+${importName}\\s*(?=})`, 'g'), '');
  // Pattern: { type ImportName, (at the start)
  result = result.replace(new RegExp(`{\\s*type\\s+${importName}\\s*,`, 'g'), '{');
  
  return result;
}

function removeUnusedImport(content: string, importName: string): string {
  // Remove from named imports
  const patterns = [
    // { ImportName, ... } -> { ... }
    new RegExp(`,\\s*${importName}\\s*(?=,|\\s*})`, 'g'),
    // { ImportName, ... } -> { ... }
    new RegExp(`{\\s*${importName}\\s*,`, 'g'),
    // { ..., ImportName } -> { ... }
    new RegExp(`,\\s*${importName}\\s*}`, 'g'),
  ];
  
  let result = content;
  result = result.replace(patterns[0], '');
  result = result.replace(patterns[1], '{');
  result = result.replace(patterns[2], '}');
  
  // Remove empty imports
  result = result.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];\n?/g, '');
  
  return result;
}

function processFile(filePath: string): { modified: boolean; changes: string[] } {
  const changes: string[] = [];
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Type imports that can be safely removed (TypeScript infers them)
  const safeTypeImports = ['ExportFormat'];
  
  // Component/function imports that need analysis before removal
  const importsToCheck = [
    ...safeTypeImports,
    // UI components that may be unused
    'Badge', 'Body', 'Button', 'Select', 'Plus', 'FileText', 'Download', 'Clock',
    // React hooks
    'useEffect', 'useCallback', 'useState', 'useRouter',
    // Lucide icons
    'TrendingUp', 'DollarSign', 'H2', 'H3', 'Card', 'ProgressBar', 'TabPanel', 'Tabs', 'TabsList', 'Tab',
    // Other
    'z', 'PlatformRole', 'router', 'addNotification',
    'category', 'departmentId', 'filters', 'historical', 'period',
    'activeTab', 'setActiveTab', 'getCategoryColor', 'getAvailabilityColor', 'addCueSchema',
    'supabase', 'request', 'createClient', 'Alert', 'CrewMember', 'Equipment',
    'getSupabaseClient',
  ];
  
  for (const importName of importsToCheck) {
    // Check if import exists
    const importPattern = new RegExp(`import[^;]*\\b${importName}\\b[^;]*from`);
    if (importPattern.test(content)) {
      // Check if it's unused
      if (isImportUnused(content, importName)) {
        let newContent = removeUnusedImport(content, importName);
        // Also try removing as type import
        if (newContent === content) {
          newContent = removeTypeImport(content, importName);
        }
        if (newContent !== content) {
          content = newContent;
          modified = true;
          changes.push(`Removed unused import: ${importName}`);
        }
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  return { modified, changes };
}

async function main() {
  console.log('🔍 Scanning for unused imports...\n');
  
  const files = getAllFiles(APPS_DIR, ['.tsx', '.ts']);
  let totalModified = 0;
  let totalChanges = 0;
  
  for (const file of files) {
    const { modified, changes } = processFile(file);
    if (modified) {
      totalModified++;
      totalChanges += changes.length;
      const relativePath = path.relative(process.cwd(), file);
      console.log(`✅ ${relativePath}`);
      changes.forEach(change => console.log(`   - ${change}`));
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files modified: ${totalModified}`);
  console.log(`   Total changes: ${totalChanges}`);
}

main().catch(console.error);
