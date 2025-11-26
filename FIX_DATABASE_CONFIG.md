# Fix: Error de Configuración de Base de Datos

## Problema

Durante la ejecución de migraciones y seeds, aparece el error:

```
ERROR: Error reading "dist/config/database.js"
[ERR_MODULE_NOT_FOUND]: Cannot find module '/home/deploy/hss/backend/dist/bootstrap'
imported from /home/deploy/hss/backend/dist/config/database.js
```

![Error Screenshot](C:/Users/SOPORTE/.gemini/antigravity/brain/af508bd1-92b4-4ac0-9fa1-be5d31470212/uploaded_image_1764185278050.png)

## Causa

El archivo `src/config/database.ts` tenía:
```typescript
import "../bootstrap";  // ← Este import causaba el error
```

Cuando TypeScript compila a JavaScript, genera:
```javascript
require("../bootstrap");  // ← Busca dist/bootstrap.js que no existe
```

## Solución Aplicada

### Archivo Modificado
**`backend/src/config/database.ts`**

**Antes**:
```typescript
import "../bootstrap";

module.exports = {
  dialect: process.env.DB_DIALECT || "mysql",
  port: process.env.DB_PORT || 3306,
  // ...
};
```

**Después**:
```typescript
require("dotenv").config();

module.exports = {
  dialect: process.env.DB_DIALECT || "postgres",
  port: process.env.DB_PORT || 5432,
  // ...
};
```

### Cambios Realizados

1. ✅ Removido `import "../bootstrap"`
2. ✅ Agregado `require("dotenv").config()` para cargar variables de entorno
3. ✅ Cambiado dialect por defecto de `mysql` a `postgres`
4. ✅ Cambiado puerto por defecto de `3306` a `5432` (PostgreSQL)

## Aplicar el Fix

### Opción 1: Actualizar desde GitHub (Recomendado)

```bash
# Conectar al servidor
ssh deploy@tu-servidor

# Ir al directorio de la aplicación
cd /home/deploy/{instancia}

# Detener backend
pm2 stop {instancia}-backend

# Actualizar código
git pull origin main

# Recompilar
cd backend
npm run build

# Ejecutar migraciones
npx sequelize db:migrate

# Ejecutar seeds
npm run db:seed

# Reiniciar
pm2 restart {instancia}-backend
```

### Opción 2: Aplicar Manualmente

```bash
# Conectar al servidor
ssh deploy@tu-servidor

# Editar archivo
nano /home/deploy/{instancia}/backend/src/config/database.ts
```

Reemplazar la primera línea:
```typescript
// Cambiar esto:
import "../bootstrap";

// Por esto:
require("dotenv").config();
```

Y ajustar dialect y puerto:
```typescript
// Cambiar:
dialect: process.env.DB_DIALECT || "mysql",
port: process.env.DB_PORT || 3306,

// Por:
dialect: process.env.DB_DIALECT || "postgres",
port: process.env.DB_PORT || 5432,
```

Luego recompilar:
```bash
cd /home/deploy/{instancia}/backend
npm run build
npx sequelize db:migrate
npm run db:seed
pm2 restart {instancia}-backend
```

## Verificación

Después de aplicar el fix:

```bash
# Verificar que la migración funciona
cd /home/deploy/{instancia}/backend
npx sequelize db:migrate

# Deberías ver:
# ✓ Migraciones ejecutadas correctamente

# Verificar seeds
npm run db:seed

# Deberías ver:
# ✓ Seeds ejecutados correctamente

# Verificar datos en BD
sudo -u postgres psql -d {instancia} -c "SELECT * FROM \"Companies\";"
sudo -u postgres psql -d {instancia} -c "SELECT * FROM \"Users\";"
```

## Notas Adicionales

- Este fix ya está incluido en el repositorio actualizado
- Si instalas desde cero con `git clone`, el fix ya estará aplicado
- El archivo `bootstrap.ts` existe pero no se debe importar en `database.ts`
- `dotenv` se encarga de cargar las variables de entorno del `.env`

## Archivos Relacionados

- `backend/src/config/database.ts` - Configuración de Sequelize
- `backend/.sequelizerc` - Configuración de rutas de Sequelize
- `backend/.env` - Variables de entorno (DB_DIALECT, DB_HOST, etc.)

## Soporte

Si el error persiste:
1. Verificar que `.env` tiene las variables correctas
2. Verificar que PostgreSQL está corriendo: `sudo systemctl status postgresql`
3. Verificar logs: `pm2 logs {instancia}-backend`
