import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/atlvs/vitest.config.ts',
  'apps/compvss/vitest.config.ts',
  'apps/gvteway/vitest.config.ts',
  'packages/ui/vitest.config.ts',
  'packages/config/vitest.config.ts',
]);
