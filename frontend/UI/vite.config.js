import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(() => {
  const uiNodeModules = path.resolve(__dirname, 'node_modules');
  const aiRoot = path.resolve(__dirname, '../../Ai');

  return {
    plugins: [react()],
    // Files under ../../Ai resolve node_modules by walking up from that folder, so they never
    // see this app's node_modules (a sibling directory). Pin bare imports to UI dependencies.
    resolve: {
      alias: {
        '@ai': aiRoot,
        '@ui': path.resolve(__dirname, 'src'),
        react: path.join(uiNodeModules, 'react'),
        'react-dom': path.join(uiNodeModules, 'react-dom'),
        'lucide-react': path.join(uiNodeModules, 'lucide-react'),
        '@google/generative-ai': path.join(uiNodeModules, '@google/generative-ai'),
        'framer-motion': path.join(uiNodeModules, 'framer-motion'),
        'react-router-dom': path.join(uiNodeModules, 'react-router-dom'),
      },
    },
    server: {
      fs: {
        allow: ['../..']
      },
      // Dev: browser calls same origin `/api/*`; Vite forwards to the Express app (default port 5000).
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            icons: ['@heroicons/react', 'lucide-react', 'react-icons'],
            toast: ['react-toastify'],
          },
        },
      },
    },
  };
});
