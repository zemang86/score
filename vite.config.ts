import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build optimizations
  build: {
    // Enable rollup optimizations
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react'],
          router: ['react-router-dom'],
          openai: ['openai'],
          // Split admin components
          admin: [
            './src/components/admin/AdminDashboard.tsx',
            './src/components/admin/AdminLoginPage.tsx'
          ],
          // Split dashboard components
          dashboard: [
            './src/components/dashboard/ParentDashboard.tsx',
            './src/components/dashboard/ExamModal.tsx'
          ]
        }
      }
    },
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Use esbuild minification (default, no additional deps needed)
    minify: 'esbuild',
    // Enable source maps for production debugging
    sourcemap: true,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000
  },

  // Dependency optimization
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react', 
      'react-dom', 
      '@supabase/supabase-js',
      'react-router-dom',
      'lucide-react'
    ]
  },

  // Performance optimizations
  esbuild: {
    // Remove console.log in production builds
    drop: ['console', 'debugger']
  },

  // Development server optimizations
  server: {
    // Enable compression
    compress: true,
    // Warm up commonly used files
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/contexts/AuthContext.tsx'
      ]
    }
  }
});
