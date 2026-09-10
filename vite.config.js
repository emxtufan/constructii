import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    host: '0.0.0.0', port: 4174, strictPort: false,
    proxy: { '/api': { target: 'http://127.0.0.1:3001', changeOrigin: true, configure: proxy => {
      proxy.on('proxyReq', proxyReq => {
        // Vite serves HTTPS locally; the backend listens on HTTP loopback.
        proxyReq.setHeader('origin', 'http://127.0.0.1:3001');
      });
    } } },
  },
  preview: { port: 4174 },
});
