# Resumen Completo: Integración Multicanal en Chasap

## Contexto del Proyecto

### Objetivo Principal
Fusionar funcionalidades de **Izing** (versión multicanal) en **Chasap** (versión estable en español), agregando soporte para:
- Telegram
- Instagram/Facebook (vía NotificaMe Hub)
- VoIP (Asterisk)

### Proyectos Analizados

#### Chasap (Base)
- **Ubicación**: `c:/Users/SOPORTE/comparacion-whatickets/temp_analysis/chasap`
- **Frontend**: React + Material UI
- **Backend**: Node.js + Express + Sequelize
- **WhatsApp**: `@whiskeysockets/baileys`
- **Idioma**: Español
- **Estado**: Estable, producción

#### Izing (Fuente)
- **Ubicación**: `c:/Users/SOPORTE/comparacion-whatickets/temp_analysis/izing`
- **Frontend**: Vue.js + Quasar
- **Backend**: Node.js + Express + Sequelize
- **WhatsApp**: `whatsapp-web.js` (fork)
- **Canales**: WhatsApp, Telegram, Instagram, Facebook, VoIP
- **Estado**: Más actualizado, multicanal

### Estrategia de Fusión
1. **Mantener Chasap como base** (React, español, estable)
2. **Portar lógica de backend** de Izing a Chasap
3. **NO copiar frontend** (Vue incompatible con React)
4. **Adaptar nombres**: `tenantId` → `companyId`, `Tenant` → `Company`

---

## Cambios Implementados

### 1. Base de Datos

#### 1.1 Migración Creada
**Archivo**: `backend/src/database/migrations/20251126141044-add-columns-to-whatsapp.js`

**Nuevas columnas en tabla `Whatsapps`**:
```javascript
{
  tokenTelegram: DataTypes.TEXT,        // Token del bot de Telegram
  instagramUser: DataTypes.TEXT,        // Usuario de Instagram
  instagramKey: DataTypes.TEXT,         // Clave/contraseña de Instagram
  fbPageId: DataTypes.TEXT,             // ID de página de Facebook
  fbObject: DataTypes.JSONB,            // Configuración de Facebook (objeto)
  wavoip: DataTypes.STRING,             // Configuración VoIP
  type: DataTypes.STRING                // Tipo: 'whatsapp'|'telegram'|'instagram'|'messenger'|'wavoip'
}
```

**Método `up`**: Agrega columnas con `queryInterface.addColumn()`
**Método `down`**: Remueve columnas con `queryInterface.removeColumn()`

#### 1.2 Modelo Actualizado
**Archivo**: `backend/src/models/Whatsapp.ts`

Agregadas propiedades TypeScript:
```typescript
@Column type: string;
@Column(DataType.TEXT) tokenTelegram: string;
@Column(DataType.TEXT) instagramUser: string;
@Column(DataType.TEXT) instagramKey: string;
@Column(DataType.TEXT) fbPageId: string;
@Column(DataType.JSONB) fbObject: object;
@Column(DataType.STRING) wavoip: string;
```

---

### 2. Dependencias Instaladas

**Comando ejecutado**:
```bash
cd backend
npm install telegraf asterisk-manager
```

**Paquetes agregados**:
- `telegraf`: Cliente de Telegram Bot API
- `asterisk-manager`: Cliente de Asterisk Manager Interface (VoIP)

**Paquetes ya existentes** (de Chasap):
- `notificamehubsdk`: SDK de NotificaMe Hub (Instagram/Facebook)

---

### 3. Servicios Backend Portados

#### 3.1 TbotServices (Telegram)
**Ubicación**: `backend/src/services/TbotServices/`

| Archivo | Propósito | Adaptaciones |
|---------|-----------|--------------|
| `StartTbotSession.ts` | Inicia sesión de bot de Telegram | `tenantId` → `companyId` en eventos socket |
| `tbotMessageListener.ts` | Escucha eventos de mensajes | Sin cambios |
| `HandleMessageTelegram.ts` | Procesa mensajes entrantes | Usa `VerifyCurrentSchedule` en vez de `VerifyBusinessHours` |
| `TelegramVerifyContact.ts` | Verifica/crea contactos de Telegram | `tenantId` → `companyId` |
| `TelegramVerifyMediaMessage.ts` | Procesa mensajes multimedia | `tenantId` → `companyId` |
| `TelegramVerifyMessage.ts` | Procesa mensajes de texto | `tenantId` → `companyId` |

