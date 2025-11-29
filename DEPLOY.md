# 🚀 Guía de Deploy en Render

## Configuración en Render Dashboard

### 1. Crear un nuevo Web Service

1. Ve a tu dashboard de Render
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub: `nicolascaliari/micro-english`

### 2. Configurar el servicio

#### Configuración Básica:
- **Name**: `micro-english-api` (o el nombre que prefieras)
- **Region**: Elige la región más cercana a tus usuarios
- **Branch**: `main`
- **Root Directory**: Dejar vacío (raíz del proyecto)

#### Build & Deploy:

**Build Command** (usa esta opción):
```bash
npm install && ./node_modules/.bin/nest build
```

O si prefieres usar el script de package.json:
```bash
npm install && npm run build
```

Si ninguna de las anteriores funciona, compila directamente con TypeScript:
```bash
npm install && npx tsc -p tsconfig.build.json
```

**Start Command**: 
```bash
npm run start:prod
```

#### ⚠️ Variable NODE_ENV durante el Build:
- **NO configures** `NODE_ENV=production` en las variables de entorno ANTES del build
- Render configurará `NODE_ENV=production` automáticamente cuando ejecute el start command
- Si configuras `NODE_ENV=production` antes, npm no instalará devDependencies y el build fallará

### 3. Variables de Entorno

Agrega estas variables de entorno en **Environment**:

| Key | Value | Descripción |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Entorno de producción |
| `PORT` | Dejar vacío | Render lo asigna automáticamente |
| `MONGODB_URI` | `mongodb+srv://...` | Tu URI de MongoDB Atlas |

⚠️ **Importante**: 
- La variable `PORT` debe estar vacía para que Render la asigne automáticamente.
- `NODE_ENV=production` solo para el runtime, NO durante el build.

### 4. Plan y Desplegar

- Selecciona el plan (Free tier está bien para empezar)
- Click en **"Create Web Service"**
- Espera a que termine el build y deploy

## 🔧 Cambios Realizados para el Deploy

### 1. Scripts optimizados (`package.json`)
- `start`: Ahora ejecuta el código compilado con más memoria
- `start:prod`: Configurado para producción con límite de memoria aumentado
- `build`: Usa `npx nest build` para asegurar que encuentre el CLI

### 2. Puerto configurado (`src/main.ts`)
- La aplicación ahora escucha en `0.0.0.0` para ser accesible desde Render
- Usa la variable de entorno `PORT` automáticamente

### 3. Archivo de configuración (`render.yaml`)
- Configuración opcional si prefieres usar infraestructura como código
- Puedes ignorarlo si configuras manualmente en el dashboard

## ⚠️ Solución de Problemas

### Error: "nest: not found" o "could not determine executable to run"
✅ **Solución**: El problema es que Render no instala devDependencies durante el build.

**Build Command que DEBES usar**:
```bash
npm install && npm run build
```

**IMPORTANTE**: 
1. Verifica que NO tengas `NODE_ENV=production` configurada ANTES del build (solo después)
2. Si aún falla, usa la ruta completa:
```bash
npm install && ./node_modules/.bin/nest build
```

3. O compila directamente con TypeScript (si todo lo demás falla):
```bash
npm install && npm run build:tsc
```

### Error de Memoria (Heap Out of Memory)
✅ **Resuelto**: Los scripts ahora usan `--max-old-space-size=2048` para aumentar la memoria disponible.

### Puerto no detectado
✅ **Resuelto**: La app ahora escucha en `0.0.0.0` y muestra logs que Render puede detectar.

### Build Falla
- Verifica que Node.js 20 esté disponible (definido en `.nvmrc`)
- Asegúrate de que todas las dependencias estén en `package.json`
- Revisa los logs de build en Render para errores específicos
- Usa `npm ci` en lugar de `npm install` para builds más confiables

### La aplicación no inicia
- Verifica que `MONGODB_URI` esté configurada correctamente
- Revisa los logs en tiempo real en el dashboard de Render
- Asegúrate de que el build se completó exitosamente

## 📝 Notas Importantes

1. **Primera vez**: El primer deploy puede tardar 5-10 minutos
2. **Builds subsecuentes**: Los siguientes deploys son más rápidos (solo cambia lo modificado)
3. **Logs**: Puedes ver logs en tiempo real en el dashboard de Render
4. **Health Check**: Render verificará que la app responda en el puerto asignado
5. **devDependencies**: Durante el build, Render necesita las devDependencies (como @nestjs/cli y TypeScript). Usa `npm ci` que las instala por defecto.

## 🔗 Verificar el Deploy

Una vez desplegado, tu API estará disponible en:
```
https://micro-english-api.onrender.com
```

Puedes probar con:
```bash
curl https://micro-english-api.onrender.com
```

## 📚 Recursos

- [Documentación de Render](https://render.com/docs)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
