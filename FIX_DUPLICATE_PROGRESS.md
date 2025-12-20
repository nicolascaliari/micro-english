# Fix: Duplicados en user_progress

## 🐛 Problema Identificado

Se estaban creando documentos duplicados en la colección `user_progress` para el mismo `userId` + `stepId`, causando que:

1. Las secciones no se desbloquearan correctamente después de completar lecciones
2. Existían múltiples registros con diferentes estados (`in_progress` y `completed`) para el mismo paso

### Ejemplo del problema:

```json
// Documento 1 - creado al iniciar el paso
{
  "_id": "6946fd18f60604a665aeb30b",
  "userId": "692c8f45a5175e29705c4fd7",
  "stepId": "692c84b3460f0f30c7bc5011",
  "status": "in_progress",
  "score": 0
}

// Documento 2 - creado al completar (DUPLICADO)
{
  "_id": "6946fd20f60604a665aeb30e",
  "userId": "692c8f45a5175e29705c4fd7",
  "stepId": "692c7198460f0f30c7bc500f",
  "status": "completed",
  "score": 100
}
```

## 🔍 Causa Raíz

El problema estaba en los métodos `unlockStep` y `completeStep` del servicio `UserProgressService`:

1. **`unlockStep`**: Usaba `upsert` pero sin `$setOnInsert`, causando que se crearan nuevos documentos en lugar de actualizar existentes
2. **`completeStep`**: Usaba `findOne` + `save()` o `new Model()`, lo cual no es atómico y puede crear duplicados en condiciones de carrera (race conditions)

## ✅ Solución Implementada

### 1. Índice Único Compuesto (Ya existía)

El schema ya tenía un índice único compuesto definido:

```typescript
UserProgressSchema.index({ userId: 1, stepId: 1 }, { unique: true });
```

Este índice **previene** nuevos duplicados, pero no elimina los existentes.

### 2. Mejorado método `upsert`

```typescript
async upsert(
  userId: string,
  stepId: string,
  updateDto: Partial<UserProgress>,
): Promise<UserProgress> {
  const userObjectId = toObjectId(userId, 'userId');
  const stepObjectId = toObjectId(stepId, 'stepId');
  
  const result = await this.userProgressModel
    .findOneAndUpdate(
      {
        userId: userObjectId,
        stepId: stepObjectId,
      },
      {
        $set: updateDto,
        $setOnInsert: {
          userId: userObjectId,
          stepId: stepObjectId,
          status: 'locked',
          score: 0,
          attempts_count: 0,
        }
      },
      { new: true, upsert: true },
    )
    .exec();

  return result;
}
```

**Cambios clave:**
- Usa `$set` para actualizar campos existentes
- Usa `$setOnInsert` para establecer valores por defecto solo cuando se crea un nuevo documento
- Operación atómica que previene race conditions

### 3. Mejorado método `completeStep`

```typescript
async completeStep(
  userId: string,
  stepId: string,
  score: number,
): Promise<UserProgress> {
  const userObjectId = toObjectId(userId, 'userId');
  const stepObjectId = toObjectId(stepId, 'stepId');
  
  // Usar findOneAndUpdate con upsert para evitar duplicados
  // Esto garantiza atomicidad y previene race conditions
  const result = await this.userProgressModel
    .findOneAndUpdate(
      {
        userId: userObjectId,
        stepId: stepObjectId,
      },
      {
        $set: {
          status: 'completed',
          score: score,
          completed_at: new Date(),
        },
        $inc: {
          attempts_count: 1,
        },
        $setOnInsert: {
          userId: userObjectId,
          stepId: stepObjectId,
          unlocked_at: new Date(),
        }
      },
      { 
        new: true, 
        upsert: true,
      },
    )
    .exec();

  return result;
}
```

**Cambios clave:**
- Reemplaza `findOne` + `save()` por una sola operación `findOneAndUpdate`
- Usa `$inc` para incrementar `attempts_count` de forma atómica
- Usa `$setOnInsert` para campos que solo se establecen en creación
- Operación completamente atómica

