#!/usr/bin/env npx ts-node
/**
 * Script to add import functionality to ListPage components
 * Run with: npx ts-node scripts/add-import-to-listpages.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const APPS_DIR = path.join(__dirname, '..', 'apps');

// Get all files with ListPage but without onImport
function getFilesNeedingImport(): string[] {
  try {
    const listPageFiles = execSync(
      `grep -l "ListPage<" ${APPS_DIR} --include="*.tsx" -r | grep -v ".next" | grep -v "node_modules"`,
      { encoding: 'utf-8' }
    ).trim().split('\n').filter(Boolean);
    
    const filesWithImport = execSync(
      `grep -l "onImport=" ${APPS_DIR} --include="*.tsx" -r | grep -v ".next" | grep -v "node_modules"`,
      { encoding: 'utf-8' }
    ).trim().split('\n').filter(Boolean);
    
    return listPageFiles.filter(f => !filesWithImport.includes(f));
  } catch {
    return [];
  }
}

// Extract entity type from file
function extractEntityType(content: string): string | null {
  const match = content.match(/entityType="([^"]+)"/);
  return match ? match[1] : null;
}

// Extract interface name from file
function extractInterfaceName(content: string): string | null {
  const match = content.match(/ListPage<(\w+)>/);
  return match ? match[1] : null;
}

// Check if file already imports createImportHandler
function hasImportHandler(content: string): boolean {
  return content.includes('createImportHandler');
}

// Add import handler import
function addImportHandlerImport(content: string): string {
  if (content.includes('createImportHandler')) return content;
  
  // Check if createExportHandler is imported
  if (content.includes('createExportHandler')) {
    return content.replace(
      /import\s*{\s*createExportHandler\s*}\s*from\s*['"]@ghxstship\/config['"]/,
      "import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config'"
    ).replace(
      /import\s*{\s*createExportHandler,([^}]+)}\s*from\s*['"]@ghxstship\/config['"]/,
      "import { createExportHandler, createImportHandler, getImportTemplates,$1} from '@ghxstship/config'"
    );
  }
  
  // Add new import
  const lastImportMatch = content.match(/^import .+$/gm);
  if (lastImportMatch && lastImportMatch.length > 0) {
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;
    return content.slice(0, insertPosition) + 
      "\nimport { createImportHandler, getImportTemplates } from '@ghxstship/config';" + 
      content.slice(insertPosition);
  }
  
  return content;
}

// Extract fields from formFields or columns
function extractFields(content: string): string[] {
  const fields: string[] = [];
  
  // Try to extract from formFields
  const formFieldsMatch = content.match(/name:\s*['"](\w+)['"]/g);
  if (formFieldsMatch) {
    formFieldsMatch.forEach(m => {
      const fieldMatch = m.match(/name:\s*['"](\w+)['"]/);
      if (fieldMatch) fields.push(fieldMatch[1]);
    });
  }
  
  // Try to extract from columns
  const columnsMatch = content.match(/key:\s*['"](\w+)['"]/g);
  if (columnsMatch) {
    columnsMatch.forEach(m => {
      const fieldMatch = m.match(/key:\s*['"](\w+)['"]/);
      if (fieldMatch && !fields.includes(fieldMatch[1])) {
        fields.push(fieldMatch[1]);
      }
    });
  }
  
  return fields.filter(f => f !== 'id' && f !== 'actions');
}

// Add import handler to component
function addImportHandler(content: string, entityType: string, interfaceName: string, fields: string[]): string {
  // Find a good place to add the handler (before return statement or after other handlers)
  const returnMatch = content.match(/\n(\s*)return\s*\(/);
  if (!returnMatch) return content;
  
  const indent = returnMatch[1];
  const insertPosition = returnMatch.index!;
  
  const requiredFields = fields.slice(0, 3).map(f => `'${f}'`).join(', ');
  const sampleFields = fields.slice(0, 7).map(f => `'${f}'`).join(', ');
  
  const handlerCode = `
${indent}// Import handler for CSV/JSON files
${indent}const handleImport = createImportHandler<Omit<${interfaceName}, 'id'>>({
${indent}  entityType: '${entityType}',
${indent}  requiredFields: [${requiredFields}],
${indent}  onImport: async (records) => {
${indent}    for (const record of records) {
${indent}      await fetch('/api/${entityType}', {
${indent}        method: 'POST',
${indent}        headers: { 'Content-Type': 'application/json' },
${indent}        body: JSON.stringify({ organization_id: 'default-org', ...record }),
${indent}      });
${indent}    }
${indent}    refetch();
${indent}  },
${indent}});

${indent}// Import templates for field mapping
${indent}const importTemplates = getImportTemplates('${entityType}');
`;
  
  return content.slice(0, insertPosition) + handlerCode + content.slice(insertPosition);
}

// Add import props to ListPage
function addImportProps(content: string, fields: string[]): string {
  const sampleFields = fields.slice(0, 7).map(f => `'${f}'`).join(', ');
  
  // Find entityType prop and add import props after it
  const entityTypeMatch = content.match(/(\s*)entityType="[^"]+"/);
  if (entityTypeMatch) {
    const indent = entityTypeMatch[1];
    const insertPosition = content.indexOf(entityTypeMatch[0]) + entityTypeMatch[0].length;
    
    const importProps = `
${indent}onImport={handleImport}
${indent}importTemplates={importTemplates}
${indent}importSampleFields={[${sampleFields}]}`;
    
    return content.slice(0, insertPosition) + importProps + content.slice(insertPosition);
  }
  
  return content;
}

// Process a single file
function processFile(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Skip if already has import
    if (content.includes('onImport=')) {
      return false;
    }
    
    const entityType = extractEntityType(content);
    const interfaceName = extractInterfaceName(content);
    const fields = extractFields(content);
    
    if (!entityType || !interfaceName || fields.length === 0) {
      console.log(`[SKIP] ${filePath} - missing entityType, interface, or fields`);
      return false;
    }
    
    // Add imports
    content = addImportHandlerImport(content);
    
    // Add handler
    content = addImportHandler(content, entityType, interfaceName, fields);
    
    // Add props
    content = addImportProps(content, fields);
    
    fs.writeFileSync(filePath, content);
    console.log(`[FIXED] ${filePath}`);
    return true;
  } catch (error) {
    console.error(`[ERROR] ${filePath}:`, error);
    return false;
  }
}

// Main
function main() {
  console.log('Finding ListPage files without import...');
  const files = getFilesNeedingImport();
  console.log(`Found ${files.length} files to process\n`);
  
  let fixed = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const file of files) {
    const result = processFile(file);
    if (result) {
      fixed++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\nDone! Fixed ${fixed} files, skipped ${skipped}, ${errors} errors`);
}

main();
