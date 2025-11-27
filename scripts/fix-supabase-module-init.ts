#!/usr/bin/env npx ts-node
/**
 * Script to fix Supabase client module-level initialization in API routes.
 * 
 * Problem: API routes create Supabase clients at module level, which fails during
 * Next.js static analysis/build because environment variables aren't available.
 * 
 * Solution: Move client creation inside handler functions using a factory pattern.
 */

import * as fs from 'fs';
import * as path from 'path';

const API_DIR = path.join(__dirname, '../apps/gvteway/src/app/api');

// Pattern to match module-level supabase client creation
const MODULE_LEVEL_PATTERN = /^(import { NextRequest, NextResponse } from 'next\/server';\s*\n)(import { createClient } from '@supabase\/supabase-js';\s*\n)([^]*?)(const supabase = createClient\(\s*\n?\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL[^;]+;\s*\n)/m;

// Replacement with factory function
const FACTORY_REPLACEMENT = `$1import { createClient } from '@supabase/supabase-js';
$3
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
`;

function findRouteFiles(dir: string): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name === 'route.ts') {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function fixFile(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if file has module-level supabase client
  if (!content.includes('const supabase = createClient(')) {
    return false;
  }
  
  // Check if already fixed (has getSupabaseClient function)
  if (content.includes('function getSupabaseClient()')) {
    return false;
  }
  
  // Find all export async function handlers
  const handlerPattern = /export async function (GET|POST|PUT|PATCH|DELETE)\(request: NextRequest\) \{\s*\n\s*try \{/g;
  
  let newContent = content;
  
  // First, replace module-level client with factory function
  // Handle various patterns of module-level initialization
  const patterns = [
    // Pattern 1: Simple createClient with service role key
    /const supabase = createClient\(\s*\n?\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL[^)]+\);\s*\n/,
    // Pattern 2: With fallback to anon key
    /const supabase = createClient\(\s*\n?\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL \|\| '',[^)]+\);\s*\n/,
  ];
  
  let foundPattern = false;
  for (const pattern of patterns) {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, `function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

`);
      foundPattern = true;
      break;
    }
  }
  
  if (!foundPattern) {
    console.log(`  Skipping ${filePath} - pattern not matched`);
    return false;
  }
  
  // Now add const supabase = getSupabaseClient(); at the start of each handler's try block
  newContent = newContent.replace(
    /export async function (GET|POST|PUT|PATCH|DELETE)\(request: NextRequest\) \{\s*\n\s*try \{\s*\n(\s*)(const authHeader|const body|const \{|\/\/)/g,
    (match, method, indent, nextLine) => {
      return `export async function ${method}(request: NextRequest) {
  try {
${indent}const supabase = getSupabaseClient();
${indent}${nextLine}`;
    }
  );
  
  // Write back
  fs.writeFileSync(filePath, newContent, 'utf-8');
  return true;
}

function main() {
  console.log('Finding route files...');
  const files = findRouteFiles(API_DIR);
  console.log(`Found ${files.length} route files`);
  
  let fixed = 0;
  let skipped = 0;
  
  for (const file of files) {
    const relativePath = path.relative(API_DIR, file);
    if (fixFile(file)) {
      console.log(`✓ Fixed: ${relativePath}`);
      fixed++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\nDone! Fixed ${fixed} files, skipped ${skipped} files.`);
}

main();
