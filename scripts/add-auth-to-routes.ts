#!/usr/bin/env ts-node
/**
 * Script to add withAuth middleware to all API routes missing authentication
 * Run with: npx ts-node scripts/add-auth-to-routes.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const APPS = ['atlvs', 'compvss', 'gvteway'];

// Routes that should remain public (no auth required)
const PUBLIC_ROUTE_PATTERNS = [
  '/api/auth/',
  '/api/health',
  '/api/webhooks/',
  '/api/cron/',
  '/api/public/',
];

// App-specific role configurations
const APP_ROLES: Record<string, { import: string; roles: string }> = {
  atlvs: {
    import: `import { logger, withAuth, PlatformRole } from '@ghxstship/config';`,
    roles: `const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];`,
  },
  compvss: {
    import: `import { logger, withAuth, PlatformRole } from '@ghxstship/config';`,
    roles: `const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_SUPER_ADMIN, PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];`,
  },
  gvteway: {
    import: `import { logger, withAuth, PlatformRole } from '@ghxstship/config';`,
    roles: `const GVTEWAY_ROLES = [
  PlatformRole.GVTEWAY_SUPER_ADMIN, PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_TEAM_MEMBER, PlatformRole.GVTEWAY_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];`,
  },
};

// Auth check code to inject into each handler
function getAuthCheck(app: string): string {
  const rolesVar = app === 'atlvs' ? 'ATLVS_ROLES' : app === 'compvss' ? 'COMPVSS_ROLES' : 'GVTEWAY_ROLES';
  return `    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!${rolesVar}.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

`;
}

function isPublicRoute(filePath: string): boolean {
  return PUBLIC_ROUTE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function hasAuth(content: string): boolean {
  return content.includes('withAuth') || content.includes('apiRoute');
}

function findAllRoutes(baseDir: string): string[] {
  const routes: string[] = [];
  
  function walk(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file === 'route.ts') {
        routes.push(filePath);
      }
    }
  }
  
  walk(baseDir);
  return routes;
}

function addAuthToRoute(filePath: string, app: string): { success: boolean; message: string } {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has auth
    if (hasAuth(content)) {
      return { success: true, message: 'Already has auth' };
    }
    
    // Skip public routes
    if (isPublicRoute(filePath)) {
      return { success: true, message: 'Public route - skipped' };
    }
    
    const appConfig = APP_ROLES[app];
    const authCheck = getAuthCheck(app);
    
    // Check if already has the import
    const hasConfigImport = content.includes('@ghxstship/config');
    
    // Add import if needed
    if (!hasConfigImport) {
      // Find the first import statement
      const importMatch = content.match(/^import .+ from .+;$/m);
      if (importMatch) {
        content = content.replace(importMatch[0], `${appConfig.import}\n${importMatch[0]}`);
      }
    } else {
      // Update existing import to include withAuth and PlatformRole
      if (!content.includes('withAuth')) {
        content = content.replace(
          /import \{ ([^}]+) \} from '@ghxstship\/config';/,
          (match, imports) => {
            const importList = imports.split(',').map((s: string) => s.trim());
            if (!importList.includes('withAuth')) importList.push('withAuth');
            if (!importList.includes('PlatformRole')) importList.push('PlatformRole');
            if (!importList.includes('logger')) importList.push('logger');
            return `import { ${importList.join(', ')} } from '@ghxstship/config';`;
          }
        );
      }
    }
    
    // Add roles constant if not present
    const rolesVar = app === 'atlvs' ? 'ATLVS_ROLES' : app === 'compvss' ? 'COMPVSS_ROLES' : 'GVTEWAY_ROLES';
    if (!content.includes(rolesVar)) {
      // Find a good place to add it (after imports, before first export)
      const exportMatch = content.match(/^export (async )?function/m);
      if (exportMatch && exportMatch.index) {
        const insertPos = exportMatch.index;
        content = content.slice(0, insertPos) + appConfig.roles + '\n\n' + content.slice(insertPos);
      }
    }
    
    // Add auth check to each handler function
    const handlers = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    for (const handler of handlers) {
      const handlerPattern = new RegExp(
        `(export async function ${handler}\\([^)]*\\)\\s*\\{\\s*)((?:const supabase = [^;]+;\\s*)?)try \\{`,
        'g'
      );
      
      if (handlerPattern.test(content)) {
        content = content.replace(handlerPattern, `$1$2try {\n${authCheck}`);
      }
    }
    
    fs.writeFileSync(filePath, content);
    return { success: true, message: 'Auth added' };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}

// Main execution
function main() {
  console.log('Starting auth remediation...\n');
  
  const stats = {
    total: 0,
    fixed: 0,
    skipped: 0,
    errors: 0,
  };
  
  for (const app of APPS) {
    const apiDir = path.join(process.cwd(), 'apps', app, 'src', 'app', 'api');
    
    if (!fs.existsSync(apiDir)) {
      console.log(`Skipping ${app} - API directory not found`);
      continue;
    }
    
    console.log(`\n=== Processing ${app.toUpperCase()} ===`);
    const routes = findAllRoutes(apiDir);
    
    for (const route of routes) {
      stats.total++;
      const relativePath = route.replace(process.cwd(), '');
      const result = addAuthToRoute(route, app);
      
      if (result.message === 'Auth added') {
        stats.fixed++;
        console.log(`✅ ${relativePath}`);
      } else if (result.message.startsWith('Error')) {
        stats.errors++;
        console.log(`❌ ${relativePath}: ${result.message}`);
      } else {
        stats.skipped++;
        // console.log(`⏭️  ${relativePath}: ${result.message}`);
      }
    }
  }
  
  console.log('\n=== Summary ===');
  console.log(`Total routes: ${stats.total}`);
  console.log(`Fixed: ${stats.fixed}`);
  console.log(`Skipped (already has auth or public): ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
}

main();
