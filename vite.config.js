import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // <--- ADICIONE OU AO ALTERE ESSA LINHA
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@firebase') || id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react';
          }
          if (
            id.includes('node_modules/bootstrap') ||
            id.includes('node_modules/lucide-react') ||
            id.includes('node_modules/react-number-format')
          ) {
            return 'ui';
          }
        },
      },
    },
  },
})
