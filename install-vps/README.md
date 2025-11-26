# Instalador Chasap v2.0 - Multicanal

Instalador automatizado para Chasap con soporte multicanal (WhatsApp, Telegram, Instagram, Facebook, VoIP).

## 🌟 Características

- ✅ Instalación automatizada en Ubuntu 20.04+
- ✅ Configuración de Nginx + SSL (Let's Encrypt)
- ✅ PostgreSQL + Redis
- ✅ PM2 para gestión de procesos
- ✅ Soporte multicanal integrado

## 🚀 Instalación Rápida

### Requisitos Previos

1. **Servidor Ubuntu 20.04 o superior**
2. **Dominio configurado** con registros DNS:
   - `backend.tudominio.com` → IP del servidor
   - `frontend.tudominio.com` → IP del servidor
3. **Acceso root** al servidor

### Pasos de Instalación

```bash
# 1. Conectar al servidor
ssh root@tu-servidor

# 2. Clonar el instalador
git clone https://github.com/Gea1981/instaladorWHATICKETv11.git
cd instaladorWHATICKETv11

# 3. Dar permisos de ejecución
chmod +x setup

# 4. Ejecutar instalador
sudo ./setup
```

### Durante la Instalación

El script te pedirá:

1. **Contraseña** - Para usuario deploy y base de datos (solo letras y números)
2. **Nombre de instancia** - Identificador único (ej: `empresa1`)
3. **Límites** - Máximo de usuarios y conexiones
4. **Dominios**:
   - URL del backend (ej: `https://backend.tudominio.com`)
   - URL del frontend (ej: `https://frontend.tudominio.com`)
5. **Email** - Para certificado SSL

## 📋 Lo que Instala

El script instalará automáticamente:

- ✅ Node.js 20.x
- ✅ PostgreSQL (base de datos)
- ✅ Redis (caché y colas)
- ✅ Nginx (proxy reverso)
- ✅ PM2 (gestor de procesos)
- ✅ Certbot (certificados SSL)
- ✅ Docker (para Redis)
- ✅ Dependencias de Puppeteer

## 🔧 Configuración Post-Instalación

### Acceso Inicial

**URL**: `https://frontend.tudominio.com`

**Credenciales por defecto**:
- Usuario: `admin@admin.com`
- Contraseña: `admin`

⚠️ **Cambiar la contraseña inmediatamente después del primer login**

### Configurar Canales

#### WhatsApp
1. Ir a "Conexiones"
2. Crear nueva conexión
3. Escanear código QR con WhatsApp

#### Telegram
1. Crear bot en [@BotFather](https://t.me/BotFather)
2. Copiar el token
3. En "Conexiones", crear nueva de tipo "Telegram"
4. Pegar el token del bot

#### Instagram/Facebook
1. Registrarse en [NotificaMe Hub](https://notificame.com.br)
2. Obtener token de API
3. En Chasap, ir a "Configuraciones"
4. Agregar setting con:
   - Key: `hubToken`
   - Value: `tu-token-de-notificame`
5. Configurar webhook en NotificaMe Hub:
   ```
   https://backend.tudominio.com/hub-webhook/{numero-canal}
   ```

#### VoIP (Asterisk)
Editar archivo `.env` del backend:
```bash
sudo nano /home/deploy/{instancia}/backend/.env
```

Agregar:
```env
AMI_HOST=ip-servidor-asterisk
AMI_PORT=5038
AMI_USER=admin
AMI_PASSWORD=tu-password
```

Reiniciar backend:
```bash
sudo -u deploy pm2 restart {instancia}-backend
```

## 🛠️ Comandos Útiles

### Ver logs
```bash
# Backend
sudo -u deploy pm2 logs {instancia}-backend

# Frontend
sudo -u deploy pm2 logs {instancia}-frontend
```

### Reiniciar servicios
```bash
sudo -u deploy pm2 restart {instancia}-backend
sudo -u deploy pm2 restart {instancia}-frontend
```

### Actualizar aplicación
```bash
cd /home/deploy/{instancia}
sudo -u deploy git pull
cd backend
sudo -u deploy npm install
sudo -u deploy npm run build
sudo -u deploy npx sequelize db:migrate
sudo -u deploy pm2 restart {instancia}-backend
```

### Ver estado de servicios
```bash
sudo -u deploy pm2 status
```

## 📁 Estructura de Archivos

```
/home/deploy/{instancia}/
├── backend/
│   ├── src/
│   ├── dist/
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    ├── build/
    └── package.json
```

## 🔍 Solución de Problemas

### El backend no inicia
```bash
# Ver logs
sudo -u deploy pm2 logs {instancia}-backend

# Verificar .env
sudo nano /home/deploy/{instancia}/backend/.env

# Reintentar
sudo -u deploy pm2 restart {instancia}-backend
```

### Error de base de datos
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar conexión
sudo -u postgres psql -c "\l"
```

### Certificado SSL no se genera
```bash
# Verificar DNS
nslookup backend.tudominio.com
nslookup frontend.tudominio.com

# Reintentar certbot
sudo certbot --nginx
```

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/Gea1981/instaladorWHATICKETv11/issues)
- **Documentación**: Ver archivos en `/docs`

## 📝 Notas Importantes

1. **Firewall**: El instalador configura puertos 80, 443, 5432 (PostgreSQL)
2. **Backups**: Configurar backups periódicos de PostgreSQL
3. **Actualizaciones**: Revisar regularmente actualizaciones de seguridad
4. **Recursos**: Mínimo recomendado: 2GB RAM, 2 CPU cores

## 🔐 Seguridad

- Cambiar contraseñas por defecto
- Mantener el sistema actualizado
- Configurar firewall adecuadamente
- Usar contraseñas fuertes
- Habilitar autenticación de dos factores cuando esté disponible

## 📄 Licencia

MIT License

---

**Versión**: 2.0.0  
**Última actualización**: Noviembre 2025
