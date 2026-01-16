import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:4000',
      '/addresses': 'http://localhost:4000',
      '/rider-docs': 'http://localhost:4000',
      '/vendors': 'http://localhost:4000',
      '/orders': 'http://localhost:4000',
      '/payments': 'http://localhost:4000',
      '/devices': 'http://localhost:4000',
      '/notify': 'http://localhost:4000',
      '/admin': 'http://localhost:4000',
      '/rider': 'http://localhost:4000',
      '/files': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});


