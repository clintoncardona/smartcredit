-- 1. USUARIOS (Autenticación, roles y bloqueo por intentos fallidos)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('cliente', 'analista')),
    codigo_empleado VARCHAR(30),
    intentos_fallidos INT NOT NULL DEFAULT 0,
    bloqueado_hasta TIMESTAMP NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
-- 2. CLIENTES (Datos personales vinculados al usuario)
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cedula VARCHAR(25) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    celular VARCHAR(25) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    ciudad VARCHAR(80) NOT NULL,
    ocupacion VARCHAR(80) NOT NULL,
    actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
-- 3. SOLICITUDES DE CRÉDITO (Información financiera, score y dictamen)
CREATE TABLE IF NOT EXISTS solicitudes (
    id SERIAL PRIMARY KEY,
    radicado VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    ingresos_mensuales NUMERIC(14, 2) NOT NULL,
    egresos_declarados NUMERIC(14, 2) NOT NULL,
    arriendo_hipoteca NUMERIC(14, 2) NOT NULL,
    otras_obligaciones NUMERIC(14, 2) NOT NULL,
    excedente_neto NUMERIC(14, 2) NOT NULL,
    monto_solicitado NUMERIC(14, 2) NOT NULL,
    plazo_meses INT NOT NULL CHECK (plazo_meses IN (12, 24, 36, 48)),
    cuota_estimada NUMERIC(14, 2) NOT NULL,
    score_datacredito INT NULL,
    latencia_api_ms INT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'En preparación' CHECK (
        estado IN (
            'En preparación',
            'En revisión',
            'Aprobada',
            'Rechazada'
        )
    ),
    modalidad_decision VARCHAR(20) NULL CHECK (modalidad_decision IN ('Automática', 'Manual')),
    causal_rechazo VARCHAR(255) NULL,
    observacion_analista TEXT NULL,
    analista_id INT NULL REFERENCES usuarios(id),
    creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
    decidido_en TIMESTAMP NULL
);
-- 4. SOPORTES DOCUMENTALES (Archivos PDF/JPG validados)
CREATE TABLE IF NOT EXISTS soportes_documentales (
    id SERIAL PRIMARY KEY,
    solicitud_id INT NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    nombre_original VARCHAR(200) NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(50) NOT NULL,
    tamano_bytes INT NOT NULL,
    validado BOOLEAN NOT NULL DEFAULT TRUE,
    subido_en TIMESTAMP NOT NULL DEFAULT NOW()
);
-- 5. HISTORIAL DE TRAZABILIDAD (Bitácora de eventos para 3B y Portal Cliente)
CREATE TABLE IF NOT EXISTS historial_solicitudes (
    id SERIAL PRIMARY KEY,
    solicitud_id INT NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    evento VARCHAR(255) NOT NULL,
    actor VARCHAR(100) NOT NULL,
    registrado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
-- 6. CONTRATOS GENERADOS (Para solicitudes aprobadas en 3C y Portal Cliente 4)
CREATE TABLE IF NOT EXISTS contratos (
    id SERIAL PRIMARY KEY,
    numero_contrato VARCHAR(30) UNIQUE NOT NULL,
    solicitud_id INT UNIQUE NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    firmado_digitalmente BOOLEAN NOT NULL DEFAULT FALSE,
    firmado_en TIMESTAMP NULL,
    generado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_solicitudes_radicado ON solicitudes(radicado);
ALTER TABLE contratos
ADD COLUMN IF NOT EXISTS firma_base64 TEXT;