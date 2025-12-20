# Fix: Desbloqueo Secuencial de Steps dentro de Categorías

## 🐛 Problema Identificado

Cuando se completa una categoría y se desbloquea la siguiente, **todos los steps** de la nueva categoría se desbloquean simultáneamente, cuando deberían desbloquearse **secuencialmente** (uno tras otro).

### Comportamiento Actual (Incorrecto):
```
Categoría 1: "Presentarse y presentar a otros"
  ✅ Vocabulary (completado)
  ✅ Grammar (completado)
  ✅ Tips (completado)
  ✅ Reading (completado)
  ✅ Listening (completado)
  ✅ Speaking (completado)

Categoría 2: "Hablar de donde eres" ← Se desbloquea
  🔓 Vocabulary (desbloqueado) ✅ CORRECTO
  🔓 Grammar (desbloqueado) ❌ INCORRECTO - debería estar bloqueado
  🔓 Tips (desbloqueado) ❌ INCORRECTO - debería estar bloqueado
  🔓 Reading (desbloqueado) ❌ INCORRECTO - debería estar bloqueado
  🔓 Listening (desbloqueado) ❌ INCORRECTO - debería estar bloqueado
  🔓 Speaking (desbloqueado) ❌ INCORRECTO - debería estar bloqueado
```

### Comportamiento Esperado (Correcto):
```
Categoría 2: "Hablar de donde eres"
  🔓 Vocabulary (desbloqueado) ← Solo este
  🔒 Grammar (bloqueado) ← Se desbloquea al completar Vocabulary
  🔒 Tips (bloqueado) ← Se desbloquea al completar Grammar
  🔒 Reading (bloqueado) ← Se desbloquea al completar Tips
  🔒 Listening (bloqueado) ← Se desbloquea al completar Reading
  🔒 Speaking (bloqueado) ← Se desbloquea al completar Listening
```

## 🔍 Causa Raíz

El problema está en los **`unlock_requirements`** de cada step en la base de datos. Estos campos definen qué steps previos deben estar completados para desbloquear un step.

Si los `unlock_requirements` están vacíos o mal configurados, todos los steps de una categoría se desbloquean al mismo tiempo.

## ✅ Solución Implementada

### 1. Script de Verificación

Creado script para **verificar** el estado actual de los `unlock_requirements`:

```bash
npm run check-unlocks
```

Este script muestra:
- Todos los steps agrupados por categoría
- Los `unlock_requirements` actuales de cada step
- Recomendaciones para configuración correcta

### 2. Script de Corrección

Creado script para **corregir automáticamente** los `unlock_requirements`:

```bash
npm run fix-unlocks
```

Este script aplica la siguiente lógica:

#### Reglas de Desbloqueo:

1. **Primer step de la primera categoría** (Vocabulary de "Presentarse y presentar a otros"):
   - `unlock_requirements: []` (sin requisitos, siempre desbloqueado)

2. **Primer step de las demás categorías** (Vocabulary de cada categoría):
   - `unlock_requirements: [N]` donde N es el `order` del último step de la categoría anterior
   - Ejemplo: Vocabulary de categoría 2 requiere completar Speaking de categoría 1

3. **Demás steps dentro de cada categoría**:
   - `unlock_requirements: [N-1]` donde N-1 es el `order` del step inmediatamente anterior
   - Ejemplo: Grammar requiere Vocabulary, Tips requiere Grammar, etc.

### Ejemplo Concreto:

Supongamos que tenemos:

**Categoría 1: "Presentarse y presentar a otros" (orders 1-6)**
```javascript
{ order: 1, type: 'vocabulary', unlock_requirements: [] }           // Sin requisitos
{ order: 2, type: 'grammar',    unlock_requirements: [1] }          // Requiere vocabulary
{ order: 3, type: 'tips',       unlock_requirements: [2] }          // Requiere grammar
{ order: 4, type: 'reading',    unlock_requirements: [3] }          // Requiere tips
{ order: 5, type: 'listening',  unlock_requirements: [4] }          // Requiere reading
{ order: 6, type: 'speaking',   unlock_requirements: [5] }          // Requiere listening
```

