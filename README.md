# SmartCredit · Banco Andino S.A.

**Demo en vivo:** [https://smartcredit-eight.vercel.app](https://smartcredit-eight.vercel.app) · **Estado de API:** [Healthcheck](https://smartcredit-api-4jhy.onrender.com/api/health)

Plataforma web full-stack de originación digital de crédito de libre inversión y mesa de control de riesgo crediticio. Permite a los clientes simular su crédito con tabla de amortización, registrarse, diligenciar su solicitud en 4 pasos, adjuntar soportes documentales verificados binariamente y firmar digitalmente su contrato, mientras los analistas de riesgo evalúan solicitudes en franja intermedia y monitorean indicadores de originación en tiempo real.

---

## Funcionalidades Principales

### Portal del Cliente

- **Simulador interactivo y plan de pagos:** Cálculo dinámico de cuota mensual fija bajo amortización francesa ($1.85\%\text{ M.V.}$) según monto solicitado ($\$1\text{M}$ a $\$50\text{M COP}$) y plazo ($12\text{ a }48\text{ meses}$), con modal desplegable de **tabla de amortización mes a mes** (abono a capital, intereses y saldo restante).
- **Registro y autenticación segura:** Cifrado de contraseñas con `bcryptjs`, autenticación mediante `JWT`, bloqueo temporal automático tras 3 intentos fallidos (`HTTP 423`), recuperación de contraseña con código OTP de 6 dígitos enviado por correo electrónico y detección no bloqueante de latencia del servidor en la nube.
- **Flujo guiado de solicitud (Wizard en 4 pasos):**
  1. **Datos personales:** Identificación, información de contacto, residencia y ocupación.
  2. **Información financiera:** Cálculo en tiempo real de ingresos, egresos, excedente neto y validación de capacidad de pago ($\text{cuota mensual} \le 30\%$ del excedente neto).
  3. **Soportes documentales:** Zona de carga arrastrando archivos a pantalla completa (`DropOverlay`) con inspección en cliente y servidor mediante *magic bytes* (`%PDF-`/`%%EOF` y cabeceras `JPEG`), resolución y contraste para archivos `PDF` y `JPG` de hasta 5 MB.
  4. **Confirmación y radicación:** Resumen integral antes del envío y generación automática de número de radicado (`RAD-XXXX`).
- **Portal de seguimiento y firma digital:** Consulta del estado de la solicitud, generación de contrato (`CNT-2026-XXXX`) y captura de firma manuscrita en canvas HTML5 almacenada en formato `base64`.

### Mesa de Control del Analista

- **Vista General (`3A`):** KPIs operativos, distribución de estados (gráfica de dona) y actividad de radicación por franja horaria.
- **Bandeja En Revisión (`3B`):** Inspector detallado de solicitudes en franja intermedia ($\text{Score } 600\text{--}699$), visualización de soportes adjuntos, verificación de cuota frente al tope del $30\%$ y emisión de dictamen (Aprobar / Rechazar) con observaciones.
- **Cartera Aprobada (`3C`):** Filtro por modalidad (Automática / Manual) y modal de inspección de contratos y firmas digitales registradas.
- **Historial de Rechazos (`3D`):** Auditoría de causales de negación por puntaje crediticio o capacidad de pago.
- **Reportes y Analítica (`3E`):** Conversión del embudo de crédito, distribución por plazos y exportación de indicadores a formato `CSV`.

---

## Reglas del Motor de Riesgo

Las reglas se evalúan en cascada dentro de `creditEngine.service.js`:

| Orden | Criterio evaluado           | Condición                                                 | Resultado automático                         |
| :---: | :-------------------------- | :-------------------------------------------------------- | :------------------------------------------- |
| **1** | **Excedente disponible**    | $\text{Excedente Neto} \le \$0\text{ COP}$                | **Rechazada** (Excedente negativo o nulo)    |
| **2** | **Capacidad de pago**       | $\text{Cuota estimada} > 30\% \text{ del Excedente Neto}$ | **Rechazada** (Capacidad insuficiente)       |
| **3** | **Perfil óptimo**           | $\text{Score} \ge 700\text{ pts}$ y cuota dentro del $30\%$ | **Aprobada** (Modalidad automática)          |
| **4** | **Franja intermedia**       | $600 \le \text{Score} \le 699\text{ pts}$                 | **En revisión** (Enrutada a mesa de control) |
| **5** | **Puntaje crediticio bajo** | $\text{Score} < 600\text{ pts}$                           | **Rechazada** (Score inferior al mínimo)     |

---

## Estructura del Proyecto

```text
SMARTCREDIT/
├── backend/
│   ├── database/
│   │   ├── schema.sql                      # Definición de tablas, llaves e índices en PostgreSQL
│   │   └── seed.js                         # Carga del analista oficial de la mesa de control
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                       # Pool de conexiones a PostgreSQL
│   │   ├── controllers/
│   │   │   ├── analyst.controller.js       # Métricas, bandejas y dictámenes de analistas
│   │   │   ├── auth.controller.js          # Registro, login, bloqueo y recuperación OTP
│   │   │   └── solicitud.controller.js     # Borradores, soportes, radicación y firma digital
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js          # Verificación de token JWT y control de roles
│   │   │   └── upload.middleware.js        # Gestión y validación de archivos con Multer
│   │   ├── routes/
│   │   │   ├── analyst.routes.js
│   │   │   ├── auth.routes.js
│   │   │   └── solicitud.routes.js
│   │   ├── services/
│   │   │   ├── creditEngine.service.js     # Lógica de evaluación crediticia y score
│   │   │   ├── documentAnalyzer.service.js # Validación binaria (magic bytes) de soportes
│   │   │   └── emailService.js             # Envío transaccional (Brevo HTTPS / SMTP local)
│   │   └── app.js                          # Configuración de Express, CORS y archivos estáticos
│   ├── tests/
│   │   ├── api.blackbox.test.js            # Pruebas funcionales y de seguridad de endpoints HTTP
│   │   ├── creditEngine.test.js            # Pruebas unitarias de amortización y árbol de riesgo
│   │   ├── documentAnalyzer.test.js        # Pruebas unitarias de magic bytes y tamaño de archivo
│   │   └── emailService.test.js            # Pruebas de integración del servicio de correo OTP
│   ├── uploads/                            # Directorio de almacenamiento local de soportes
│   ├── server.js                           # Arranque del servidor HTTP
│   └── vitest.config.js                    # Configuración de Vitest y cobertura V8
├── frontend/
│   ├── public/
│   │   └── favicon.svg                     # Ícono institucional de SmartCredit
│   └── src/
│       ├── components/
│       │   ├── DropOverlay.tsx             # Overlay global de arrastrar y soltar documentos
│       │   └── ui/                         # Layouts (AuthShell, WizardShell, AnalystLayout) y modales
│       ├── pages/                          # Vistas del cliente (0 a 4) y del analista (3A a 3E)
│       ├── services/api.ts                 # Cliente HTTP, sesión JWT y detector de red lenta
│       ├── types/credit.ts                 # Interfaces TypeScript y formateo de moneda COP
│       └── App.tsx                         # Enrutamiento protegido por rol y estado global
└── .gitignore
```

---

## Endpoints Principales de la API

| Método  | Ruta                                           | Acceso      | Descripción                                                                      |
| :------ | :--------------------------------------------- | :---------- | :------------------------------------------------------------------------------- |
| `GET`   | `/api/health`                                  | Público     | Verifica disponibilidad del servidor y conexión con PostgreSQL.                  |
| `POST`  | `/api/auth/register`                           | Público     | Registra un nuevo cliente y devuelve token JWT.                                  |
| `POST`  | `/api/auth/login`                              | Público     | Autentica cliente o analista con control de intentos fallidos.                   |
| `GET`   | `/api/auth/me`                                 | Autenticado | Valida la sesión activa y retorna el perfil del usuario.                         |
| `POST`  | `/api/auth/solicitar-recuperacion`             | Público     | Envía código OTP de 6 dígitos al correo registrado.                              |
| `POST`  | `/api/auth/restablecer-password`               | Público     | Valida el código OTP, actualiza contraseña y desbloquea cuenta.                  |
| `GET`   | `/api/solicitudes/mi-solicitud`                | Cliente     | Obtiene la solicitud activa o más reciente del cliente.                          |
| `POST`  | `/api/solicitudes/borrador`                    | Cliente     | Guarda datos personales y financieros de la solicitud.                           |
| `POST`  | `/api/solicitudes/:radicado/soportes`          | Cliente     | Adjunta documentos soporte en formato PDF o JPG validados por magic bytes.       |
| `POST`  | `/api/solicitudes/:radicado/radicar`           | Cliente     | Ejecuta el motor de riesgo y radica la solicitud.                                |
| `POST`  | `/api/solicitudes/:radicado/firmar`            | Cliente     | Registra la firma digital manuscrita del contrato aprobado.                      |
| `GET`   | `/api/analista/resumen`                        | Analista    | Devuelve KPIs consolidados y distribución por plazos.                            |
| `GET`   | `/api/analista/solicitudes`                    | Analista    | Lista solicitudes filtradas por estado (`En revisión`, `Aprobada`, `Rechazada`). |
| `PATCH` | `/api/analista/solicitudes/:radicado/dictamen` | Analista    | Registra aprobación o rechazo manual con concepto del analista.                  |

---

## Pruebas Automatizadas y Cobertura

El backend cuenta con una suite automatizada en **Vitest** y **Supertest** (`4` suites, `22` pruebas aprobadas) que alcanza un **$98.59\%$ de cobertura** sobre los servicios de negocio ($100\%$ en `creditEngine.service.js` y `documentAnalyzer.service.js`):

```bash
cd backend
npm test                 # Ejecuta todas las pruebas unitarias y de API
npm run test:coverage    # Genera el reporte de cobertura con V8
```

---

## Stack Tecnológico

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons (desplegado en **Vercel**).
- **Backend:** Node.js, Express, PostgreSQL (`pg`), `jsonwebtoken`, `bcryptjs`, `multer`, API HTTPS de **Brevo** / `nodemailer` (desplegado en **Render**).
- **Base de datos:** PostgreSQL (alojada en **Neon**).
- **Calidad y Testing:** Vitest, Supertest, cobertura V8.

---

## Instalación y Ejecución Local

### 1. Base de datos (PostgreSQL)

Crea la base de datos e importa el esquema inicial:

```bash
createdb -U postgres smartcredit_db
psql -U postgres -d smartcredit_db -f backend/database/schema.sql
```

### 2. Backend

Instala las dependencias dentro de `backend/`:

```bash
cd backend
npm install
```

Crea el archivo `backend/.env` con las siguientes variables de entorno:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:tu_password_postgres@localhost:5432/smartcredit_db
JWT_SECRET=clave_secreta_segura_smartcredit_2026
FRONTEND_URL=http://localhost:5173

# Opción A: API HTTPS de Brevo (recomendado en producción)
BREVO_API_KEY=tu_api_key_brevo
BREVO_SENDER_EMAIL=notificaciones@bancoandino.com

# Opción B: SMTP local de respaldo para desarrollo
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_contrasena_de_aplicacion
```

Carga al analista oficial e inicia el servidor en modo desarrollo:

```bash
node database/seed.js
npm run dev
```

### 3. Frontend

En una segunda terminal, instala dependencias dentro de `frontend/`:

```bash
cd frontend
npm install
```

Crea el archivo `frontend/.env` apuntando a la API local:

```env
VITE_API_URL=http://localhost:4000/api
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

---

## Credenciales de Acceso (Mesa de Control)

- **Rol:** Analista Senior (`ANAL-089`)
- **Correo:** `carlos.gomez@bancoandino.com`
- **Contraseña:** `Analista2026*`

*(Los clientes se registran directamente desde el portal web).*

---

## Equipo de Desarrollo

- **Clinton Cardona Murillo** · Tecnología en Desarrollo de Software — Institución Universitaria Pascual Bravo.
- **Santiago Moscoso Rodríguez** · Tecnología en Desarrollo de Software — Institución Universitaria Pascual Bravo.