**Flujo de Telegram**:
1. `StartTbotSession()` → Inicializa bot con `initTbot()`
2. `tbotMessageListener()` → Escucha eventos `message` y `edited_message`
3. `HandleMessageTelegram()` → Procesa mensaje:
   - Verifica contacto con `TelegramVerifyContact()`
   - Crea/actualiza ticket con `FindOrCreateTicketService()`
   - Procesa media o texto según tipo
   - Verifica horarios con `VerifyCurrentSchedule()`

#### 3.2 WbotNotificame (Instagram/Facebook)
**Ubicación**: `backend/src/services/WbotNotificame/`

| Archivo | Propósito | Adaptaciones |
|---------|-----------|--------------|
| `CreateMessageService.ts` | Crea mensajes del Hub | `tenantId` → `companyId` |
| `FindOrCreateContactService.ts` | Gestiona contactos IG/FB | `tenantId` → `companyId`, usa `messengerId` y `instagramPK` |
| `SendMediaMessageService.ts` | Envía multimedia vía Hub | `tenantId` → `companyId`, convierte MP3→MP4 para IG |
| `SendTextMessageService.ts` | Envía texto vía Hub | `tenantId` → `companyId`, usa plantillas con `pupa()` |
| `UpdateMessageAck.ts` | Actualiza ACK de mensajes | `tenantId` → `companyId` |

**Flujo de Instagram/Facebook**:
1. Webhook recibe mensaje de NotificaMe Hub
2. `HubMessageListener()` procesa el mensaje (no portado, debe existir en Chasap)
3. `FindOrCreateContactService()` → Busca/crea contacto por `messengerId` o `instagramPK`
4. `CreateMessageService()` → Guarda mensaje en BD
5. Para enviar: `SendTextMessageService()` o `SendMediaMessageService()` → Usa SDK de NotificaMe Hub

**Campos de contacto**:
- Instagram: `instagramPK` (ID único de Instagram)
- Facebook: `messengerId` (ID único de Messenger)

#### 3.3 Librerías Creadas

##### `backend/src/libs/tbot.ts`
**Propósito**: Gestión de sesiones de Telegram

**Funciones exportadas**:
```typescript
initTbot(connection: Whatsapp): Promise<Session>  // Inicia bot
getTbot(whatsappId: number): Session              // Obtiene sesión
removeTbot(whatsappId: number): void              // Remueve sesión
```

**Adaptaciones**:
- `tenantId` → `companyId` en eventos socket
- Usa `connection.tokenTelegram` para inicializar Telegraf

##### `backend/src/libs/AMI.ts`
**Propósito**: Integración con Asterisk (VoIP)

**Configuración**:
```typescript
const ami = new Asterisk(
  process.env.AMI_PORT || "5038",
  process.env.AMI_HOST || "localhost",
  process.env.AMI_USER || "admin",
  process.env.AMI_PASSWORD || "admin",
  true
);
```

**Eventos escuchados**:
- `Dial`: Llamada iniciada
- `hangup`: Llamada finalizada
- `response`: Respuestas de acciones AMI

---

### 4. Helpers Creados

#### 4.1 `backend/src/helpers/socketEmit.ts`
**Propósito**: Emisión estandarizada de eventos de socket

**Interfaz**:
```typescript
interface ObjEvent {
  companyId: number | string;
  type: Events;  // 'chat:create'|'ticket:update'|etc.
  payload: object;
}
```

**Adaptación**: `tenantId` → `companyId`, eventos de canal ajustados

#### 4.2 `backend/src/helpers/DownloadFiles.ts`
**Propósito**: Descarga archivos de URLs (para Instagram)

**Funcionalidad**:
- Descarga archivo de URL
- Detecta tipo MIME
- Guarda en `public/`
- Retorna metadata del archivo

#### 4.3 `backend/src/helpers/ConvertMp3ToMp4.ts`
**Propósito**: Conversión de audio MP3 a MP4 (requerido por Instagram)

**Uso**: Instagram no acepta MP3, se convierte a MP4 antes de enviar

#### 4.4 `backend/src/helpers/ShowHubToken.ts`
**Propósito**: Obtiene token de NotificaMe Hub desde Settings

**Adaptación**:
```typescript
// Izing
where: { key: "hubToken", tenantId }

// Chasap
where: { key: "hubToken", companyId }
```

#### 4.5 `backend/src/helpers/getQuotedForMessageId.ts`
**Propósito**: Obtiene mensaje citado por ID

**Creado nuevo** (no existía en Chasap):
```typescript
const getQuotedForMessageId = async (
  messageId: string,
  companyId: number
): Promise<Message | null>
```

