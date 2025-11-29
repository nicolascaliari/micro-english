#!/bin/bash

# Script de ejemplo para importar datos de gramática a MongoDB
# Ajusta la URI de conexión según tu configuración

MONGODB_URI="mongodb+srv://nicolascaliari28:KCQa6YRnjYQSIXEV@cluster-fluxenet-dev.cwhkn.mongodb.net/english-learning"
DB_NAME="english-learning"

echo "🚀 Importando datos de gramática a MongoDB..."

# Importar temas de gramática
echo "📚 Importando grammar-topics..."
mongoimport --uri "$MONGODB_URI" \
  --collection grammar_topics \
  --file grammar-topics.json \
  --jsonArray \
  --drop

# Nota: Después de importar los temas, necesitas:
# 1. Obtener los IDs de los temas creados
# 2. Reemplazar los placeholders en grammar-exercises.json
# 3. Luego importar los ejercicios

echo ""
echo "✅ Temas importados!"
echo ""
echo "⚠️  IMPORTANTE: Antes de importar ejercicios:"
echo "   1. Obtén los IDs de los temas desde MongoDB"
echo "   2. Reemplaza los placeholders en grammar-exercises.json"
echo "   3. Luego ejecuta: mongoimport --uri '$MONGODB_URI' --collection grammar_exercises --file grammar-exercises.json --jsonArray"
echo ""

# Para importar ejercicios (descomenta después de actualizar los IDs):
# echo "📝 Importando grammar-exercises..."
# mongoimport --uri "$MONGODB_URI" \
#   --collection grammar_exercises \
#   --file grammar-exercises.json \
#   --jsonArray

echo "✨ Proceso completado!"

