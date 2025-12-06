#!/usr/bin/env npx ts-node

/**
 * Script to remove unused helper functions from page components
 * Targets: getPriorityColor, getStatusBg, getScoreColor, getRiskScoreColor, etc.
 */

import * as fs from 'fs';
import * as path from 'path';

const APPS_DIR = path.join(__dirname, '..', 'apps');

// Functions to check and potentially remove
const FUNCTIONS_TO_CHECK = [
  'getPriorityColor',
  'getStatusBg', 
  'getScoreColor',
  'getRiskScoreColor',
  'getProbabilityValue',
  'getImpactValue',
  'getCategoryIcon',
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

function isFunctionUnused(content: string, funcName: string): boolean {
  // Find the function definition
  const defPattern = new RegExp(`const\\s+${funcName}\\s*=`);
  if (!defPattern.test(content)) {
    return false; // Function not defined
  }
  
  // Count usages (excluding the definition)
  const usagePattern = new RegExp(`${funcName}\\s*\\(`, 'g');
  const matches = content.match(usagePattern);
  
  // If only 0 or 1 match (the definition itself might match), it's unused
  return !matches || matches.length <= 1;
}

function removeFunctionDefinition(content: string, funcName: string): string {
  // Match the entire function definition including the arrow function body
  // Pattern: const funcName = (params) => { ... };
  const patterns = [
    // Arrow function with block body
    new RegExp(
      `\\s*const\\s+${funcName}\\s*=\\s*\\([^)]*\\)\\s*(?::\\s*[^=]+)?\\s*=>\\s*\\{[^}]*\\};?\\n?`,
      'g'
    ),
    // Arrow function with expression body (switch statement)
    new RegExp(
      `\\s*const\\s+${funcName}\\s*=\\s*\\([^)]*\\)\\s*(?::\\s*[^=]+)?\\s*=>\\s*\\{[\\s\\S]*?^\\s*\\};?\\n?`,
      'gm'
    ),
  ];
  
  let result = content;
  
  // Try to find and remove the function
  const lines = content.split('\n');
  let inFunction = false;
  let braceCount = 0;
  let startLine = -1;
  let endLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (!inFunction && line.includes(`const ${funcName} =`)) {
      inFunction = true;
      startLine = i;
      braceCount = 0;
    }
    
    if (inFunction) {
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      
      if (braceCount === 0 && line.includes('}')) {
        endLine = i;
        break;
      }
    }
  }
  
  if (startLine !== -1 && endLine !== -1) {
    // Remove the function lines
    lines.splice(startLine, endLine - startLine + 1);
    result = lines.join('\n');
    
    // Clean up extra blank lines
    result = result.replace(/\n{3,}/g, '\n\n');
  }
  
  return result;
}

function processFile(filePath: string): { modified: boolean; changes: string[] } {
  const changes: string[] = [];
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  for (const funcName of FUNCTIONS_TO_CHECK) {
    if (isFunctionUnused(content, funcName)) {
      const newContent = removeFunctionDefinition(content, funcName);
      if (newContent !== content && newContent.length < content.length) {
        content = newContent;
        modified = true;
        changes.push(`Removed unused function: ${funcName}`);
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  return { modified, changes };
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('🔍 Scanning for unused helper functions...\n');
  
  const files = getAllFiles(APPS_DIR, ['.tsx']);
  let totalModified = 0;
  let totalChanges = 0;
  
  for (const file of files) {
    const { modified, changes } = processFile(file);
    if (modified) {
      totalModified++;
      totalChanges += changes.length;
      const relativePath = path.relative(process.cwd(), file);
      // eslint-disable-next-line no-console
      console.log(`✅ ${relativePath}`);
      // eslint-disable-next-line no-console
      changes.forEach(change => console.log(`   - ${change}`));
    }
  }
  
  // eslint-disable-next-line no-console
  console.log(`\n📊 Summary:`);
  // eslint-disable-next-line no-console
  console.log(`   Files modified: ${totalModified}`);
  // eslint-disable-next-line no-console
  console.log(`   Total changes: ${totalChanges}`);
}

main().catch(console.error);