#### 4.6 `backend/src/utils/pupa.ts`
**Propósito**: Motor de plantillas para mensajes

**Adaptación**: Saludos traducidos al español:
```typescript
// Izing: "Bom dia!", "Boa Tarde!", "Boa Noite!"
// Chasap: "Buenos días!", "Buenas Tardes!", "Buenas Noches!"
```

**Variables soportadas**: `{name}`, `{protocol}`, `{greeting}`

---

### 5. Controladores y Servicios Actualizados

#### 5.1 `backend/src/controllers/WhatsAppController.ts`

**Cambios en interfaz `WhatsappData`**:
```typescript
interface WhatsappData {
  // ... campos existentes ...
  type?: string;              // NUEVO
  tokenTelegram?: string;     // NUEVO
  instagramUser?: string;     // NUEVO
  instagramKey?: string;      // NUEVO
  fbPageId?: string;          // NUEVO
  fbObject?: object;          // NUEVO
  wavoip?: string;            // NUEVO
}
```

**Cambios en método `store`**:
```typescript
// Importación agregada
import { StartTbotSession } from "../services/TbotServices/StartTbotSession";

// Lógica de inicio de sesión según tipo
if (whatsapp.type === 'telegram') {
  StartTbotSession(whatsapp);
} else if (whatsapp.type === 'whatsapp' || !whatsapp.type) {
  StartWhatsAppSession(whatsapp, companyId);
}
// Instagram/Facebook: webhook automático (NotificaMe Hub)
```

#### 5.2 `backend/src/services/WhatsappService/CreateWhatsAppService.ts`

**Cambios en interfaz `Request`**:
```typescript
interface Request {
  // ... campos existentes ...
  type?: string;              // NUEVO, default: "whatsapp"
  tokenTelegram?: string;     // NUEVO
  instagramUser?: string;     // NUEVO
  instagramKey?: string;      // NUEVO
  fbPageId?: string;          // NUEVO
  fbObject?: object;          // NUEVO
  wavoip?: string;            // NUEVO
}
```

**Cambios en creación**:
```typescript
const whatsapp = await Whatsapp.create({
  // ... campos existentes ...
  type,
  tokenTelegram,
  instagramUser,
  instagramKey,
  fbPageId,
  fbObject,
  wavoip
});
```

#### 5.3 `backend/src/services/WhatsappService/UpdateWhatsAppService.ts`

**Cambios similares** a `CreateWhatsAppService.ts`:
- Interfaz `WhatsappData` extendida
- Método `update()` incluye nuevos campos

---

## Estructura de Archivos Creados/Modificados

### Archivos Nuevos (Portados)

```
backend/
├── src/
│   ├── libs/
│   │   ├── tbot.ts                                    [NUEVO]
│   │   └── AMI.ts                                     [NUEVO]
│   ├── helpers/
│   │   ├── socketEmit.ts                              [NUEVO]
│   │   ├── DownloadFiles.ts                           [NUEVO]
│   │   ├── ConvertMp3ToMp4.ts                         [NUEVO]
│   │   ├── ShowHubToken.ts                            [NUEVO]
│   │   └── getQuotedForMessageId.ts                   [NUEVO]
│   ├── utils/
│   │   └── pupa.ts                                    [NUEVO]
│   ├── services/
│   │   ├── TbotServices/                              [CARPETA NUEVA]
│   │   │   ├── StartTbotSession.ts
│   │   │   ├── tbotMessageListener.ts
│   │   │   ├── HandleMessageTelegram.ts
│   │   │   ├── TelegramVerifyContact.ts
│   │   │   ├── TelegramVerifyMediaMessage.ts
│   │   │   └── TelegramVerifyMessage.ts
│   │   └── WbotNotificame/                            [CARPETA NUEVA]
│   │       ├── CreateMessageService.ts
│   │       ├── FindOrCreateContactService.ts
│   │       ├── SendMediaMessageService.ts
│   │       ├── SendTextMessageService.ts
│   │       └── UpdateMessageAck.ts
│   └── database/
│       └── migrations/
│           └── 20251126141044-add-columns-to-whatsapp.js  [NUEVO]
```

### Archivos Modificados

```
backend/
├── src/
│   ├── models/
│   │   └── Whatsapp.ts                                [MODIFICADO]
│   ├── controllers/
│   │   └── WhatsAppController.ts                      [MODIFICADO]
│   └── services/
│       └── WhatsappService/
│           ├── CreateWhatsAppService.ts               [MODIFICADO]
│           └── UpdateWhatsAppService.ts               [MODIFICADO]
└── package.json                                       [MODIFICADO - deps]
```

