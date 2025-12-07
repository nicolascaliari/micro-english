# 🎯 Learning Path API - Documentación

Sistema de laberinto de aprendizaje con desbloqueo progresivo de pasos.

## 📋 Colecciones

### 1. learning_steps
Pasos del laberinto de aprendizaje.

### 2. user_progress  
Progreso del usuario en cada paso.

### 3. step_attempts
Intentos del usuario en cada paso.

## 🔌 Endpoints

### Learning Path (Laberinto completo)

#### GET `/learning-path/:userId`
Obtener el laberinto completo con el progreso del usuario.

**Response:**
```json
{
  "steps": [
    {
      "id": "673abc...",
      "title": "Vocabulario Básico",
      "description": "Aprende tus primeras 20 palabras",
      "emoji": "📚",
      "type": "vocabulary",
      "order": 1,
      "color": "#4FC3F7",
      "bg_color": "#E0F7FA",
      "route": "/(tabs)/vocabulary",
      "required_score": 80,
      "status": "completed",
      "score": 85,
      "unlocked": true,
      "attempts_count": 2
    },
    {
      "id": "673def...",
      "title": "Presente Simple",
      "description": "Domina el presente simple",
      "emoji": "✏️",
      "type": "grammar",
      "order": 2,
      "color": "#66BB6A",
      "bg_color": "#E8F5E9",
      "route": "/(tabs)/grammar",
      "required_score": 75,
      "status": "in_progress",
      "score": 0,
      "unlocked": true,
      "attempts_count": 1
    },
    {
      "id": "673ghi...",
      "title": "Tips de Pronunciación",
      "description": "Consejos para mejorar tu pronunciación",
      "emoji": "💡",
      "type": "tips",
      "order": 3,
      "color": "#FFA726",
      "bg_color": "#FFF3E0",
      "route": "/tips",
      "required_score": 0,
      "status": "locked",
      "score": 0,
      "unlocked": false,
      "attempts_count": 0
    }
  ],
  "current_step": "673def..."
}
```

#### POST `/learning-path/:userId/steps/:stepId/start`
Iniciar un paso.

**Response:**
```json
{
  "message": "Step started successfully",
  "attempt_id": "673xyz...",
  "step": {
    "id": "673def...",
    "title": "Presente Simple",
    "description": "Domina el presente simple",
    ...
  }
}
```

**Errores:**
- `400 Bad Request`: El paso está bloqueado

#### POST `/learning-path/:userId/steps/:stepId/complete`
Completar un paso.

**Body:**
```json
{
  "score": 85,
  "total_questions": 10,
  "correct_answers": 8.5
}
```

**Response (Aprobado):**
```json
{
  "passed": true,
  "score": 85,
  "required_score": 80,
  "message": "Step completed successfully!"
}
```

**Response (No aprobado):**
```json
{
  "passed": false,
  "score": 65,
  "required_score": 80,
  "message": "Try again to reach the required score."
}
```

**Lógica de desbloqueo:**
- Si `score >= required_score`:
  - Marca el paso como `completed`
  - Desbloquea automáticamente los siguientes pasos que cumplan requisitos
  - Guarda el intento

#### GET `/learning-path/:userId/current-step`
Obtener el paso actual del usuario (primer paso desbloqueado no completado).

**Response:**
```json
{
  "id": "673def...",
  "title": "Presente Simple",
  "description": "Domina el presente simple",
  "emoji": "✏️",
  "type": "grammar",
  "order": 2,
  "color": "#66BB6A",
  "bg_color": "#E8F5E9",
  "route": "/(tabs)/grammar",
  "required_score": 75,
  "status": "in_progress",
  "score": 0,
  "unlocked": true,
  "attempts_count": 1
}
```

### Learning Steps (CRUD)

#### POST `/learning-steps`
Crear un paso.

#### GET `/learning-steps`
Listar todos los pasos activos (ordenados por `order`).

