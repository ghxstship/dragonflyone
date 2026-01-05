import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@ghxstship/ui',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'next'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          next: 'Next',
        },
        manualChunks: {
          // Group related components together
          'atoms': [
            './src/atoms/Button/index.ts',
            './src/atoms/Input/index.ts',
            './src/atoms/Card/index.ts',
            './src/atoms/Typography/index.ts',
            './src/atoms/Badge/index.ts',
          ],
          'molecules': [
            './src/molecules/FormField/index.ts',
            './src/molecules/NavItem/index.ts',
            './src/molecules/StatusBadge/index.ts',
          ],
          'organisms': [
            './src/organisms/DataTable/index.ts',
            './src/organisms/Sidebar/index.ts',
            './src/organisms/Modal/index.ts',
          ],
          'templates': [
            './src/templates/ListPage/index.ts',
            './src/templates/DetailPage/index.ts',
            './src/templates/CreatePage/index.ts',
          ],
          // Vendor chunks
          'vendor': ['lucide-react', 'class-variance-authority', 'clsx'],
          'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'radix': ['@radix-ui/react-navigation-menu'],
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },
    chunkSizeWarningLimit: 1000, // 1MB warning limit
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
});
