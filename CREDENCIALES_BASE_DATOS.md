# Credenciales de Base de Datos - Chasap

## 📊 Resumen Rápido

| Elemento | Valor | Origen |
|----------|-------|--------|
| **Nombre de BD** | `{instancia_add}` | Lo ingresas tú durante instalación |
| **Usuario de BD** | `{instancia_add}` | Mismo que nombre de BD |
| **Contraseña de BD** | `{mysql_root_password}` | Lo ingresas tú durante instalación |
| **Host** | `localhost` | Fijo |
| **Puerto** | `5432` | PostgreSQL por defecto |
| **Dialect** | `postgres` | Fijo |

## 🔍 Explicación Detallada

### 1. Durante la Instalación

Cuando ejecutas `sudo ./setup`, el instalador te pide:

#### Paso 1: Contraseña
```
💻 Ingresa la CONTRASEÑA para el usuario Deploy y la base de datos
(No utilizar caracteres especiales):

> TU_CONTRASEÑA_AQUI
```

**Esta contraseña se usa para**:
- ✅ Usuario `deploy` del sistema
- ✅ Base de datos PostgreSQL
- ✅ Redis

**Validación**: Solo letras y números (a-z, A-Z, 0-9)

**Variable**: `mysql_root_password` (nombre heredado, pero se usa para PostgreSQL)

#### Paso 2: Nombre de Instancia
```
💻 Proporciona un nombre para Instancia/Empresa que se instalará
(No utilizar espacios ni caracteres especiales, usa solo letras minúsculas):

> TU_INSTANCIA_AQUI
```

**Ejemplos válidos**:
- `empresa1`
- `chasap01`
- `miempresa`
- `test123`

**Validación**: Solo letras minúsculas y números (a-z, 0-9)

**Variable**: `instancia_add`

### 2. Creación de la Base de Datos

El script ejecuta (en `backend_redis_create()`):

```sql
CREATE DATABASE {instancia_add};
CREATE USER {instancia_add} WITH SUPERUSER INHERIT CREATEDB CREATEROLE;
ALTER USER {instancia_add} PASSWORD '{mysql_root_password}';
GRANT ALL PRIVILEGES ON DATABASE {instancia_add} TO {instancia_add};
```

**Ejemplo real**:
Si ingresaste:
- Contraseña: `MiPass123`
- Instancia: `empresa1`

Se crea:
```sql
CREATE DATABASE empresa1;
CREATE USER empresa1 WITH SUPERUSER INHERIT CREATEDB CREATEROLE;
ALTER USER empresa1 PASSWORD 'MiPass123';
GRANT ALL PRIVILEGES ON DATABASE empresa1 TO empresa1;
```

### 3. Configuración en `.env`

El archivo `.env` del backend se crea con (líneas 79-84 de `_backend.sh`):

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER={instancia_add}
DB_PASS={mysql_root_password}
DB_NAME={instancia_add}
```

**Ejemplo real**:
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=empresa1
DB_PASS=MiPass123
DB_NAME=empresa1
```

## 🔐 Credenciales Completas del Sistema

### Base de Datos PostgreSQL

```
Host:     localhost
Puerto:   5432
Base de datos: {tu_instancia}
Usuario:  {tu_instancia}
Contraseña: {tu_contraseña}
```

### Redis

```
Host:     127.0.0.1
Puerto:   {redis_port}  (lo ingresas durante instalación, ej: 5000)
Contraseña: {tu_contraseña}  (la misma que PostgreSQL)
```

### Usuario del Sistema

```
Usuario:  deploy
Contraseña: {tu_contraseña}  (la misma que PostgreSQL)
```

### Aplicación Web

```
URL:      https://{tu_frontend_url}
Email:    admin@admin.com
Contraseña: 123456  (cambiar después del primer login)
```

## 📝 Ejemplos Completos

### Ejemplo 1: Instalación Simple

**Datos ingresados**:
- Contraseña: `Chasap2024`
- Instancia: `miempresa`
- Redis port: `5000`

**Credenciales resultantes**:

**PostgreSQL**:
```
Nombre BD: miempresa
Usuario:   miempresa
Contraseña: Chasap2024
```

**Redis**:
```
Puerto:    5000
Contraseña: Chasap2024
```

**Archivo .env**:
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=miempresa
DB_PASS=Chasap2024
DB_NAME=miempresa

