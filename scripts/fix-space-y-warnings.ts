#!/usr/bin/env ts-node
/**
 * Script to fix PROHIBITED Tailwind space-y warnings
 * Replaces <Box className="space-y-N"> with <Stack gap={N}>
 * and fixes corresponding closing tags
 */

import * as fs from 'fs';
import * as path from 'path';

const APPS_DIR = path.join(__dirname, '..', 'apps');

// Find all .tsx files
function findTsxFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findTsxFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix space-y patterns in a file
function fixSpaceYPatterns(filePath: string): boolean {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Check if file has space-y patterns
  if (!content.includes('space-y-')) {
    return false;
  }
  
  // Pattern 1: <Box className="space-y-N"> -> <Stack gap={N}>
  content = content.replace(/<Box className="space-y-(\d+)">/g, '<Stack gap={$1}>');
  
  // Pattern 2: <Box className="space-y-N other-classes"> -> <Stack gap={N} className="other-classes">
  content = content.replace(/<Box className="space-y-(\d+)\s+([^"]+)">/g, '<Stack gap={$1} className="$2">');
  
  // Pattern 3: <Box className="other-classes space-y-N"> -> <Stack gap={N} className="other-classes">
  content = content.replace(/<Box className="([^"]*)\s+space-y-(\d+)">/g, '<Stack gap={$2} className="$1">');
  
  // Pattern 4: <Box className="other-classes space-y-N more-classes"> -> <Stack gap={N} className="other-classes more-classes">
  content = content.replace(/<Box className="([^"]*)\s+space-y-(\d+)\s+([^"]+)">/g, '<Stack gap={$2} className="$1 $3">');
  
  // Check if Stack import is needed
  if (content !== originalContent) {
    // Check if Stack is already imported
    if (!content.includes('Stack') || !content.match(/import\s*{[^}]*Stack[^}]*}\s*from\s*["']@ghxstship\/ui["']/)) {
      // Add Stack to existing @ghxstship/ui import
      content = content.replace(
        /import\s*{\s*([^}]*)\s*}\s*from\s*["']@ghxstship\/ui["']/,
        (match, imports) => {
          if (imports.includes('Stack')) return match;
          const importList = imports.split(',').map((s: string) => s.trim()).filter(Boolean);
          if (!importList.includes('Stack')) {
            importList.push('Stack');
          }
          return `import { ${importList.join(', ')} } from "@ghxstship/ui"`;
        }
      );
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main
const files = findTsxFiles(APPS_DIR);
let fixedCount = 0;

for (const file of files) {
  if (fixSpaceYPatterns(file)) {
    fixedCount++;
  }
}

console.log(`\nFixed ${fixedCount} files with space-y patterns`);
