#!/usr/bin/env npx ts-node

/**
 * Script to remove unused router declarations
 * Pattern: const router = useRouter(); where router is never used
 */

import * as fs from 'fs';
import * as path from 'path';

const APPS_DIR = path.join(__dirname, '..', 'apps');

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

function isRouterUsed(content: string): boolean {
  // Check if router is used anywhere (excluding the declaration)
  const lines = content.split('\n');
  let routerUsageCount = 0;
  
  for (const line of lines) {
    // Skip the declaration line
    if (line.includes('const router = useRouter()')) continue;
    
    // Check for router usage
    if (/\brouter\b/.test(line)) {
      routerUsageCount++;
    }
  }
  
  return routerUsageCount > 0;
}

function processFile(filePath: string): { modified: boolean; changes: string[] } {
  const changes: string[] = [];
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Check if file has router declaration
  if (!content.includes('const router = useRouter()')) {
    return { modified: false, changes: [] };
  }
  
  // Check if router is used
  if (isRouterUsed(content)) {
    return { modified: false, changes: [] };
  }
  
  // Remove the router declaration line
  content = content.replace(/\s*const router = useRouter\(\);\n?/g, '\n');
  
  // Check if useRouter is now unused
  const useRouterUsed = content.includes('useRouter(');
  if (!useRouterUsed) {
    // Remove useRouter import
    content = content.replace(/,\s*useRouter\s*(?=,|\s*})/g, '');
    content = content.replace(/{\s*useRouter\s*,/g, '{');
    content = content.replace(/,\s*useRouter\s*}/g, '}');
    changes.push('Removed unused useRouter import');
  }
  
  const modified = content !== originalContent;
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    changes.unshift('Removed unused router declaration');
  }
  
  return { modified, changes };
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('🔍 Scanning for unused router declarations...\n');
  
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
