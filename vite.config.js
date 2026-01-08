import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  // Server configuration
  server: {
    port: 3000,
    host: true
  },
  
  // Preview configuration (for production)
  preview: {
    port: 10000,
    host: true
  },
  
  // Simple build configuration
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    
    // IMPORTANT: Add react-is to commonjs options
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-is',
      'styled-components',
      'ethers',
      'viem',
      'wagmi',
      'connectkit'
    ],
    exclude: [
      '@solana/web3.js',
      'tronweb'
    ]
  },
  
  // Resolve configuration
  resolve: {
    dedupe: ['react', 'react-dom', 'react-is', 'styled-components']
  }
});
