import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [
    viteSingleFile(),
    {
      name: 'offline-classic-script',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html.replace('<script type="module"', '<script');
        }
      }
    }
  ],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    // This is the only folder teachers need to copy to a USB drive.
    outDir: '课堂离线版',
    emptyOutDir: true
  }
});
