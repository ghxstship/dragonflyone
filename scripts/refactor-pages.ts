#!/usr/bin/env npx ts-node
/**
 * Page Refactoring Script
 * Batch refactors pages to use the new AppLayout wrappers
 * 
 * Usage: npx ts-node scripts/refactor-pages.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface AppConfig {
  name: string;
  layoutImport: string;
  loadingLayoutImport: string;
  emptyLayoutImport: string;
  layoutComponent: string;
  loadingComponent: string;
  emptyComponent: string;
  navigationImports: string[];
}

const APP_CONFIGS: Record<string, AppConfig> = {
  gvteway: {
    name: 'GVTEWAY',
    layoutImport: "import { GvtewayAppLayout, GvtewayLoadingLayout, GvtewayEmptyLayout } from '@/components/app-layout';",
    loadingLayoutImport: "import { GvtewayLoadingLayout } from '@/components/app-layout';",
    emptyLayoutImport: "import { GvtewayEmptyLayout } from '@/components/app-layout';",
    layoutComponent: 'GvtewayAppLayout',
    loadingComponent: 'GvtewayLoadingLayout',
    emptyComponent: 'GvtewayEmptyLayout',
    navigationImports: [
      'ConsumerNavigationPublic',
      'ConsumerNavigationAuthenticated',
      'MembershipNavigationPublic',
      'CreatorNavigationPublic',
      'CreatorNavigationAuthenticated',
    ],
  },
  atlvs: {
    name: 'ATLVS',
    layoutImport: "import { AtlvsAppLayout, AtlvsLoadingLayout, AtlvsEmptyLayout } from '@/components/app-layout';",
    loadingLayoutImport: "import { AtlvsLoadingLayout } from '@/components/app-layout';",
    emptyLayoutImport: "import { AtlvsEmptyLayout } from '@/components/app-layout';",
    layoutComponent: 'AtlvsAppLayout',
    loadingComponent: 'AtlvsLoadingLayout',
    emptyComponent: 'AtlvsEmptyLayout',
    navigationImports: [
      'CreatorNavigationPublic',
      'CreatorNavigationAuthenticated',
    ],
  },
  compvss: {
    name: 'COMPVSS',
    layoutImport: "import { CompvssAppLayout, CompvssLoadingLayout, CompvssEmptyLayout } from '@/components/app-layout';",
    loadingLayoutImport: "import { CompvssLoadingLayout } from '@/components/app-layout';",
    emptyLayoutImport: "import { CompvssEmptyLayout } from '@/components/app-layout';",
    layoutComponent: 'CompvssAppLayout',
    loadingComponent: 'CompvssLoadingLayout',
    emptyComponent: 'CompvssEmptyLayout',
    navigationImports: [
      'CreatorNavigationPublic',
      'CreatorNavigationAuthenticated',
    ],
  },
};

function getAppFromPath(filePath: string): string | null {
  if (filePath.includes('/apps/gvteway/')) return 'gvteway';
  if (filePath.includes('/apps/atlvs/')) return 'atlvs';
  if (filePath.includes('/apps/compvss/')) return 'compvss';
  return null;
}

function needsRefactoring(content: string): boolean {
  // Check if file uses PageLayout with inline header/footer
  return content.includes('PageLayout') && 
         (content.includes('<Footer') || content.includes('header={'));
}

function refactorPage(filePath: string, content: string, config: AppConfig): string {
  let newContent = content;
  
  // Remove old imports
  const importsToRemove = [
    'PageLayout',
    'Footer',
    'FooterColumn',
    'FooterLink',
    'Section',
    'Container',
    'SectionLayout',
    ...config.navigationImports,
  ];
  
  // This is a simplified version - actual implementation would need more sophisticated parsing
  console.log(`Would refactor: ${filePath}`);
  console.log(`  - Replace PageLayout with ${config.layoutComponent}`);
  console.log(`  - Remove inline header/footer definitions`);
  console.log(`  - Remove Section/Container wrappers`);
  
  return newContent;
}

async function main() {
  const apps = ['gvteway', 'atlvs', 'compvss'];
  
  for (const app of apps) {
    const config = APP_CONFIGS[app];
    const pattern = `apps/${app}/src/app/**/page.tsx`;
    const files = await glob(pattern);
    
    console.log(`\n=== ${config.name} ===`);
    console.log(`Found ${files.length} pages`);
    
    let needsRefactor = 0;
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (needsRefactoring(content)) {
        needsRefactor++;
        // refactorPage(file, content, config);
      }
    }
    console.log(`Pages needing refactoring: ${needsRefactor}`);
  }
}

main().catch(console.error);
