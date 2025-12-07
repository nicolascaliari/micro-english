# Migración del Sistema de Categorías

## 1. Crear Categorías Iniciales

```javascript
// Conectarse a MongoDB y ejecutar:
db.categories.insertMany([
  {
    _id: ObjectId("673d9f8e123456789abcdef0"),
    name: "Presentarse y presentar a otros",
    order: 0,
    slug: "presentarse-y-presentar-a-otros",
    description: "Aprende a presentarte y presentar a otras personas",
    emoji: "👋",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("673d9f8e123456789abcdef1"),
    name: "Hablar de donde eres",
    order: 1,
    slug: "hablar-de-donde-eres",
    description: "Aprende a hablar sobre tu país y origen",
    emoji: "🌍",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("673d9f8e123456789abcdef2"),
    name: "Saludos y despedidas",
    order: 2,
    slug: "saludos-y-despedidas",
    description: "Aprende diferentes formas de saludar y despedirte",
    emoji: "👋",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("673d9f8e123456789abcdef3"),
    name: "Números y fechas",
    order: 3,
    slug: "numeros-y-fechas",
    description: "Aprende a usar números y fechas en inglés",
    emoji: "🔢",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
```

## 2. Migrar learning_steps

### Opción A: Si tienes datos con campo `category` (string)

```javascript
// Actualizar learning_steps con categoría "Presentarse y presentar a otros"
db.learning_steps.updateMany(
  { category: "Presentarse y presentar a otros" },
  { 
    $set: { categoryId: ObjectId("673d9f8e123456789abcdef0") },
    $unset: { category: "", category_order: "" }
  }
);

// Actualizar learning_steps con categoría "Hablar de donde eres"
db.learning_steps.updateMany(
  { category: "Hablar de donde eres" },
  { 
    $set: { categoryId: ObjectId("673d9f8e123456789abcdef1") },
    $unset: { category: "", category_order: "" }
  }
);
```

### Opción B: Si no tienes el campo `category` aún

```javascript
// Asignar categoryId por defecto a todos los learning_steps
db.learning_steps.updateMany(
  { categoryId: { $exists: false } },
  { $set: { categoryId: ObjectId("673d9f8e123456789abcdef0") } }
);

// O asignar manualmente por order:
// Pasos 1-5 → Categoría 1
db.learning_steps.updateMany(
  { order: { $gte: 1, $lte: 5 } },
  { $set: { categoryId: ObjectId("673d9f8e123456789abcdef0") } }
);

// Pasos 6-10 → Categoría 2
db.learning_steps.updateMany(
  { order: { $gte: 6, $lte: 10 } },
  { $set: { categoryId: ObjectId("673d9f8e123456789abcdef1") } }
);
```

## 3. Migrar vocabulary

```javascript
// Asignar categoryId según tags o contenido
db.vocabulary.updateMany(
  { tags: { $in: ["greeting", "introduction", "basic", "personal"] } },
  { $set: { categoryId: ObjectId("673d9f8e123456789abcdef0") } }
);

db.vocabulary.updateMany(
  { tags: { $in: ["countries", "nationalities", "places", "geography"] } },
  { $set: { categoryId: ObjectId("673d9f8e123456789abcdef1") } }
);

db.vocabulary.updateMany(
  { tags: { $in: ["greetings", "goodbye", "farewell"] } },
  { $set: { categoryId: ObjectId("673d9f8e123456789abcdef2") } }
);

db.vocabulary.updateMany(
  { tags: { $in: ["numbers", "dates", "time", "calendar"] } },
  { $set: { categoryId: ObjectId("673d9f8e123456789abcdef3") } }
);

// Para palabras sin categoría, asignar una por defecto
db.vocabulary.updateMany(
  { categoryId: { $exists: false } },
  { $set: { categoryId: ObjectId("673d9f8e123456789abcdef0") } }
);
```

## 4. Migrar grammar_topics

```javascript
// Asignar categoryId según el campo category (string) si existe
db.grammar_topics.updateMany(
  { category: { $regex: /verb to be|pronouns|personal/i } },
  { 
    $set: { categoryId: ObjectId("673d9f8e123456789abcdef0") },
    $unset: { category: "" }
  }
);

db.grammar_topics.updateMany(
  { category: { $regex: /prepositions|countries|nationalities/i } },
  { 
    $set: { categoryId: ObjectId("673d9f8e123456789abcdef1") },
    $unset: { category: "" }
  }
);

db.grammar_topics.updateMany(
  { title: { $regex: /presente simple|present simple|greetings/i } },
  { 
    $set: { categoryId: ObjectId("673d9f8e123456789abcdef0") },
    $unset: { category: "" }
  }
);

// Para topics sin categoría, asignar una por defecto
db.grammar_topics.updateMany(
  { categoryId: { $exists: false } },
  { 
    $set: { categoryId: ObjectId("673d9f8e123456789abcdef0") },
    $unset: { category: "" }
  }
);
```

## 5. Verificar Migración

```javascript
// Verificar que todos los learning_steps tienen categoryId
db.learning_steps.countDocuments({ categoryId: { $exists: false } });
// Debe retornar: 0

// Verificar que todos los vocabulary tienen categoryId
db.vocabulary.countDocuments({ categoryId: { $exists: false } });
// Debe retornar: 0

// Verificar que todos los grammar_topics tienen categoryId
db.grammar_topics.countDocuments({ categoryId: { $exists: false } });
// Debe retornar: 0

// Ver distribución de categorías en learning_steps
db.learning_steps.aggregate([
  { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
  { $unwind: "$category" },
  { $project: { categoryName: "$category.name", count: 1 } }
]);
```

## 6. Rollback (si es necesario)

```javascript
// Si algo sale mal, puedes revertir los cambios:

// Restaurar learning_steps
db.learning_steps.updateMany(
  {},
  { $unset: { categoryId: "" } }
);

// Restaurar vocabulary
db.vocabulary.updateMany(
  {},
  { $unset: { categoryId: "" } }
);

// Restaurar grammar_topics
db.grammar_topics.updateMany(
  {},
  { $unset: { categoryId: "" } }
);

// Eliminar categorías
db.categories.deleteMany({});
```

## Notas Importantes

1. **Backup**: Antes de ejecutar cualquier migración, haz un backup de tu base de datos:
   ```bash
   mongodump --uri="tu-connection-string" --out=backup-$(date +%Y%m%d)
   ```

2. **Orden de ejecución**: Ejecuta los scripts en este orden:
   - Crear categorías
   - Migrar learning_steps
   - Migrar vocabulary
   - Migrar grammar_topics
   - Verificar migración

3. **IDs personalizados**: Los ObjectIds en este script son ejemplos. Puedes usar los que MongoDB genere automáticamente o especificar los tuyos.

4. **Categorías adicionales**: Puedes agregar más categorías según tus necesidades. Solo asegúrate de actualizar el campo `order` correctamente.

