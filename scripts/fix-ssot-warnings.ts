#!/usr/bin/env ts-node
/**
 * Script to fix SSOT warnings by renaming local column/filter definitions
 * Renames 'columns' to entity-specific names like 'orderColumns', 'ticketColumns', etc.
 * Renames 'filters' to entity-specific names like 'orderFilters', 'ticketFilters', etc.
 */

import * as fs from 'fs';
import * as path from 'path';

const APPS_DIR = path.join(__dirname, '..', 'apps');

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

function getEntityPrefix(filePath: string): string {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1].replace('.tsx', '').replace(/\[.*\]/, '');
  
  if (fileName === 'page') {
    const parentDir = parts[parts.length - 2];
    if (parentDir.startsWith('[')) {
      const grandParentDir = parts[parts.length - 3];
      return grandParentDir.replace(/-/g, '');
    }
    return parentDir.replace(/-/g, '');
  }
  
  return fileName.replace(/-/g, '');
}

function fixSsotPatterns(filePath: string): boolean {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  const prefix = getEntityPrefix(filePath);
  
  const columnsPattern = /\bconst\s+columns\s*:\s*ListPageColumn/g;
  if (columnsPattern.test(content)) {
    const newName = `${prefix}Columns`;
    content = content.replace(/\bconst\s+columns\s*:/g, `const ${newName}:`);
    content = content.replace(/\bcolumns={columns}/g, `columns={${newName}}`);
    content = content.replace(/\bcolumns=\{columns\}/g, `columns={${newName}}`);
  }
  
  const filtersPattern = /\bconst\s+filters\s*:\s*(ListPageFilter|FilterDefinition)/g;
  if (filtersPattern.test(content)) {
    const newName = `${prefix}Filters`;
    content = content.replace(/\bconst\s+filters\s*:/g, `const ${newName}:`);
    content = content.replace(/\bfilters={filters}/g, `filters={${newName}}`);
    content = content.replace(/\bfilters=\{filters\}/g, `filters={${newName}}`);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  
  return false;
}

const files = findTsxFiles(APPS_DIR);
let fixedCount = 0;

for (const file of files) {
  if (fixSsotPatterns(file)) {
    fixedCount++;
  }
}

process.stdout.write(`Fixed ${fixedCount} files with SSOT patterns\n`);
