# Chasap v2.0 - Sistema Multicanal de Atención al Cliente

Sistema completo de atención al cliente con soporte para múltiples canales de comunicación.

## 🌟 Características

- ✅ **WhatsApp** - Integración con Baileys
- ✅ **Telegram** - Bot API
- ✅ **Instagram/Facebook** - Vía NotificaMe Hub
- ✅ **VoIP** - Integración con Asterisk
- ✅ Gestión de tickets multicanal
- ✅ Múltiples usuarios y empresas
- ✅ Colas de atención
- ✅ Mensajes automáticos
- ✅ Horarios de atención
- ✅ Chatbot integrado

## 🚀 Instalación Rápida

### Requisitos
- Ubuntu 20.04 o superior
- Dominio configurado con DNS
- Acceso root al servidor

### Instalación Automática

```bash
# 1. Clonar repositorio
git clone https://github.com/Gea1981/instaladorWHATICKETv11.git
cd instaladorWHATICKETv11

# 2. Ir a la carpeta del instalador
cd install-vps

# 3. Dar permisos de ejecución
chmod +x setup

# 4. Ejecutar instalador
sudo ./setup
```

El script instalará automáticamente:
- Node.js 20.x
- PostgreSQL + Redis
- Nginx + SSL (Let's Encrypt)
- PM2
- Todas las dependencias

## 📚 Documentación

- **Instalación**: Ver `install-vps/README.md`
- **Integración Multicanal**: Ver `RESUMEN_INTEGRACION_MULTICANAL.md`
- **Configuración**: Ver documentación en `/docs`

## 🔧 Configuración de Canales

### WhatsApp
1. Crear conexión en el panel
2. Escanear código QR

### Telegram
1. Crear bot en @BotFather
2. Copiar token
3. Crear conexión tipo "Telegram"
4. Pegar token

### Instagram/Facebook
1. Registrarse en NotificaMe Hub
2. Obtener token
3. Configurar en Settings (key: hubToken)
4. Configurar webhook

### VoIP (Asterisk)
Agregar al `.env` del backend:
```env
AMI_HOST=tu-servidor
AMI_PORT=5038
AMI_USER=admin
AMI_PASSWORD=password
```

## 🛠️ Tecnologías

**Backend**: Node.js + TypeScript + Express + Sequelize + PostgreSQL + Redis

**Frontend**: React + Material-UI + Socket.io

**Integraciones**:
- @whiskeysockets/baileys (WhatsApp)
- telegraf (Telegram)
- notificamehubsdk (Instagram/Facebook)
- asterisk-manager (VoIP)

## 📁 Estructura del Proyecto

```
instaladorWHATICKETv11/
├── backend/              # API y servicios
├── frontend/             # Interfaz React
├── install-vps/          # Script de instalación
└── docs/                 # Documentación
```

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/Gea1981/instaladorWHATICKETv11/issues)
- **Documentación**: Ver carpeta `/docs`

## 📝 Licencia

MIT License

---

**Versión**: 2.0.0 - Integración Multicanal
**Última actualización**: Noviembre 2025