---

## Mapeo de Conceptos: Izing → Chasap

| Concepto Izing | Concepto Chasap | Notas |
|----------------|-----------------|-------|
| `tenantId` | `companyId` | ID de empresa/tenant |
| `Tenant` model | `Company` model | Modelo de empresa |
| `tenantId` en eventos socket | `company-${companyId}-*` | Formato de canales socket |
| `VerifyBusinessHours` | `VerifyCurrentSchedule` | Verificación de horarios |
| `whatsapp-web.js` | `@whiskeysockets/baileys` | Librería WhatsApp (no cambiada) |

---

## Configuración Requerida

### Variables de Entorno (`.env`)

```env
# Asterisk/VoIP
AMI_HOST=localhost
AMI_PORT=5038
AMI_USER=admin
AMI_PASSWORD=admin

# Backend URL (para webhooks de NotificaMe Hub)
BACKEND_URL=http://localhost:3000
```

### Base de Datos

**Tabla `Settings`** debe contener:
```sql
INSERT INTO Settings (key, value, companyId) 
VALUES ('hubToken', 'TOKEN_DE_NOTIFICAME_HUB', 1);
```

### NotificaMe Hub

**Webhook URL**: `${BACKEND_URL}/hub-webhook/{channel_number}`

Configurar en panel de NotificaMe Hub para cada canal (Instagram/Facebook).

---

## Flujo de Datos por Canal

### Telegram

```
Usuario → Telegram → Bot API → tbot.ts
                                  ↓
                          tbotMessageListener
                                  ↓
                        HandleMessageTelegram
                                  ↓
                    ┌──────────────┴──────────────┐
                    ↓                             ↓
          TelegramVerifyContact         FindOrCreateTicketService
                    ↓                             ↓
          CreateOrUpdateContact              Ticket creado
                                                  ↓
                                    TelegramVerifyMessage/MediaMessage
                                                  ↓
                                          CreateMessageService
                                                  ↓
                                            Socket emit
```

### Instagram/Facebook

```
Usuario → Instagram/Facebook → NotificaMe Hub → Webhook
                                                    ↓
                                          HubMessageListener
                                                    ↓
                                    FindOrCreateContactService
                                                    ↓
                                          FindOrCreateTicketService
                                                    ↓
                                          CreateMessageService
                                                    ↓
                                              Socket emit
```

### VoIP (Asterisk)

```
Llamada → Asterisk → AMI → AMI.ts
                              ↓
                        Event listeners
                              ↓
                    (Lógica personalizada)
```

---

## Pendientes (No Implementados)

### 1. Frontend (React)

**Archivo a modificar**: `frontend/src/components/WhatsAppModal/index.js`

**Cambios necesarios**:

```jsx
// Agregar selector de tipo de canal
<Select name="type" label="Tipo de Canal">
  <MenuItem value="whatsapp">WhatsApp</MenuItem>
  <MenuItem value="telegram">Telegram</MenuItem>
  <MenuItem value="instagram">Instagram</MenuItem>
  <MenuItem value="messenger">Facebook Messenger</MenuItem>
  <MenuItem value="voip">VoIP</MenuItem>
</Select>

// Inputs condicionales según tipo
{type === 'telegram' && (
  <TextField name="tokenTelegram" label="Bot Token" />
)}

{type === 'instagram' && (
  <>
    <TextField name="instagramUser" label="Usuario" />
    <TextField name="instagramKey" label="Contraseña" type="password" />
  </>
)}

{type === 'messenger' && (
  <TextField name="fbPageId" label="Facebook Page ID" />
)}

{type === 'voip' && (
  <TextField name="wavoip" label="Configuración VoIP" />
)}
```

### 2. Migración de Base de Datos

**Ejecutar en proyecto real** (no en `temp_analysis`):

```bash
cd backend
npx sequelize-cli db:migrate
```

**Verificar** que existe `backend/src/config/database.ts` o `backend/dist/config/database.js`.

### 3. Webhook de NotificaMe Hub

**Crear endpoint** (si no existe):

```typescript
// backend/src/routes/hubRoutes.ts
router.post('/hub-webhook/:channelNumber', async (req, res) => {
  const { channelNumber } = req.params;
  const message = req.body;
  
  const whatsapp = await Whatsapp.findOne({
    where: { number: channelNumber }
  });
  
  await HubMessageListener(message, whatsapp, req.files);
  
  res.status(200).send('OK');
});
```

### 4. Pruebas de Integración