## 🧹 Script de Limpieza

Se creó un script para limpiar los duplicados existentes en la base de datos:

### Ubicación:
```
src/scripts/clean-duplicate-progress.ts
```

### Ejecutar:
```bash
npm run clean-duplicates
```

### ¿Qué hace el script?

1. **Encuentra duplicados**: Usa agregación de MongoDB para encontrar grupos de documentos con el mismo `userId` + `stepId`
2. **Selecciona el mejor**: Para cada grupo, mantiene el documento con:
   - Estado `completed` tiene prioridad sobre `in_progress` y `locked`
   - Fecha de actualización más reciente
   - Score más alto
3. **Elimina duplicados**: Borra todos los documentos duplicados excepto el seleccionado
4. **Muestra resumen**: Imprime estadísticas de la limpieza

### Ejemplo de salida:

```
🚀 Iniciando limpieza de duplicados en user_progress...

📊 Encontrados 5 grupos de duplicados

📝 Procesando grupo: userId=692c8f45a5175e29705c4fd7, stepId=692c84b3460f0f30c7bc5011
   Documentos encontrados: 2
   ✅ Manteniendo documento:
      _id: 6946fd20f60604a665aeb30e
      status: completed
      score: 100
      updatedAt: 2025-12-20T19:47:03.334Z
   🗑️  Eliminando 1 documento(s) duplicado(s):
      - _id: 6946fd18f60604a665aeb30b (status: in_progress, score: 0)

============================================================
✅ Limpieza completada exitosamente
📊 Resumen:
   - Grupos de duplicados procesados: 5
   - Documentos mantenidos: 5
   - Documentos eliminados: 5
============================================================
```

## 📋 Pasos para Aplicar el Fix

### 1. Detener el servidor backend (si está corriendo)

```bash
# En la terminal del backend
Ctrl+C
```

### 2. Ejecutar el script de limpieza

```bash
cd micro-english
npm run clean-duplicates
```

### 3. Reiniciar el servidor

```bash
npm run start:dev
```

### 4. Verificar en la app

1. Abre la app móvil
2. Completa una lección de vocabulary
3. Verifica que grammar se desbloquee correctamente
4. Revisa en MongoDB que no haya duplicados nuevos

## 🔍 Verificación en MongoDB

### Buscar duplicados:

```javascript
db.user_progress.aggregate([
  {
    $group: {
      _id: { userId: "$userId", stepId: "$stepId" },
      count: { $sum: 1 },
      docs: { $push: "$$ROOT" }
    }
  },
  {
    $match: {
      count: { $gt: 1 }
    }
  }
])
```

### Verificar índice único:

```javascript
db.user_progress.getIndexes()
```

Deberías ver:

```javascript
{
  "v": 2,
  "key": { "userId": 1, "stepId": 1 },
  "name": "userId_1_stepId_1",
  "unique": true
}
```

## 🎯 Resultado Esperado

Después de aplicar el fix:

1. ✅ No se crearán más duplicados en `user_progress`
2. ✅ Las secciones se desbloquearán correctamente al completar lecciones
3. ✅ Solo existirá un documento por cada combinación de `userId` + `stepId`
4. ✅ El progreso se actualizará correctamente sin crear nuevos registros

## 🚨 Importante

- El índice único **previene** nuevos duplicados, pero no elimina los existentes
- **Debes ejecutar el script de limpieza** para eliminar duplicados existentes
- El script es **idempotente**: puedes ejecutarlo múltiples veces sin problemas
- Siempre haz un **backup de la base de datos** antes de ejecutar scripts de limpieza

## 📚 Referencias

- [MongoDB Upsert](https://docs.mongodb.com/manual/reference/method/db.collection.update/#upsert-option)
- [MongoDB $setOnInsert](https://docs.mongodb.com/manual/reference/operator/update/setOnInsert/)
- [MongoDB Unique Indexes](https://docs.mongodb.com/manual/core/index-unique/)

