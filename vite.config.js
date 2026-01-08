import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { splitVendorChunkPlugin } from "vite";

export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  
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
      output: {
        // Manual chunk splitting for better optimization
        manualChunks: {
          // Split React into separate chunk
          "react-vendor": ["react", "react-dom"],
          
          // Split Ethereum/wallet libraries
          "web3-vendor": [
            "ethers",
            "viem",
            "@wagmi/core",
            "wagmi",
            "connectkit"
          ],
          
          // Split blockchain-specific libraries
          "blockchain-vendor": [
            "@solana/web3.js",
            "tronweb",
            "@tonconnect/ui",
            "@tonconnect/ui-react",
            "@walletconnect/ethereum-provider"
          ],
          
          // Split utility libraries
          "utils-vendor": [
            "axios",
            "@tanstack/react-query"
          ]
        },
        // Optimize chunk names
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000, // Increase to 1MB
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
      "ethers",
      "viem",
      "wagmi"
    ],
    exclude: ["@solana/web3.js"] // Exclude large libs from optimization
  }
});