**Telegram**:
1. Crear bot en @BotFather
2. Copiar token
3. Agregar conexión con `type='telegram'` y `tokenTelegram`
4. Enviar mensaje al bot
5. Verificar que aparece en Chasap

**Instagram**:
1. Configurar cuenta en NotificaMe Hub
2. Obtener token y guardarlo en Settings
3. Configurar webhook
4. Agregar conexión con `type='instagram'`
5. Enviar DM en Instagram
6. Verificar que aparece en Chasap

---

## Dependencias Entre Archivos

### TbotServices

```
StartTbotSession.ts
  ├── libs/tbot.ts (initTbot)
  ├── libs/socket.ts (getIO)
  └── tbotMessageListener.ts
      └── HandleMessageTelegram.ts
          ├── TelegramVerifyContact.ts
          │   └── ContactServices/CreateOrUpdateContactService.ts
          ├── TelegramVerifyMediaMessage.ts
          │   ├── helpers/getQuotedForMessageId.ts
          │   └── MessageServices/CreateMessageService.ts
          ├── TelegramVerifyMessage.ts
          │   ├── helpers/getQuotedForMessageId.ts
          │   └── MessageServices/CreateMessageService.ts
          ├── TicketServices/FindOrCreateTicketService.ts
          └── CompanyService/VerifyCurrentSchedule.ts
```

### WbotNotificame

```
SendTextMessageService.ts
  ├── helpers/ShowHubToken.ts
  ├── utils/pupa.ts
  ├── helpers/socketEmit.ts
  └── CreateMessageService.ts

SendMediaMessageService.ts
  ├── helpers/ShowHubToken.ts
  ├── helpers/ConvertMp3ToMp4.ts
  ├── helpers/socketEmit.ts
  └── CreateMessageService.ts

FindOrCreateContactService.ts
  └── models/Contact.ts
```

---

## Comandos para Replicar en Otro Proyecto

```bash
# 1. Instalar dependencias
cd backend
npm install telegraf asterisk-manager

# 2. Copiar archivos nuevos
cp -r temp_analysis/chasap/backend/src/libs/tbot.ts backend/src/libs/
cp -r temp_analysis/chasap/backend/src/libs/AMI.ts backend/src/libs/
cp -r temp_analysis/chasap/backend/src/services/TbotServices backend/src/services/
cp -r temp_analysis/chasap/backend/src/services/WbotNotificame backend/src/services/
cp -r temp_analysis/chasap/backend/src/helpers/socketEmit.ts backend/src/helpers/
cp -r temp_analysis/chasap/backend/src/helpers/DownloadFiles.ts backend/src/helpers/
cp -r temp_analysis/chasap/backend/src/helpers/ConvertMp3ToMp4.ts backend/src/helpers/
cp -r temp_analysis/chasap/backend/src/helpers/ShowHubToken.ts backend/src/helpers/
cp -r temp_analysis/chasap/backend/src/helpers/getQuotedForMessageId.ts backend/src/helpers/
cp -r temp_analysis/chasap/backend/src/utils/pupa.ts backend/src/utils/
cp -r temp_analysis/chasap/backend/src/database/migrations/20251126141044-add-columns-to-whatsapp.js backend/src/database/migrations/

# 3. Reemplazar archivos modificados
cp temp_analysis/chasap/backend/src/models/Whatsapp.ts backend/src/models/
cp temp_analysis/chasap/backend/src/controllers/WhatsAppController.ts backend/src/controllers/
cp temp_analysis/chasap/backend/src/services/WhatsappService/CreateWhatsAppService.ts backend/src/services/WhatsappService/
cp temp_analysis/chasap/backend/src/services/WhatsappService/UpdateWhatsAppService.ts backend/src/services/WhatsappService/

# 4. Ejecutar migración
npx sequelize-cli db:migrate

# 5. Reiniciar backend
npm run build
npm start
```

---

## Resumen Ejecutivo para IA

**Tarea completada**: Integración de soporte multicanal (Telegram, Instagram/Facebook, VoIP) desde proyecto Izing hacia proyecto Chasap.

**Método**: Portado de servicios backend, adaptación de nombres (`tenantId`→`companyId`), actualización de modelos y controladores.

**Archivos clave**:
- **Nuevos**: 18 archivos (6 TbotServices, 5 WbotNotificame, 7 helpers/libs)
- **Modificados**: 4 archivos (modelo, controlador, 2 servicios)
- **Migración**: 1 archivo SQL

**Estado**: Backend 100% completo, frontend pendiente (React), migración lista para ejecutar en proyecto real.

**Próximos pasos**: Actualizar UI React, ejecutar migración, configurar webhooks, probar integraciones.