#### GET `/learning-steps?type=vocabulary`
Filtrar por tipo.

#### GET `/learning-steps/:id`
Obtener un paso por ID.

#### PATCH `/learning-steps/:id`
Actualizar un paso.

#### DELETE `/learning-steps/:id`
Eliminar un paso.

### User Progress

#### GET `/user-progress/user/:userId`
Obtener todo el progreso de un usuario.

#### GET `/user-progress/:userId/:stepId`
Obtener progreso específico.

#### PATCH `/user-progress/:userId/:stepId`
Actualizar progreso manualmente.

### Step Attempts

#### GET `/step-attempts/user/:userId`
Obtener todos los intentos de un usuario.

#### GET `/step-attempts/:userId/:stepId`
Obtener intentos de un paso específico.

#### GET `/step-attempts/:userId/:stepId/stats`
Obtener estadísticas de intentos.

**Response:**
```json
{
  "total_attempts": 3,
  "passed_attempts": 2,
  "best_score": 90,
  "average_score": 78.33,
  "last_attempt": {
    "score": 85,
    "passed": true,
    "completed_at": "2024-11-29T10:30:00Z"
  }
}
```

## 🔐 Lógica de Desbloqueo

### Requisitos
Cada paso tiene `unlock_requirements` (array de IDs de pasos).

### Desbloqueo automático
Cuando un usuario completa un paso con `score >= required_score`:

1. Se marca el paso como `completed`
2. Se buscan todos los pasos que tengan este paso en sus `unlock_requirements`
3. Para cada paso candidato:
   - Se verifica que **todos** sus requisitos estén completados
   - Si sí, se desbloquea automáticamente (status: `in_progress`, `unlocked_at`: now)

### Ejemplo

```
Paso 1: Vocabulario Básico
  - unlock_requirements: []
  - Usuario completa con 85%

Paso 2: Presente Simple
  - unlock_requirements: [1]
  - Se desbloquea automáticamente ✅

Paso 3: Tips
  - unlock_requirements: [1, 2]
  - NO se desbloquea (falta paso 2) ❌

Usuario completa Paso 2 con 80%

Paso 3: Tips
  - unlock_requirements: [1, 2]
  - Ahora ambos están completos
  - Se desbloquea automáticamente ✅

Paso 4: Vocabulario Intermedio
  - unlock_requirements: [1, 2]
  - También se desbloquea ✅
```

## 📊 Estados de Progreso

- `locked`: Paso bloqueado (requisitos no cumplidos)
- `in_progress`: Paso desbloqueado, puede iniciarse
- `completed`: Paso completado con éxito

## 🎨 Tipos de Pasos

- `vocabulary`: Vocabulario
- `grammar`: Gramática
- `tips`: Consejos/Tips
- `reading`: Lectura
- `listening`: Escucha
- `speaking`: Conversación

## 💡 Notas Importantes

1. **Reintentos**: Los usuarios pueden reintentar pasos completados para mejorar su score
2. **Progreso parcial**: Se guarda cada intento, incluso si no se aprueba
3. **Desbloqueo flexible**: Los pasos pueden tener múltiples requisitos (rutas paralelas)
4. **Score requerido**: Cada paso puede tener un `required_score` diferente

## 🚀 Ejemplo de Flujo Completo

```bash
# 1. Usuario obtiene el laberinto
GET /learning-path/user123

# 2. Usuario inicia el primer paso desbloqueado
POST /learning-path/user123/steps/step1/start

# 3. Usuario completa el paso
POST /learning-path/user123/steps/step1/complete
Body: { "score": 85, "total_questions": 10, "correct_answers": 8.5 }

# 4. Sistema desbloquea automáticamente los siguientes pasos

# 5. Usuario obtiene el paso actual
GET /learning-path/user123/current-step

# 6. Usuario ve sus estadísticas
GET /step-attempts/user123/step1/stats
```

