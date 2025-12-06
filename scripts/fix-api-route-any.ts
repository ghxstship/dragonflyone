#!/usr/bin/env npx ts-node

/**
 * Script to fix common `any` type patterns in API routes
 * Targets:
 * - context: any -> context: { params: Promise<Record<string, string>> }
 * - (item: any) -> (item: Record<string, unknown>)
 * - : any[] -> : unknown[]
 * - as any -> as unknown (where safe)
 */

import * as fs from 'fs';
import * as path from 'path';

const APPS_DIR = path.join(__dirname, '..', 'apps');

function getAllFiles(dir: string, pattern: string): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(fullPath);
        }
      } else if (entry.isFile() && entry.name === pattern) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function processFile(filePath: string): { modified: boolean; changes: string[] } {
  const changes: string[] = [];
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Fix 1: context: any -> context: { params: Promise<Record<string, string>> }
  const contextPattern = /context:\s*any(?=\s*\))/g;
  if (contextPattern.test(content)) {
    content = content.replace(contextPattern, 'context: { params: Promise<Record<string, string>> }');
    changes.push('Fixed context: any type');
  }
  
  // Fix 2: (item: any) in map/filter/reduce callbacks -> (item: Record<string, unknown>)
  // Be careful - only fix simple cases
  const mapItemPattern = /\.map\(\s*\(\s*(\w+):\s*any\s*\)/g;
  if (mapItemPattern.test(content)) {
    content = content.replace(mapItemPattern, '.map(($1: Record<string, unknown>)');
    changes.push('Fixed map callback any type');
  }
  
  const filterItemPattern = /\.filter\(\s*\(\s*(\w+):\s*any\s*\)/g;
  if (filterItemPattern.test(content)) {
    content = content.replace(filterItemPattern, '.filter(($1: Record<string, unknown>)');
    changes.push('Fixed filter callback any type');
  }
  
  // Fix reduce with (acc, item: any)
  const reduceItemPattern = /\.reduce\(\s*\(\s*(\w+),\s*(\w+):\s*any\s*\)/g;
  if (reduceItemPattern.test(content)) {
    content = content.replace(reduceItemPattern, '.reduce(($1, $2: Record<string, unknown>)');
    changes.push('Fixed reduce callback any type');
  }
  
  // Fix reduce with (acc: type, item: any)
  const reduceItemPattern2 = /\.reduce\(\s*\(\s*(\w+):\s*\w+,\s*(\w+):\s*any\s*\)/g;
  if (reduceItemPattern2.test(content)) {
    content = content.replace(reduceItemPattern2, '.reduce(($1: number, $2: Record<string, unknown>)');
    changes.push('Fixed reduce callback any type (with typed acc)');
  }
  
  // Fix 3: : any[] -> : unknown[]
  const anyArrayPattern = /:\s*any\[\]/g;
  if (anyArrayPattern.test(content)) {
    content = content.replace(anyArrayPattern, ': unknown[]');
    changes.push('Fixed any[] type');
  }
  
  // Fix 4: as any in JSON parsing -> as unknown
  const asAnyJsonPattern = /JSON\.parse\([^)]+\)\s*as\s*any/g;
  if (asAnyJsonPattern.test(content)) {
    content = content.replace(asAnyJsonPattern, (match) => match.replace('as any', 'as unknown'));
    changes.push('Fixed JSON.parse as any');
  }
  
  // Fix 5: Record<string, any> -> Record<string, unknown>
  const recordAnyPattern = /Record<string,\s*any>/g;
  if (recordAnyPattern.test(content)) {
    content = content.replace(recordAnyPattern, 'Record<string, unknown>');
    changes.push('Fixed Record<string, any> type');
  }
  
  // Fix 6: Promise<any> -> Promise<unknown>
  const promiseAnyPattern = /Promise<any>/g;
  if (promiseAnyPattern.test(content)) {
    content = content.replace(promiseAnyPattern, 'Promise<unknown>');
    changes.push('Fixed Promise<any> type');
  }
  
  const modified = content !== originalContent;
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  return { modified, changes };
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('🔍 Scanning API routes for `any` types...\n');
  
  const files = getAllFiles(APPS_DIR, 'route.ts');
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
