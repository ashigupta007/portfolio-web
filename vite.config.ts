import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

// https://api.vercel.com/v1/integrations/deploy/prj_RKA2GeNPrnEyujARBvLn4rnPfFZ9/rA4ZapxPxI