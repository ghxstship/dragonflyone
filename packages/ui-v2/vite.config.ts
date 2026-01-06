import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        tokens: resolve(__dirname, 'src/tokens/index.ts'),
        primitives: resolve(__dirname, 'src/primitives/index.ts'),
        components: resolve(__dirname, 'src/components/index.ts'),
        patterns: resolve(__dirname, 'src/patterns/index.ts'),
        whitelabel: resolve(__dirname, 'src/whitelabel/index.ts'),
        hooks: resolve(__dirname, 'src/hooks/index.ts'),
        utils: resolve(__dirname, 'src/utils/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2022',
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
