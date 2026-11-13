import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';

const pages = readdirSync('.').filter((f) => f.endsWith('.html'));
export default defineConfig({
  server: { host: '0.0.0.0', port: 8081, open: false },
  build: { outDir: 'dist', target: 'esnext', rollupOptions: { input: pages } },
  esbuild: { target: 'esnext' },
  base: './',
});