REDIS_URI=redis://:Chasap2024@127.0.0.1:5000
```

### Ejemplo 2: Múltiples Instancias

Si instalas varias instancias en el mismo servidor:

**Instancia 1**:
```
Contraseña: Pass123
Instancia: empresa1
Redis port: 5001
```

**Instancia 2**:
```
Contraseña: Pass456
Instancia: empresa2
Redis port: 5002
```

**Resultado**:
- BD `empresa1` con usuario `empresa1` y contraseña `Pass123`
- BD `empresa2` con usuario `empresa2` y contraseña `Pass456`
- Redis en puerto 5001 con contraseña `Pass123`
- Redis en puerto 5002 con contraseña `Pass456`

## 🔍 Verificar Credenciales

### Verificar PostgreSQL

```bash
# Conectar a la base de datos
sudo -u postgres psql -d {instancia}

# O con usuario específico
psql -h localhost -p 5432 -U {instancia} -d {instancia}
# Pedirá la contraseña

# Listar todas las bases de datos
sudo -u postgres psql -c "\l"

# Ver usuarios
sudo -u postgres psql -c "\du"
```

### Verificar Redis

```bash
# Conectar a Redis
sudo docker exec -it redis-{instancia} redis-cli -a {contraseña}

# Probar conexión
sudo docker exec -it redis-{instancia} redis-cli -a {contraseña} ping
# Debe responder: PONG
```

### Ver Credenciales del .env

```bash
# Ver archivo .env completo
cat /home/deploy/{instancia}/backend/.env

# Ver solo credenciales de BD
grep "DB_" /home/deploy/{instancia}/backend/.env
```

## 🛡️ Seguridad

### Buenas Prácticas

1. **Contraseña fuerte**: Mínimo 12 caracteres
   ```
   ❌ Débil:  pass123
   ✅ Fuerte: MiChasap2024Seguro
   ```

2. **No reutilizar contraseñas**: Usa contraseñas diferentes para cada instancia

3. **Cambiar contraseña de admin**: Inmediatamente después del primer login

4. **Backup de credenciales**: Guarda las credenciales en un gestor de contraseñas

### Cambiar Contraseña de BD (si es necesario)

```bash
# Conectar como postgres
sudo -u postgres psql

# Cambiar contraseña del usuario
ALTER USER {instancia} PASSWORD 'nueva_contraseña';

# Salir
\q

# Actualizar .env
nano /home/deploy/{instancia}/backend/.env
# Cambiar DB_PASS=nueva_contraseña

# Reiniciar backend
pm2 restart {instancia}-backend
```

## 📋 Resumen Visual

```
┌─────────────────────────────────────────────────┐
│  INSTALACIÓN CHASAP                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  Pregunta 1: Contraseña                         │
│  ├─ Ingresas: "MiPass123"                       │
│  └─ Se usa para:                                │
│     ├─ PostgreSQL password                      │
│     ├─ Redis password                           │
│     └─ Usuario deploy                           │
│                                                 │
│  Pregunta 2: Nombre de Instancia                │
│  ├─ Ingresas: "empresa1"                        │
│  └─ Se usa para:                                │
│     ├─ Nombre de BD: empresa1                   │
│     ├─ Usuario de BD: empresa1                  │
│     ├─ Nombre de contenedor Redis               │
│     └─ Nombre de procesos PM2                   │
│                                                 │
├─────────────────────────────────────────────────┤
│  RESULTADO                                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  PostgreSQL:                                    │
│  ├─ Base de datos: empresa1                     │
│  ├─ Usuario: empresa1                           │
│  └─ Contraseña: MiPass123                       │
│                                                 │
│  Redis:                                         │
│  ├─ Contenedor: redis-empresa1                  │
│  └─ Contraseña: MiPass123                       │
│                                                 │
│  Aplicación Web:                                │
│  ├─ Email: admin@admin.com                      │
│  └─ Contraseña: 123456 (cambiar!)               │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🆘 Problemas Comunes

### No recuerdo mi contraseña

```bash
# Ver contraseña en .env
cat /home/deploy/{instancia}/backend/.env | grep DB_PASS

# O cambiarla
sudo -u postgres psql -c "ALTER USER {instancia} PASSWORD 'nueva_pass';"
nano /home/deploy/{instancia}/backend/.env  # Actualizar DB_PASS
pm2 restart {instancia}-backend
```

### No recuerdo el nombre de mi instancia

```bash
# Listar bases de datos
sudo -u postgres psql -c "\l"

# Ver procesos PM2
pm2 list

# Ver carpetas en /home/deploy
ls -la /home/deploy/
```

---

**Nota**: La variable se llama `mysql_root_password` por razones históricas (el proyecto originalmente usaba MySQL), pero ahora se usa para PostgreSQL.
