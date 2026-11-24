# SmartCredit · Banco Andino S.A.

**Demo en vivo:** [https://smartcredit-eight.vercel.app](https://smartcredit-eight.vercel.app) · **Estado de API:** [Healthcheck](https://smartcredit-api-4jhy.onrender.com/api/health)

Plataforma web full-stack de originación digital de crédito de libre inversión y mesa de control de riesgo crediticio. Permite a los clientes simular su crédito, registrarse, diligenciar su solicitud en 4 pasos, adjuntar soportes documentales y firmar digitalmente su contrato, mientras los analistas de riesgo evalúan solicitudes en franja intermedia y monitorean indicadores de originación en tiempo real.

---

## Funcionalidades Principales

### Portal del Cliente

- **Simulador interactivo:** Cálculo dinámico de cuota mensual estimada según monto solicitado y plazo (12 a 60 meses).
- **Registro y autenticación segura:** Cifrado de contraseñas con `bcryptjs`, autenticación mediante `JWT`, bloqueo temporal automático tras 3 intentos fallidos y recuperación de contraseña con código de verificación enviado por correo electrónico.
- **Flujo guiado de solicitud (Wizard en 4 pasos):**
  1. **Datos personales:** Identificación, información de contacto, residencia y ocupación.
  2. **Información financiera:** Cálculo en tiempo real de ingresos, egresos, excedente neto y validación de capacidad de pago (cuota mensual $\le 30\%$ del excedente neto).
  3. **Soportes documentales:** Carga y validación de archivos (`PDF`, `JPG`, `PNG`) mediante `Multer`.
  4. **Confirmación y radicación:** Resumen integral antes del envío y generación automática de número de radicado (`RAD-XXXX`).
- **Portal de seguimiento y firma digital:** Consulta del estado de la solicitud, generación de contrato (`CNT-2026-XXXX`) y captura de firma manuscrita en canvas HTML5 almacenada en formato `base64`.

### Mesa de Control del Analista

- **Vista General (`3A`):** KPIs operativos, distribución de estados (gráfica de dona) y actividad de radicación por franja horaria.
- **Bandeja En Revisión (`3B`):** Inspector detallado de solicitudes en franja intermedia (`Score 600–699`), visualización de soportes adjuntos, verificación de cuota frente al tope del 30% y emisión de dictamen (Aprobar / Rechazar) con observaciones.
- **Cartera Aprobada (`3C`):** Filtro por modalidad (Automática / Manual) y modal de inspección de contratos y firmas digitales registradas.
- **Historial de Rechazos (`3D`):** Auditoría de causales de negación por puntaje crediticio o capacidad de pago.
- **Reportes y Analítica (`3E`):** Conversión del embudo de crédito, distribución por plazos y exportación de indicadores a formato `CSV`.

---

## Reglas del Motor de Riesgo

| Criterio evaluado           | Condición                                                 | Resultado automático                         |
| :-------------------------- | :-------------------------------------------------------- | :------------------------------------------- |
| **Capacidad de pago**       | $\text{Cuota estimada} > 30\% \text{ del Excedente Neto}$ | **Rechazada** (Capacidad insuficiente)       |
| **Puntaje crediticio bajo** | $\text{Score} < 600\text{ pts}$                           | **Rechazada** (Score inferior al mínimo)     |
| **Franja intermedia**       | $600 \le \text{Score} \le 699\text{ pts}$                 | **En revisión** (Enrutada a mesa de control) |
| **Perfil óptimo**           | $\text{Score} \ge 700\text{ pts}$ y cuota dentro del 30%  | **Aprobada** (Modalidad automática)          |

---

## Estructura del Proyecto

```text
SMARTCREDIT/
├── backend/
│   ├── database/
│   │   ├── schema.sql                  # Definición de tablas, llaves e índices en PostgreSQL
│   │   └── seed.js                     # Carga del analista oficial de la mesa de control
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                   # Pool de conexiones a PostgreSQL
│   │   ├── controllers/
│   │   │   ├── analyst.controller.js   # Métricas, bandejas y dictámenes de analistas
│   │   │   ├── auth.controller.js      # Registro, login, bloqueo y recuperación OTP
│   │   │   └── solicitud.controller.js # Borradores, soportes, radicación y firma digital
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js      # Verificación de token JWT y control de roles
│   │   │   └── upload.middleware.js    # Gestión y validación de archivos con Multer
│   │   ├── routes/
│   │   │   ├── analyst.routes.js
│   │   │   ├── auth.routes.js
│   │   │   └── solicitud.routes.js
│   │   ├── services/
│   │   │   ├── creditEngine.service.js    # Lógica de evaluación crediticia y score
│   │   │   ├── documentAnalyzer.service.js # Validación de integridad de soportes
│   │   │   └── emailService.js            # Envío de correos transaccionales
│   │   └── app.js                      # Configuración de Express, CORS y archivos estáticos
│   ├── uploads/                        # Directorio de almacenamiento local de soportes
│   └── server.js                       # Arranque del servidor HTTP
├── frontend/
│   └── src/
│       ├── components/ui/              # Layouts (AuthShell, WizardShell, AnalystLayout) y modales
│       ├── pages/                      # Vistas del cliente (0 a 4) y del analista (3A a 3E)
│       ├── services/api.ts             # Cliente HTTP y persistencia de sesión JWT
│       └── types/credit.ts             # Interfaces TypeScript y formateo de moneda COP
└── .gitignore
```

---

## Endpoints Principales de la API

| Método  | Ruta                                           | Acceso      | Descripción                                                                      |
| :------ | :--------------------------------------------- | :---------- | :------------------------------------------------------------------------------- |
| `POST`  | `/api/auth/register`                           | Público     | Registra un nuevo cliente y devuelve token JWT.                                  |
| `POST`  | `/api/auth/login`                              | Público     | Autentica cliente o analista con control de intentos fallidos.                   |
| `GET`   | `/api/auth/me`                                 | Autenticado | Valida la sesión activa y retorna el perfil del usuario.                         |
| `POST`  | `/api/auth/solicitar-recuperacion`             | Público     | Envía código OTP de 6 dígitos al correo registrado.                              |
| `POST`  | `/api/auth/restablecer-password`               | Público     | Valida el código OTP, actualiza contraseña y desbloquea cuenta.                  |
| `GET`   | `/api/solicitudes/mi-solicitud`                | Cliente     | Obtiene la solicitud activa o más reciente del cliente.                          |
| `POST`  | `/api/solicitudes/borrador`                    | Cliente     | Guarda datos personales y financieros de la solicitud.                           |
| `POST`  | `/api/solicitudes/:radicado/soportes`          | Cliente     | Adjunta documentos soporte en formato PDF, JPG o PNG.                            |
| `POST`  | `/api/solicitudes/:radicado/radicar`           | Cliente     | Ejecuta el motor de riesgo y radica la solicitud.                                |
| `POST`  | `/api/solicitudes/:radicado/firmar`            | Cliente     | Registra la firma digital manuscrita del contrato aprobado.                      |
| `GET`   | `/api/analista/resumen`                        | Analista    | Devuelve KPIs consolidados y distribución por plazos.                            |
| `GET`   | `/api/analista/solicitudes`                    | Analista    | Lista solicitudes filtradas por estado (`En revisión`, `Aprobada`, `Rechazada`). |
| `PATCH` | `/api/analista/solicitudes/:radicado/dictamen` | Analista    | Registra aprobación o rechazo manual con concepto del analista.                  |

---

## Stack Tecnológico

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express, PostgreSQL (`pg`), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `multer`, `nodemailer`.
- **Base de datos:** PostgreSQL.

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

# Configuración SMTP para recuperación de contraseña
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

_(Los clientes se registran directamente desde el portal web)._

---

## Autor

**Clinton Cardona Murillo** · Tecnología en Desarrollo de Software — Institución Universitaria Pascual Bravo.
