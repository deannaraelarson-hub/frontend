#!/bin/bash
set -e

echo "🔧 Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

echo "🏗️  Building application..."
npm run build

echo "✅ Build completed successfully!"
