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
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  npm run start:prod
  ```

### 3. Variables de Entorno

Agrega estas variables de entorno en **Environment**:

| Key | Value | Descripción |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Entorno de producción |
| `PORT` | Dejar vacío | Render lo asigna automáticamente |
| `MONGODB_URI` | `mongodb+srv://...` | Tu URI de MongoDB Atlas |

⚠️ **Importante**: La variable `PORT` debe estar vacía para que Render la asigne automáticamente.

### 4. Plan y Desplegar

- Selecciona el plan (Free tier está bien para empezar)
- Click en **"Create Web Service"**
- Espera a que termine el build y deploy

## 🔧 Cambios Realizados para el Deploy

### 1. Scripts optimizados (`package.json`)
- `start`: Ahora ejecuta el código compilado con más memoria
- `start:prod`: Configurado para producción con límite de memoria aumentado

### 2. Puerto configurado (`src/main.ts`)
- La aplicación ahora escucha en `0.0.0.0` para ser accesible desde Render
- Usa la variable de entorno `PORT` automáticamente

### 3. Archivo de configuración (`render.yaml`)
- Configuración opcional si prefieres usar infraestructura como código
- Puedes ignorarlo si configuras manualmente en el dashboard

## ⚠️ Solución de Problemas

### Error de Memoria (Heap Out of Memory)
✅ **Resuelto**: Los scripts ahora usan `--max-old-space-size=2048` para aumentar la memoria disponible.

### Puerto no detectado
✅ **Resuelto**: La app ahora escucha en `0.0.0.0` y muestra logs que Render puede detectar.

### Build Falla
- Verifica que Node.js 20 esté disponible (definido en `.nvmrc`)
- Asegúrate de que todas las dependencias estén en `package.json`
- Revisa los logs de build en Render para errores específicos

### La aplicación no inicia
- Verifica que `MONGODB_URI` esté configurada correctamente
- Revisa los logs en tiempo real en el dashboard de Render
- Asegúrate de que el build se completó exitosamente

## 📝 Notas Importantes

1. **Primera vez**: El primer deploy puede tardar 5-10 minutos
2. **Builds subsecuentes**: Los siguientes deploys son más rápidos (solo cambia lo modificado)
3. **Logs**: Puedes ver logs en tiempo real en el dashboard de Render
4. **Health Check**: Render verificará que la app responda en el puerto asignado

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