**Categoría 2: "Hablar de donde eres" (orders 7-12)**
```javascript
{ order: 7,  type: 'vocabulary', unlock_requirements: [6] }         // Requiere speaking de cat. 1
{ order: 8,  type: 'grammar',    unlock_requirements: [7] }         // Requiere vocabulary de cat. 2
{ order: 9,  type: 'tips',       unlock_requirements: [8] }         // Requiere grammar de cat. 2
{ order: 10, type: 'reading',    unlock_requirements: [9] }         // Requiere tips de cat. 2
{ order: 11, type: 'listening',  unlock_requirements: [10] }        // Requiere reading de cat. 2
{ order: 12, type: 'speaking',   unlock_requirements: [11] }        // Requiere listening de cat. 2
```

## 🔧 Cómo Funciona el Sistema

### 1. Verificación de Desbloqueo (`isStepUnlockedByOrders`)

```typescript
private isStepUnlockedByOrders(step: any, completedOrders: Set<number>): boolean {
  // Si no tiene requisitos, está desbloqueado
  if (!step.unlock_requirements || step.unlock_requirements.length === 0) {
    return true;
  }

  // Verificar que TODOS los requisitos estén completados
  return step.unlock_requirements.every((reqOrder: number) =>
    completedOrders.has(reqOrder)
  );
}
```

**Ejemplo:**
- Step con `order: 8` y `unlock_requirements: [7]`
- Se desbloquea solo cuando el step con `order: 7` está completado
- Si `completedOrders` contiene `[1, 2, 3, 4, 5, 6, 7]` → ✅ Desbloqueado
- Si `completedOrders` contiene `[1, 2, 3, 4, 5, 6]` → 🔒 Bloqueado

### 2. Desbloqueo Automático (`unlockNextSteps`)

Cuando completas un step:

1. Se marca como `completed` en `user_progress`
2. Se ejecuta `unlockNextSteps` que:
   - Obtiene todos los steps
   - Verifica cuáles tienen sus requisitos cumplidos
   - Crea/actualiza registros en `user_progress` con estado `in_progress`

```typescript
private async unlockNextSteps(userId: string, completedStepId: string): Promise<string[]> {
  // Obtener steps completados por el usuario
  const completedOrders = new Set<number>();
  // ... llenar completedOrders ...

  // Buscar steps que ahora se pueden desbloquear
  for (const step of allSteps) {
    const allRequirementsMet = step.unlock_requirements.every((reqOrder: number) => {
      return completedOrders.has(reqOrder);
    });

    if (allRequirementsMet) {
      await this.userProgressService.unlockStep(userId, step._id.toString());
      unlockedStepIds.push(step._id.toString());
    }
  }

  return unlockedStepIds;
}
```

## 📋 Pasos para Aplicar el Fix

### 1. Verificar el estado actual

```bash
cd /Users/nicolas/Desktop/ENGLISH_APP/micro-english
npm run check-unlocks
```

Esto te mostrará cómo están configurados actualmente los `unlock_requirements`.

### 2. Aplicar la corrección

```bash
npm run fix-unlocks
```

Este script:
- ✅ Configura automáticamente todos los `unlock_requirements`
- ✅ Aplica la lógica de desbloqueo secuencial
- ✅ Muestra un resumen de los cambios realizados

### 3. Limpiar progreso de usuario (opcional)

Si ya tienes progreso guardado que está "mal desbloqueado", puedes:

**Opción A: Eliminar progreso de steps que no deberían estar desbloqueados**

```javascript
// En MongoDB Compass o mongo shell
db.user_progress.deleteMany({
  userId: ObjectId("TU_USER_ID"),
  status: { $in: ["locked", "in_progress"] },
  stepId: { $in: [
    // IDs de los steps que no deberían estar desbloqueados
  ]}
})
```

