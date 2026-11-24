import { pool } from "../config/db.js";

export async function obtenerResumenAnalista(_req, res, next) {
  try {
    const kpiRes = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE estado = 'En revisión')::int AS pendientes,
        COUNT(*) FILTER (WHERE estado = 'Aprobada')::int AS aprobadas,
        COUNT(*) FILTER (WHERE estado = 'Rechazada')::int AS rechazadas,
        COALESCE(SUM(monto_solicitado) FILTER (WHERE estado = 'Aprobada'), 0)::numeric AS volumen_aprobado,
        COALESCE(ROUND(AVG(score_datacredito)), 0)::int AS score_promedio
      FROM solicitudes
      WHERE estado != 'En preparación'
    `);

    const plazosRes = await pool.query(`
      SELECT
        plazo_meses,
        COUNT(*)::int AS cantidad,
        COALESCE(ROUND(AVG(monto_solicitado)), 0)::numeric AS ticket_promedio
      FROM solicitudes
      WHERE estado != 'En preparación'
      GROUP BY plazo_meses
      ORDER BY plazo_meses ASC
    `);

    return res.json({
      kpis: kpiRes.rows[0],
      distribucionPlazos: plazosRes.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function listarSolicitudesMesa(req, res, next) {
  const { estado } = req.query;

  try {
    const params = [];
    let filtroWhere = "WHERE s.estado != 'En preparación'";

    if (estado) {
      params.push(estado);
      filtroWhere += ` AND s.estado = $${params.length}`;
    }

    const query = `
      SELECT
        s.*,
        c.cedula, c.nombres, c.apellidos, c.celular, c.ciudad, c.ocupacion,
        u.correo,
        ct.numero_contrato,
        ct.firmado_digitalmente,
        ct.firmado_en,
        ct.firma_base64,  
        COALESCE(
          (SELECT json_agg(sd ORDER BY sd.id ASC)
           FROM soportes_documentales sd
           WHERE sd.solicitud_id = s.id),
          '[]'::json
        ) AS soportes,
        COALESCE(
          (SELECT json_agg(hs ORDER BY hs.id ASC)
           FROM historial_solicitudes hs
           WHERE hs.solicitud_id = s.id),
          '[]'::json
        ) AS historial
      FROM solicitudes s
      JOIN clientes c ON s.cliente_id = c.id
      JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN contratos ct ON ct.solicitud_id = s.id
      ${filtroWhere}
      ORDER BY s.creado_en DESC
    `;

    const result = await pool.query(query, params);
    return res.json({ solicitudes: result.rows });
  } catch (error) {
    next(error);
  }
}

export async function emitirDictamenManual(req, res, next) {
  const { radicado } = req.params;
  const { decision, observacion } = req.body;
  const analistaId = req.usuario.id;

  if (!["Aprobada", "Rechazada"].includes(decision)) {
    return res
      .status(400)
      .json({ mensaje: 'La decisión debe ser "Aprobada" o "Rechazada".' });
  }

  if (!observacion || !observacion.trim()) {
    return res
      .status(400)
      .json({ mensaje: "Debes registrar una observación o causal." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const solRes = await client.query(
      "SELECT * FROM solicitudes WHERE radicado = $1",
      [radicado],
    );

    if (solRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ mensaje: "Solicitud no encontrada." });
    }

    const sol = solRes.rows[0];
    const causalRechazo = decision === "Rechazada" ? observacion.trim() : null;

    const updatedRes = await client.query(
      `UPDATE solicitudes
       SET estado = $1,
           modalidad_decision = 'Manual',
           observacion_analista = $2,
           causal_rechazo = $3,
           analista_id = $4,
           decidido_en = NOW()
       WHERE id = $5
       RETURNING *`,
      [decision, observacion.trim(), causalRechazo, analistaId, sol.id],
    );

    const etiquetaAnalista =
      req.usuario.codigoEmpleado || "Analista Mesa Control";

    await client.query(
      `INSERT INTO historial_solicitudes (solicitud_id, evento, actor)
       VALUES ($1, $2, $3)`,
      [
        sol.id,
        `Dictamen manual registrado: ${decision} · ${observacion.trim()}`,
        etiquetaAnalista,
      ],
    );

    let contrato = null;
    if (decision === "Aprobada") {
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
      mensaje: `Solicitud ${radicado} marcada como ${decision}.`,
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
