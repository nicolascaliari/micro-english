#!/bin/bash
# Script de build para Render

set -e

echo "🔧 Instalando dependencias..."
npm install

echo "📦 Construyendo aplicación..."

# Intentar con nest build primero
if command -v node_modules/.bin/nest &> /dev/null || npm run build 2>/dev/null; then
    npm run build
else
    echo "⚠️  Nest CLI no encontrado, usando TypeScript directamente..."
    npm run build:tsc
fi

echo "✅ Build completado exitosamente!"

