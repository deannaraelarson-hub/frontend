import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  // Server configuration
  server: {
    port: 3000,
    host: true,
    open: true
  },
  
  // Preview configuration (for production)
  preview: {
    port: 10000,
    host: true,
    strictPort: true
  },
  
  // Build optimization
  build: {
    outDir: "dist",
    sourcemap: false, // Disable source maps for smaller build
    minify: "terser", // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    },
    rollupOptions: {
      // External dependencies that shouldn't be bundled
      external: [
        // Add problematic dependencies here if needed
      ],
      output: {
        // Function form for manual chunks (better optimization)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React and React DOM
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-is')) {
              return 'vendor-react';
            }
            // Web3/Ethereum libraries
            if (id.includes('ethers') || id.includes('viem') || id.includes('wagmi') || id.includes('connectkit')) {
              return 'vendor-web3';
            }
            // Blockchain-specific
            if (id.includes('@solana') || id.includes('tronweb') || id.includes('@tonconnect') || id.includes('@walletconnect')) {
              return 'vendor-blockchain';
            }
            // UI libraries
            if (id.includes('styled-components')) {
              return 'vendor-ui';
            }
            // Utility libraries
            if (id.includes('axios') || id.includes('@tanstack')) {
              return 'vendor-utils';
            }
            // Everything else
            return 'vendor-other';
          }
        },
        // Optimize chunk names
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1500, // Increase to 1.5MB
    // Target modern browsers for smaller bundles
    target: "es2020",
    // Enable brotli compression for better gzip
    reportCompressedSize: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-is",
      "ethers",
      "viem",
      "wagmi",
      "styled-components"
    ],
    exclude: [
      "@solana/web3.js", // Exclude large libs from optimization
      "tronweb"
    ]
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      // Add any aliases if needed
    }
  }
});
