import { pool } from "../config/db.js";
import {
  calcularExcedenteYCuota,
  evaluarRiesgoCrediticio,
} from "../services/creditEngine.service.js";
import { analizarContenidoDocumento } from "../services/documentAnalyzer.service.js";

export async function guardarBorradorSolicitud(req, res, next) {
  const { personales, financieros } = req.body;
  const usuarioId = req.usuario.id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Actualizar datos personales del cliente (Vista 2A)
    const clienteRes = await client.query(
      `UPDATE clientes
       SET nombres = COALESCE($1, nombres),
           apellidos = COALESCE($2, apellidos),
           celular = COALESCE($3, celular),
           direccion = COALESCE($4, direccion),
           ciudad = COALESCE($5, ciudad),
           ocupacion = COALESCE($6, ocupacion),
           actualizado_en = NOW()
       WHERE usuario_id = $7
       RETURNING *`,
      [
        personales?.nombres,
        personales?.apellidos,
        personales?.celular,
        personales?.direccion,
        personales?.ciudad,
        personales?.ocupacion,
        usuarioId,
      ],
    );

    if (clienteRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ mensaje: "Perfil de cliente no encontrado." });
    }
    const cliente = clienteRes.rows[0];

    // 2. Calcular capacidad de pago y cuota estimada (Vista 2B)
    const { excedenteNeto, cuotaEstimada, capacidadMaximaCuota } =
      calcularExcedenteYCuota(financieros);

    // Buscar si ya tiene una solicitud en preparación
    const existenteRes = await client.query(
      `SELECT * FROM solicitudes
       WHERE cliente_id = $1 AND estado = 'En preparación'
       ORDER BY id DESC LIMIT 1`,
      [cliente.id],
    );

    let solicitud;
    if (existenteRes.rows.length > 0) {
      const updRes = await client.query(
        `UPDATE solicitudes
         SET ingresos_mensuales = $1,
             egresos_declarados = $2,
             arriendo_hipoteca = $3,
             otras_obligaciones = $4,
             excedente_neto = $5,
             monto_solicitado = $6,
             plazo_meses = $7,
             cuota_estimada = $8
         WHERE id = $9
         RETURNING *`,
        [
          financieros.ingresosMensuales,
          financieros.egresosDeclarados,
          financieros.arriendoHipoteca,
          financieros.otrasObligaciones,
          excedenteNeto,
          financieros.montoSolicitado,
          financieros.plazoMeses,
          cuotaEstimada,
          existenteRes.rows[0].id,
        ],
      );
      solicitud = updRes.rows[0];
    } else {
      const seqRes = await client.query(
        "SELECT COALESCE(MAX(id), 9081) + 1 AS next_num FROM solicitudes",
      );
      const radicado = `RAD-${seqRes.rows[0].next_num}`;

      const insRes = await client.query(
        `INSERT INTO solicitudes (
          radicado, cliente_id, ingresos_mensuales, egresos_declarados,
          arriendo_hipoteca, otras_obligaciones, excedente_neto,
          monto_solicitado, plazo_meses, cuota_estimada, estado
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'En preparación')
        RETURNING *`,
        [
          radicado,
          cliente.id,
          financieros.ingresosMensuales,
          financieros.egresosDeclarados,
          financieros.arriendoHipoteca,
          financieros.otrasObligaciones,
          excedenteNeto,
          financieros.montoSolicitado,
          financieros.plazoMeses,
          cuotaEstimada,
        ],
      );
      solicitud = insRes.rows[0];
    }

    await client.query("COMMIT");
    return res.json({
      mensaje: "Borrador guardado correctamente.",
      solicitud,
      calculo: { excedenteNeto, cuotaEstimada, capacidadMaximaCuota },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

export async function subirSoporteDocumental(req, res, next) {
  const { radicado } = req.params;
  const usuarioId = req.usuario.id;

  if (!req.file) {
    return res
      .status(400)
      .json({ mensaje: "Debes adjuntar un archivo PDF o JPG válido." });
  }

  try {
    // 1. Verificar que el radicado pertenezca al usuario autenticado (Anti-IDOR)
    const solRes = await pool.query(
      `SELECT s.id FROM solicitudes s
       JOIN clientes c ON s.cliente_id = c.id
       WHERE s.radicado = $1 AND c.usuario_id = $2`,
      [radicado, usuarioId],
    );

    if (solRes.rows.length === 0) {
      return res
        .status(403)
        .json({ mensaje: "No tienes acceso a esta solicitud." });
    }

    // 2. Ejecutar análisis estructural del contenido binario
    const analisis = await analizarContenidoDocumento(
      req.file.path,
      req.file.mimetype,
      req.file.originalname,
    );

    const solicitudId = solRes.rows[0].id;
    const rutaPublica = `/uploads/${req.file.filename}`;

    const docRes = await pool.query(
      `INSERT INTO soportes_documentales (
        solicitud_id, nombre_original, ruta_archivo, tipo_mime, tamano_bytes, validado
      ) VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING *`,
      [
        solicitudId,
        req.file.originalname,
        rutaPublica,
        req.file.mimetype,
        req.file.size,
      ],
    );

    return res.status(201).json({
      mensaje: analisis.resumenVerificacion,
      analisis,
      soporte: docRes.rows[0],
    });
  } catch (error) {
    if (
      error.message?.includes("archivo") ||
      error.message?.includes("documento") ||
      error.message?.includes("imagen")
    ) {
      return res.status(422).json({ mensaje: error.message });
    }
    next(error);
  }
}

export async function radicarSolicitud(req, res, next) {
  const { radicado } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const solRes = await pool.query(
      `SELECT s.*, c.cedula, c.ocupacion, c.nombres, c.apellidos
       FROM solicitudes s
       JOIN clientes c ON s.cliente_id = c.id
       WHERE s.radicado = $1 AND c.usuario_id = $2`,
      [radicado, req.usuario.id],
    );

    if (solRes.rows.length === 0) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada." });
    }

    const sol = solRes.rows[0];
    const capacidadMaximaCuota = Math.max(
      0,
      Math.round(Number(sol.excedente_neto) * 0.3),
    );

    const evaluacion = await evaluarRiesgoCrediticio({
      cedula: sol.cedula,
      ocupacion: sol.ocupacion,
      ingresosMensuales: Number(sol.ingresos_mensuales),
      montoSolicitado: Number(sol.monto_solicitado),
      excedenteNeto: Number(sol.excedente_neto),
      cuotaEstimada: Number(sol.cuota_estimada),
      capacidadMaximaCuota,
    });

    const decididoEn = evaluacion.estado !== "En revisión" ? new Date() : null;

    const updatedRes = await client.query(
      `UPDATE solicitudes
       SET score_datacredito = $1,
           latencia_api_ms = $2,
           estado = $3,
           modalidad_decision = $4,
           causal_rechazo = $5,
           decidido_en = $6
       WHERE id = $7
       RETURNING *`,
      [
        evaluacion.scoreDatacredito,
        evaluacion.latenciaApiMs,
        evaluacion.estado,
        evaluacion.modalidadDecision,
        evaluacion.causalRechazo,
        decididoEn,
        sol.id,
      ],
    );

    // Registrar trazabilidad
    await client.query(
      `INSERT INTO historial_solicitudes (solicitud_id, evento, actor)
       VALUES ($1, 'Solicitud radicada por el titular', $2),
              ($1, $3, 'Motor SmartCredit')`,
      [
        sol.id,
        `${sol.nombres} ${sol.apellidos}`,
        `Consulta API Datacrédito recibida · Score ${evaluacion.scoreDatacredito} (${evaluacion.estado})`,
      ],
    );

    // Si fue aprobada automáticamente, generar borrador de contrato
    let contrato = null;
    if (evaluacion.estado === "Aprobada") {
      const numeroContrato = radicado.replace("RAD-", "CNT-2026-");
      const contratoRes = await client.query(
        `INSERT INTO contratos (numero_contrato, solicitud_id)
         VALUES ($1, $2)
         ON CONFLICT (solicitud_id) DO UPDATE SET numero_contrato = EXCLUDED.numero_contrato
         RETURNING *`,
        [numeroContrato, sol.id],
      );
      contrato = contratoRes.rows[0];
    }

    await client.query("COMMIT");
    return res.json({
      mensaje: `Solicitud radicada con estado: ${evaluacion.estado}`,
      solicitud: updatedRes.rows[0],
      contrato,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

export async function obtenerMiSolicitud(req, res, next) {
  const usuarioId = req.usuario.id;

  try {
    const clienteRes = await pool.query(
      "SELECT * FROM clientes WHERE usuario_id = $1",
      [usuarioId],
    );
    if (clienteRes.rows.length === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado." });
    }
    const cliente = clienteRes.rows[0];

    const solRes = await pool.query(
      `SELECT * FROM solicitudes
       WHERE cliente_id = $1
       ORDER BY id DESC LIMIT 1`,
      [cliente.id],
    );

    if (solRes.rows.length === 0) {
      return res.json({
        cliente,
        solicitud: null,
        soportes: [],
        historial: [],
        contrato: null,
      });
    }

    const solicitud = solRes.rows[0];

    const [soportesRes, historialRes, contratoRes] = await Promise.all([
      pool.query(
        "SELECT * FROM soportes_documentales WHERE solicitud_id = $1 ORDER BY id ASC",
        [solicitud.id],
      ),
      pool.query(
        "SELECT * FROM historial_solicitudes WHERE solicitud_id = $1 ORDER BY id ASC",
        [solicitud.id],
      ),
      pool.query("SELECT * FROM contratos WHERE solicitud_id = $1", [
        solicitud.id,
      ]),
    ]);

    return res.json({
      cliente,
      solicitud,
      soportes: soportesRes.rows,
      historial: historialRes.rows,
      contrato: contratoRes.rows[0] || null,
    });
  } catch (error) {
    next(error);
  }
}

export async function firmarContrato(req, res, next) {
  const { radicado } = req.params;
  const { firmaBase64 } = req.body || {};

  try {
    const solRes = await pool.query(
      `SELECT s.id, s.estado FROM solicitudes s
       JOIN clientes c ON s.cliente_id = c.id
       WHERE s.radicado = $1 AND c.usuario_id = $2`,
      [radicado, req.usuario.id],
    );

    if (solRes.rows.length === 0) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada." });
    }
    if (solRes.rows[0].estado !== "Aprobada") {
      return res.status(400).json({
        mensaje: "Solo se firman contratos de solicitudes aprobadas.",
      });
    }

    const solicitudId = solRes.rows[0].id;
    const numeroContrato = radicado.replace("RAD-", "CNT-2026-");

    const contratoRes = await pool.query(
      `INSERT INTO contratos (solicitud_id, numero_contrato, firmado_digitalmente, firmado_en, firma_base64)
       VALUES ($1, $2, TRUE, NOW(), $3)
       ON CONFLICT (solicitud_id)
       DO UPDATE SET firmado_digitalmente = TRUE, firmado_en = NOW(), firma_base64 = COALESCE($3, contratos.firma_base64)
       RETURNING *`,
      [solicitudId, numeroContrato, firmaBase64 || null],
    );

    await pool.query(
      `INSERT INTO historial_solicitudes (solicitud_id, evento, actor)
       VALUES ($1, $2, 'Cliente')`,
      [
        solicitudId,
        `Contrato ${numeroContrato} firmado digitalmente por el titular`,
      ],
    );

    return res.json({
      mensaje: `Contrato ${numeroContrato} firmado digitalmente con éxito.`,
      contrato: contratoRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
}
