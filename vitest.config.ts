import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'packages/config/roles.ts',
        'packages/config/permissions.ts',
        'packages/config/logger.ts',
        'packages/config/error-handler.ts',
        'packages/config/form-validators.ts',
        'packages/ui/src/utils/**/*.ts',
      ],
      exclude: [
        'node_modules/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/__tests__/**',
        '**/*.d.ts',
      ],
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ghxstship/ui': path.resolve(__dirname, './packages/ui/src'),
      '@ghxstship/config': path.resolve(__dirname, './packages/config/src'),
    },
  },
});