**Opción B: Reiniciar todo el progreso del usuario** (⚠️ cuidado)

```javascript
db.user_progress.deleteMany({
  userId: ObjectId("TU_USER_ID")
})
```

### 4. Reiniciar el servidor backend

```bash
npm run start:dev
```

### 5. Probar en la app

1. Abre la app móvil
2. Ve a una categoría
3. Completa el primer step (vocabulary)
4. Verifica que solo se desbloquee el siguiente step (grammar)
5. Completa grammar
6. Verifica que solo se desbloquee tips
7. Y así sucesivamente...

## 🎯 Resultado Esperado

Después de aplicar el fix:

### ✅ Dentro de una categoría:
```
📚 Vocabulary (desbloqueado por defecto)
   ↓ Completar
🔓 Grammar (se desbloquea)
   ↓ Completar
🔓 Tips (se desbloquea)
   ↓ Completar
🔓 Reading (se desbloquea)
   ↓ Completar
🔓 Listening (se desbloquea)
   ↓ Completar
🔓 Speaking (se desbloquea)
```

### ✅ Entre categorías:
```
Categoría 1: "Presentarse y presentar a otros"
  ✅ Todos completados
     ↓ Al completar el último
  🔓 Categoría 2 se desbloquea

Categoría 2: "Hablar de donde eres"
  🔓 Vocabulary (solo este desbloqueado)
  🔒 Grammar (bloqueado hasta completar vocabulary)
  🔒 Tips (bloqueado hasta completar grammar)
  🔒 ... (todos los demás bloqueados)
```

## 🔍 Verificación en MongoDB

### Ver unlock_requirements de todos los steps:

```javascript
db.learning_steps.find(
  { is_active: true },
  { title: 1, type: 1, order: 1, unlock_requirements: 1 }
).sort({ order: 1 })
```

### Ver progreso de un usuario:

```javascript
db.user_progress.aggregate([
  {
    $match: { userId: ObjectId("TU_USER_ID") }
  },
  {
    $lookup: {
      from: "learning_steps",
      localField: "stepId",
      foreignField: "_id",
      as: "step"
    }
  },
  {
    $unwind: "$step"
  },
  {
    $project: {
      status: 1,
      score: 1,
      "step.title": 1,
      "step.type": 1,
      "step.order": 1
    }
  },
  {
    $sort: { "step.order": 1 }
  }
])
```

## 🚨 Importante

- Los `unlock_requirements` usan **números de `order`**, no `_id` de steps
- El `order` debe ser único y secuencial para cada step
- Si agregas nuevos steps, asegúrate de configurar correctamente sus `unlock_requirements`
- El script `fix-unlocks` es **idempotente**: puedes ejecutarlo múltiples veces sin problemas

## 📚 Comandos Útiles

```bash
# Verificar configuración actual
npm run check-unlocks

# Corregir unlock_requirements
npm run fix-unlocks

# Limpiar duplicados en user_progress (del fix anterior)
npm run clean-duplicates
```

## 🎓 Ejemplo Completo de Flujo

1. Usuario empieza en Categoría 1
2. Completa Vocabulary → Grammar se desbloquea
3. Completa Grammar → Tips se desbloquea
4. Completa Tips → Reading se desbloquea
5. Completa Reading → Listening se desbloquea
6. Completa Listening → Speaking se desbloquea
7. Completa Speaking → **Vocabulary de Categoría 2 se desbloquea**
8. Completa Vocabulary de Cat. 2 → Grammar de Cat. 2 se desbloquea
9. Y así sucesivamente...

## 💡 Recomendaciones

1. **Siempre ejecuta `check-unlocks` antes de `fix-unlocks`** para ver qué va a cambiar
2. **Haz backup de la base de datos** antes de ejecutar scripts de corrección
3. **Prueba con un usuario de prueba** antes de aplicar en producción
4. Si agregas nuevas categorías o steps, ejecuta `fix-unlocks` para configurar automáticamente los requisitos

