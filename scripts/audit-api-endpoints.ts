#!/usr/bin/env npx ts-node

/**
 * Comprehensive API Endpoint Audit Script
 * Tests all API endpoints across ATLVS, COMPVSS, and GVTEWAY
 * against both remote and local Supabase
 */

import * as fs from 'fs';
import * as path from 'path';

interface EndpointResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  error?: string;
  responseTime: number;
}

interface AuditReport {
  app: string;
  supabaseEnv: 'remote' | 'local';
  totalEndpoints: number;
  passed: number;
  failed: number;
  results: EndpointResult[];
  timestamp: string;
}

const APPS = {
  gvteway: { port: 3000, apiDir: 'apps/gvteway/src/app/api' },
  atlvs: { port: 3001, apiDir: 'apps/atlvs/src/app/api' },
  compvss: { port: 3002, apiDir: 'apps/compvss/src/app/api' },
};

interface RouteInfo {
  apiRoute: string;
  filePath: string;
}

function findAllRoutes(apiDir: string): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  function walkDir(dir: string, basePath: string = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const routePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath, routePath);
      } else if (entry.name === 'route.ts') {
        // Store both the API route (with test-id substitution) and the actual file path
        const apiRoute = basePath
          .replace(/\\/g, '/')
          .replace(/\[([^\]]+)\]/g, 'test-id'); // Replace dynamic segments for URL
        routes.push({
          apiRoute,
          filePath: fullPath, // Keep actual file path for reading
        });
      }
    }
  }
  
  walkDir(apiDir);
  return routes.sort((a, b) => a.apiRoute.localeCompare(b.apiRoute));
}

function getExportedMethods(routeFilePath: string): string[] {
  const content = fs.readFileSync(routeFilePath, 'utf8');
  const methods: string[] = [];
  
  // Check for exported HTTP methods
  if (/export\s+(async\s+)?function\s+GET/m.test(content) || /export\s+const\s+GET\s*=/m.test(content)) {
    methods.push('GET');
  }
  if (/export\s+(async\s+)?function\s+POST/m.test(content) || /export\s+const\s+POST\s*=/m.test(content)) {
    methods.push('POST');
  }
  if (/export\s+(async\s+)?function\s+PUT/m.test(content) || /export\s+const\s+PUT\s*=/m.test(content)) {
    methods.push('PUT');
  }
  if (/export\s+(async\s+)?function\s+PATCH/m.test(content) || /export\s+const\s+PATCH\s*=/m.test(content)) {
    methods.push('PATCH');
  }
  if (/export\s+(async\s+)?function\s+DELETE/m.test(content) || /export\s+const\s+DELETE\s*=/m.test(content)) {
    methods.push('DELETE');
  }
  
  return methods;
}

async function testEndpoint(
  baseUrl: string,
  endpoint: string,
  method: string
): Promise<EndpointResult> {
  const url = `${baseUrl}/api/${endpoint}`;
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      // For POST/PUT/PATCH, send empty body
      ...(method !== 'GET' && method !== 'DELETE' ? { body: '{}' } : {}),
    });
    
    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;
    
    // Consider 2xx, 3xx, 401, 403 as "working" (auth issues are expected without token)
    const success = response.status < 500;
    
    return {
      endpoint,
      method,
      status: response.status,
      success,
      responseTime,
      error: success ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      endpoint,
      method,
      status: 0,
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function auditApp(
  appName: keyof typeof APPS,
  supabaseEnv: 'remote' | 'local'
): Promise<AuditReport> {
  const app = APPS[appName];
  const baseUrl = `http://localhost:${app.port}`;
  const apiDir = path.join(process.cwd(), app.apiDir);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Auditing ${appName.toUpperCase()} against ${supabaseEnv.toUpperCase()} Supabase`);
  console.log(`${'='.repeat(60)}`);
  
  const routes = findAllRoutes(apiDir);
  console.log(`Found ${routes.length} route files`);
  
  const results: EndpointResult[] = [];
  let passed = 0;
  let failed = 0;
  
  for (let i = 0; i < routes.length; i++) {
    const routeInfo = routes[i];
    const methods = getExportedMethods(routeInfo.filePath);
    
    for (const method of methods) {
      const result = await testEndpoint(baseUrl, routeInfo.apiRoute, method);
      results.push(result);
      
      if (result.success) {
        passed++;
        process.stdout.write('.');
      } else {
        failed++;
        process.stdout.write('F');
        console.log(`\n  FAIL: ${method} /api/${routeInfo.apiRoute} - ${result.error}`);
      }
      
      // Rate limiting - small delay between requests
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Progress update every 50 routes
    if ((i + 1) % 50 === 0) {
      console.log(`\n  Progress: ${i + 1}/${routes.length} routes tested`);
    }
  }
  
  console.log(`\n\nResults: ${passed} passed, ${failed} failed out of ${results.length} endpoints`);
  
  return {
    app: appName,
    supabaseEnv,
    totalEndpoints: results.length,
    passed,
    failed,
    results,
    timestamp: new Date().toISOString(),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const supabaseEnv = (args[0] as 'remote' | 'local') || 'remote';
  const appFilter = args[1] as keyof typeof APPS | undefined;
  
  console.log(`\nAPI Endpoint Audit - ${supabaseEnv.toUpperCase()} Supabase`);
  console.log(`Started at: ${new Date().toISOString()}`);
  
  const reports: AuditReport[] = [];
  const appsToTest = appFilter ? [appFilter] : Object.keys(APPS) as (keyof typeof APPS)[];
  
  for (const appName of appsToTest) {
    const report = await auditApp(appName, supabaseEnv);
    reports.push(report);
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('AUDIT SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
  let totalPassed = 0;
  let totalFailed = 0;
  let totalEndpoints = 0;
  
  for (const report of reports) {
    console.log(`\n${report.app.toUpperCase()}:`);
    console.log(`  Total: ${report.totalEndpoints}`);
    console.log(`  Passed: ${report.passed}`);
    console.log(`  Failed: ${report.failed}`);
    console.log(`  Success Rate: ${((report.passed / report.totalEndpoints) * 100).toFixed(1)}%`);
    
    totalPassed += report.passed;
    totalFailed += report.failed;
    totalEndpoints += report.totalEndpoints;
    
    // List failed endpoints
    const failures = report.results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log(`\n  Failed Endpoints:`);
      for (const f of failures) {
        console.log(`    - ${f.method} /api/${f.endpoint}: ${f.error}`);
      }
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('OVERALL:');
  console.log(`  Total Endpoints: ${totalEndpoints}`);
  console.log(`  Passed: ${totalPassed}`);
  console.log(`  Failed: ${totalFailed}`);
  console.log(`  Success Rate: ${((totalPassed / totalEndpoints) * 100).toFixed(1)}%`);
  console.log(`${'='.repeat(60)}`);
  
  // Save report to file
  const reportPath = path.join(process.cwd(), `api-audit-${supabaseEnv}-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2));
  console.log(`\nFull report saved to: ${reportPath}`);
  
  // Exit with error if any failures
  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
