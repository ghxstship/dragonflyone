#!/usr/bin/env npx ts-node
/**
 * Script to replace console.error with log.error from @ghxstship/config
 * Run with: npx ts-node scripts/fix-console-errors.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const APPS_DIR = path.join(__dirname, '..', 'apps');

// Get all files with console.error
function getFilesWithConsoleError(): string[] {
  const result = execSync(
    `grep -rl "console.error" ${APPS_DIR} --include="*.tsx" --include="*.ts" | grep -v ".next" | grep -v "node_modules"`,
    { encoding: 'utf-8' }
  );
  return result.trim().split('\n').filter(Boolean);
}

// Check if file already imports log from @ghxstship/config
function hasLogImport(content: string): boolean {
  return content.includes("import { log }") || 
         content.includes("import {log}") ||
         content.includes(", log }") ||
         content.includes(", log}") ||
         content.includes("{ log,") ||
         content.includes("{log,");
}

// Check if file already imports logger from @ghxstship/config
function hasLoggerImport(content: string): boolean {
  return content.includes("import { logger }") || 
         content.includes("import {logger}") ||
         content.includes(", logger }") ||
         content.includes(", logger}") ||
         content.includes("{ logger,") ||
         content.includes("{logger,");
}

// Add log import to file
function addLogImport(content: string): string {
  // Check if there's already an import from @ghxstship/config
  const configImportMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]@ghxstship\/config['"]/);
  
  if (configImportMatch) {
    // Add log to existing import
    const existingImports = configImportMatch[1];
    if (!existingImports.includes('log')) {
      const newImports = existingImports.trim() + ', log';
      return content.replace(configImportMatch[0], `import {${newImports}} from '@ghxstship/config'`);
    }
    return content;
  }
  
  // Find a good place to add the import (after other imports)
  const lastImportMatch = content.match(/^import .+$/gm);
  if (lastImportMatch && lastImportMatch.length > 0) {
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;
    return content.slice(0, insertPosition) + "\nimport { log } from '@ghxstship/config';" + content.slice(insertPosition);
  }
  
  // Fallback: add at the beginning
  return "import { log } from '@ghxstship/config';\n" + content;
}

// Replace console.error patterns
function replaceConsoleError(content: string): string {
  // Pattern 1: console.error('message', error)
  content = content.replace(
    /console\.error\(['"]([^'"]+)['"],?\s*(\w+)?\)/g,
    (match, message, errorVar) => {
      if (errorVar) {
        return `log.error('${message}', ${errorVar} instanceof Error ? ${errorVar} : undefined)`;
      }
      return `log.error('${message}')`;
    }
  );
  
  // Pattern 2: console.error('message:', error)
  content = content.replace(
    /console\.error\(['"]([^'"]+):['"],?\s*(\w+)\)/g,
    (match, message, errorVar) => {
      return `log.error('${message}', ${errorVar} instanceof Error ? ${errorVar} : undefined)`;
    }
  );
  
  // Pattern 3: console.error(error)
  content = content.replace(
    /console\.error\((\w+)\)/g,
    (match, errorVar) => {
      return `log.error('Error occurred', ${errorVar} instanceof Error ? ${errorVar} : undefined)`;
    }
  );
  
  return content;
}

// Process a single file
function processFile(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (!content.includes('console.error')) {
      return false;
    }
    
    // Skip if already using logger (different API)
    if (hasLoggerImport(content)) {
      // Replace console.error with logger.error
      content = content.replace(/console\.error/g, 'logger.error');
      fs.writeFileSync(filePath, content);
      console.log(`[FIXED with logger] ${filePath}`);
      return true;
    }
    
    // Add log import if needed
    if (!hasLogImport(content)) {
      content = addLogImport(content);
    }
    
    // Replace console.error
    content = replaceConsoleError(content);
    
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
  console.log('Finding files with console.error...');
  const files = getFilesWithConsoleError();
  console.log(`Found ${files.length} files to process\n`);
  
  let fixed = 0;
  let errors = 0;
  
  for (const file of files) {
    if (processFile(file)) {
      fixed++;
    } else {
      errors++;
    }
  }
  
  console.log(`\nDone! Fixed ${fixed} files, ${errors} errors`);
}

main();
