import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [
    viteSingleFile(),
    {
      name: 'usb-classic-script',
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
    outDir: 'release-usb',
    emptyOutDir: true,
    rollupOptions: {
      input: './Rational-Numbers-Quick-Check.html'
    }
  }
});
