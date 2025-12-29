#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Link Checker Script
 * Validates all internal and external links in the ATLVS sitemap
 * 
 * Usage: pnpm tsx scripts/check-links.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface LinkCheckResult {
  url: string;
  status: 'ok' | 'error' | 'redirect' | 'timeout';
  statusCode?: number;
  redirectUrl?: string;
  error?: string;
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT_MS = 10000;

// Extract URLs from sitemap
function extractSitemapUrls(): string[] {
  const sitemapPath = join(__dirname, '../apps/atlvs/src/app/sitemap.ts');
  
  try {
    const content = readFileSync(sitemapPath, 'utf-8');
    const pathMatches = content.match(/path:\s*['"]([^'"]+)['"]/g) || [];
    return pathMatches.map(match => {
      const path = match.match(/['"]([^'"]+)['"]/)?.[1] || '';
      return path;
    });
  } catch (error) {
    console.error('Failed to read sitemap:', error);
    return [];
  }
}

// Check a single URL
async function checkUrl(path: string): Promise<LinkCheckResult> {
  const url = `${BASE_URL}${path}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.status >= 200 && response.status < 300) {
      return { url, status: 'ok', statusCode: response.status };
    }
    
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get('location') || undefined;
      return { url, status: 'redirect', statusCode: response.status, redirectUrl };
    }
    
    return { url, status: 'error', statusCode: response.status };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { url, status: 'timeout', error: 'Request timed out' };
      }
      return { url, status: 'error', error: error.message };
    }
    return { url, status: 'error', error: 'Unknown error' };
  }
}

// Main function
async function main() {
  console.log('Link Checker for ATLVS');
  console.log('======================\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timeout: ${TIMEOUT_MS}ms\n`);
  
  const paths = extractSitemapUrls();
  console.log(`Found ${paths.length} URLs in sitemap\n`);
  
  if (paths.length === 0) {
    console.log('No URLs found. Make sure the sitemap file exists.');
    process.exit(1);
  }
  
  const results: LinkCheckResult[] = [];
  let checked = 0;
  
  // Check URLs in batches of 5 to avoid overwhelming the server
  const batchSize = 5;
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(checkUrl));
    results.push(...batchResults);
    checked += batch.length;
    process.stdout.write(`\rChecking... ${checked}/${paths.length}`);
  }
  
  console.log('\n\n');
  
  // Categorize results
  const ok = results.filter(r => r.status === 'ok');
  const redirects = results.filter(r => r.status === 'redirect');
  const errors = results.filter(r => r.status === 'error');
  const timeouts = results.filter(r => r.status === 'timeout');
  
  // Print summary
  console.log('Summary');
  console.log('-------');
  console.log(`Total URLs: ${results.length}`);
  console.log(`OK: ${ok.length}`);
  console.log(`Redirects: ${redirects.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Timeouts: ${timeouts.length}`);
  console.log('');
  
  // Print errors
  if (errors.length > 0) {
    console.log('Errors');
    console.log('------');
    errors.forEach(r => {
      console.log(`  ${r.url}`);
      console.log(`    Status: ${r.statusCode || 'N/A'}`);
      if (r.error) console.log(`    Error: ${r.error}`);
    });
    console.log('');
  }
  
  // Print redirects
  if (redirects.length > 0) {
    console.log('Redirects');
    console.log('---------');
    redirects.forEach(r => {
      console.log(`  ${r.url} -> ${r.redirectUrl || 'unknown'}`);
    });
    console.log('');
  }
  
  // Print timeouts
  if (timeouts.length > 0) {
    console.log('Timeouts');
    console.log('--------');
    timeouts.forEach(r => {
      console.log(`  ${r.url}`);
    });
    console.log('');
  }
  
  // Exit with error code if there are broken links
  if (errors.length > 0 || timeouts.length > 0) {
    console.log('Link check failed. Please fix the broken links above.');
    process.exit(1);
  }
  
  console.log('All links are valid!');
  process.exit(0);
}

main().catch(console.error);
