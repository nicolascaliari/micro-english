# 🚨 FIX URGENTE: Pasos Duplicados y Backend sin Actualizar

## 🐛 Problemas Identificados

### 1. Backend en Producción NO Actualizado
El backend en Render.com **NO tiene los cambios** que hicimos para prevenir duplicados.
Los cambios solo están en el código local.

### 2. Steps Duplicados en la Base de Datos
Hay steps duplicados con el mismo título y tipo:

```javascript
// Vocabulario Básico - 2 documentos
{"_id": "692c934f460f0f30c7bc5025", "title": "Vocabulario Básico", "type": "vocabulary"}
{"_id": "692c7198460f0f30c7bc500f", "title": "Vocabulario Básico", "type": "vocabulary", "order": 1}

// Present simple - 2 documentos  
{"_id": "692c84b3460f0f30c7bc5011", "title": "Present simple", "type": "grammar", "order": 2}
{"_id": "692c936e460f0f30c7bc5027", "title": "Present simple", "type": "grammar", "order": 2}

// Tips de Pronunciación - 2 documentos
{"_id": "692c8607460f0f30c7bc5013", "title": "Tips de Pronunciación", "type": "tips", "order": 3}
{"_id": "692c938d460f0f30c7bc5029", "title": "Tips de Pronunciación", "type": "tips", "order": 3}

// Examen final - 2 documentos
{"_id": "692c8676460f0f30c7bc5015", "title": "Examen final", "type": "exam", "order": 4}
{"_id": "692c939f460f0f30c7bc502b", "title": "Examen final", "type": "exam", "order": 4}
```

### 3. User Progress Duplicados
Hay múltiples registros de progreso para el mismo usuario y step.

## ✅ Solución Paso a Paso

### PASO 1: Limpiar Base de Datos (MongoDB Compass)

#### A. Eliminar Steps Duplicados

**IMPORTANTE**: Antes de eliminar, verifica cuáles steps tienen `unlock_requirements` configurados correctamente.

```javascript
// 1. Ver todos los steps y sus unlock_requirements
db.learning_steps.find({}, {
  _id: 1,
  title: 1,
  type: 1,
  order: 1,
  categoryId: 1,
  unlock_requirements: 1
}).sort({ order: 1 })

// 2. Eliminar los steps SIN order definido (son los duplicados nuevos)
db.learning_steps.deleteMany({
  _id: { $in: [
    ObjectId("692c934f460f0f30c7bc5025"),  // Vocabulario Básico sin order
    ObjectId("692c939f460f0f30c7bc502b"),  // Examen final duplicado
  ]}
})

// 3. Verificar que quedó solo un step de cada tipo por categoría
db.learning_steps.find({}).sort({ order: 1 })
```

#### B. Eliminar User Progress Duplicados

```javascript
// 1. Ver duplicados
db.user_progress.aggregate([
  {
    $group: {
      _id: { userId: "$userId", stepId: "$stepId" },
      count: { $sum: 1 },
      docs: { $push: "$$ROOT" }
    }
  },
  {
    $match: { count: { $gt: 1 } }
  }
])

// 2. Ejecutar el script de limpieza (desde tu máquina local)
// cd /Users/nicolas/Desktop/ENGLISH_APP/micro-english
// npm run clean-duplicates
```

#### C. Limpiar TODO el Progreso del Usuario (Opción más segura)

Si hay muchos duplicados, es más fácil empezar de cero:

```javascript
// CUIDADO: Esto borra TODO el progreso del usuario
db.user_progress.deleteMany({
  userId: ObjectId("692c8f45a5175e29705c4fd7")
})

// También borrar los intentos
db.step_attempts.deleteMany({
  userId: ObjectId("692c8f45a5175e29705c4fd7")
})
```

### PASO 2: Configurar unlock_requirements

```javascript
// Ejecutar desde tu máquina local (después de limpiar duplicados)
cd /Users/nicolas/Desktop/ENGLISH_APP/micro-english
npm run fix-unlocks
```

### PASO 3: Desplegar Backend Actualizado

#### Opción A: Desde tu máquina local

```bash
cd /Users/nicolas/Desktop/ENGLISH_APP/micro-english

# 1. Verificar cambios
git status

# 2. Agregar cambios
git add src/user-progress/user-progress.service.ts
git add src/scripts/
git add package.json
git add FIX_DUPLICATE_PROGRESS.md
git add FIX_SEQUENTIAL_UNLOCK.md

# 3. Commit
git commit -m "fix: prevent duplicate user_progress and add sequential unlock"

# 4. Push
git push origin main
```

#### Opción B: Redesplegar manualmente en Render

1. Ve a https://render.com
2. Encuentra tu servicio `micro-english`
3. Click en "Manual Deploy" → "Deploy latest commit"
4. Espera a que termine el despliegue (~5-10 minutos)

### PASO 4: Verificar que Funciona

1. **Reinicia la app móvil** (cierra completamente y abre de nuevo)
2. **Prueba el flujo**:
   - Completa vocabulary → solo grammar se desbloquea
   - Completa grammar → solo tips se desbloquea
   - Etc.
3. **Verifica en MongoDB** que no se crean duplicados:
   ```javascript
   // Debe haber solo 1 documento por userId + stepId
   db.user_progress.find({
     userId: ObjectId("692c8f45a5175e29705c4fd7")
   }).sort({ createdAt: -1 })
   ```

## 🔍 Por Qué Pasó Esto

1. **Backend no actualizado**: Los cambios solo estaban en local, no en producción
2. **Steps duplicados**: Probablemente se crearon manualmente o por algún script
3. **Race conditions**: Sin el fix del upsert, se creaban múltiples registros simultáneos

## 📋 Checklist

- [ ] Limpiar steps duplicados en MongoDB
- [ ] Limpiar user_progress duplicados (ejecutar `npm run clean-duplicates`)
- [ ] Ejecutar `npm run fix-unlocks` para configurar unlock_requirements
- [ ] Hacer commit de los cambios
- [ ] Push a GitHub
- [ ] Redesplegar en Render
- [ ] Verificar que el backend actualizado está corriendo
- [ ] Probar en la app móvil
- [ ] Verificar en MongoDB que no se crean duplicados

## 🚨 IMPORTANTE

**NO uses la app hasta que:**
1. Hayas limpiado los duplicados en MongoDB
2. Hayas desplegado el backend actualizado
3. Hayas configurado los unlock_requirements

De lo contrario, seguirás creando duplicados y el problema empeorará.

## 💡 Comandos Rápidos

```bash
# Limpiar duplicados de user_progress
cd /Users/nicolas/Desktop/ENGLISH_APP/micro-english
npm run clean-duplicates

# Configurar unlock_requirements
npm run fix-unlocks

# Ver estado de git
git status

# Commit y push
git add .
git commit -m "fix: prevent duplicates and sequential unlock"
git push origin main
```

## 🔗 Enlaces Útiles

- Render Dashboard: https://dashboard.render.com
- MongoDB Compass: Conectar a tu base de datos
- GitHub Repo: Tu repositorio de micro-english

