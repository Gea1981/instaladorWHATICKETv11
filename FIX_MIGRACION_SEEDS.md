# Fix para Migración y Seeds - Chasap v2.0

## Problema Identificado

Durante la instalación, la migración y los seeds fallan porque:

1. Los archivos de seeds están en TypeScript (`.ts`)
2. Sequelize busca archivos compilados (`.js`) en `dist/database/seeds/`
3. El instalador ejecuta `npx sequelize db:seed:all` directamente

## Solución Aplicada

### 1. Actualizado `install-vps/lib/_backend.sh`

**Cambio en `backend_db_seed()`** (línea 240-253):

**Antes**:
```bash
npx sequelize db:seed:all
```

**Después**:
```bash
npm run db:seed
```

Esto usa el script definido en `package.json` que ejecuta correctamente los seeds compilados.

### 2. Verificar Configuración de Sequelize

El archivo `.sequelizerc` debe apuntar a las rutas compiladas:

```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('dist', 'config', 'database.js'),
  'models-path': path.resolve('dist', 'models'),
  'seeders-path': path.resolve('dist', 'database', 'seeds'),
  'migrations-path': path.resolve('dist', 'database', 'migrations')
};
```

## Pasos para Aplicar el Fix

### Si ya instalaste y falló:

```bash
# Conectar al servidor
ssh deploy@tu-servidor

# Ir al directorio del backend
cd /home/deploy/{instancia}/backend

# Asegurarse de que está compilado
npm run build

# Ejecutar migración manualmente
npx sequelize db:migrate

# Ejecutar seeds manualmente
npm run db:seed

# Reiniciar backend
pm2 restart {instancia}-backend
```

### Para nueva instalación:

1. Hacer pull del repositorio actualizado:
```bash
cd instaladorWHATICKETv11
git pull origin main
```

2. Ejecutar instalador normalmente:
```bash
cd install-vps
sudo ./setup
```

## Verificación

Después de aplicar el fix, verifica:

```bash
# Ver logs del backend
pm2 logs {instancia}-backend

# Verificar que existen datos en la BD
sudo -u postgres psql -d {instancia} -c "SELECT * FROM \"Companies\";"
sudo -u postgres psql -d {instancia} -c "SELECT * FROM \"Users\";"
```

Deberías ver:
- 1 Company (Empresa 1)
- 1 User (admin@admin.com)
- 1 Plan (Plano 1)

## Credenciales por Defecto

Después del seed exitoso:
- **Email**: admin@admin.com
- **Contraseña**: 123456

⚠️ **Cambiar inmediatamente después del primer login**

## Notas Adicionales

- La migración `20251126141044-add-columns-to-whatsapp.js` agrega las columnas necesarias para multicanal
- Los seeds crean la estructura básica: Company, Plan, User, Settings
- Si los seeds fallan, la aplicación no tendrá datos iniciales pero funcionará

## Soporte

Si el problema persiste:
1. Verificar logs: `pm2 logs {instancia}-backend`
2. Verificar que PostgreSQL está corriendo: `sudo systemctl status postgresql`
3. Verificar conexión a BD en `.env`
