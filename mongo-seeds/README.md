# MongoDB Seeds - Grammar Collections

Este directorio contiene archivos JSON con datos de ejemplo para las colecciones de gramática.

## 📋 Estructura

- `grammar-topics.json` - Temas de gramática (reglas y explicaciones)
- `grammar-exercises.json` - Ejercicios asociados a los temas
- `user-grammar-progress.json` - Ejemplo de progreso de usuario (opcional)

## 🚀 Cómo importar los datos

### Opción 1: Usando MongoDB Compass
1. Abre MongoDB Compass
2. Conéctate a tu base de datos
3. Selecciona la base de datos `english-learning`
4. Para cada archivo:
   - Crea la colección si no existe (ej: `grammar_topics`)
   - Haz clic en "ADD DATA" → "Import File"
   - Selecciona el archivo JSON correspondiente

### Opción 2: Usando mongoimport (Terminal)

```bash
# Importar temas de gramática
mongoimport --uri "mongodb+srv://nicolascaliari28:KCQa6YRnjYQSIXEV@cluster-fluxenet-dev.cwhkn.mongodb.net/english-learning" --collection grammar_topics --file mongo-seeds/grammar-topics.json --jsonArray

# Importar ejercicios
mongoimport --uri "mongodb+srv://nicolascaliari28:KCQa6YRnjYQSIXEV@cluster-fluxenet-dev.cwhkn.mongodb.net/english-learning" --collection grammar_exercises --file mongo-seeds/grammar-exercises.json --jsonArray
```

### Opción 3: Usando la API REST

Puedes crear los temas usando los endpoints POST:

```bash
# Crear un tema de gramática
curl -X POST http://localhost:3001/grammar-topics \
  -H "Content-Type: application/json" \
  -d @mongo-seeds/grammar-topics.json
```

## ⚠️ Importante

### Antes de importar ejercicios:

1. **Primero importa los temas de gramática**
2. **Obtén los IDs** de los temas creados en MongoDB
3. **Reemplaza los placeholders** en `grammar-exercises.json`:
   - `REPLACE_WITH_PRESENT_SIMPLE_TOPIC_ID` → ID real del tema "Present Simple"
   - `REPLACE_WITH_PAST_SIMPLE_TOPIC_ID` → ID real del tema "Past Simple"
   - `REPLACE_WITH_PRESENT_CONTINUOUS_TOPIC_ID` → ID real del tema "Present Continuous"
   - `REPLACE_WITH_COMPARATIVES_TOPIC_ID` → ID real del tema "Comparatives"
   - `REPLACE_WITH_FUTURE_WILL_TOPIC_ID` → ID real del tema "Future with Will"
   - `REPLACE_WITH_PRESENT_PERFECT_TOPIC_ID` → ID real del tema "Present Perfect"

### Script para reemplazar IDs automáticamente:

```javascript
// Ejemplo: obtener IDs después de crear los temas
// Luego reemplazar en grammar-exercises.json
```

## 📊 Datos incluidos

### Grammar Topics (6 temas):
1. Present Simple (A1)
2. Past Simple (A2)
3. Present Continuous (A1)
4. Comparatives (A2)
5. Future with Will (A2)
6. Present Perfect (B1)

### Grammar Exercises (24 ejercicios):
- 5 ejercicios de Present Simple
- 5 ejercicios de Past Simple
- 3 ejercicios de Present Continuous
- 4 ejercicios de Comparatives
- 3 ejercicios de Future with Will
- 4 ejercicios de Present Perfect

Tipos de ejercicios incluidos:
- Multiple Choice
- Fill in the Blank
- Sentence Order

Niveles de dificultad:
- Easy (12 ejercicios)
- Medium (9 ejercicios)
- Hard (3 ejercicios)

## 🔄 Actualización de datos

Si necesitas agregar más temas o ejercicios:

1. Agrega los nuevos objetos al JSON correspondiente
2. Importa nuevamente usando una de las opciones anteriores
3. Los nuevos datos se agregarán a la colección existente

## ✨ Notas

- Todos los JSON están en formato de array para facilitar la importación
- Los ejercicios incluyen explicaciones educativas
- Los temas incluyen estructuras, ejemplos y tips
- Los niveles van de A1 (principiante) a B1 (intermedio)

