import { defineConfig } from 'vite';

export default defineConfig({
  base: '/web-water-color/',
  publicDir: false,
  build: {
    outDir: 'pages-dist',
    emptyOutDir: true,
  },
});

