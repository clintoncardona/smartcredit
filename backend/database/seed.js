import bcrypt from "bcryptjs";
import { pool } from "../src/config/db.js";

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const correoAnalista =
      process.env.ANALYST_EMAIL || "carlos.gomez@bancoandino.com";
    const passwordPlana = process.env.ANALYST_PASSWORD || "Analista2026*";
    const codigoEmpleado = process.env.ANALYST_CODE || "ANAL-089";

    const analistaHash = await bcrypt.hash(passwordPlana, 10);

    // Crear o actualizar el Analista oficial de la Mesa de Control
    await client.query(
      `INSERT INTO usuarios (correo, password_hash, rol, codigo_empleado, intentos_fallidos, bloqueado_hasta)
       VALUES ($1, $2, 'analista', $3, 0, NULL)
       ON CONFLICT (correo) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           rol = 'analista',
           codigo_empleado = EXCLUDED.codigo_empleado,
           intentos_fallidos = 0,
           bloqueado_hasta = NULL`,
      [correoAnalista.toLowerCase().trim(), analistaHash, codigoEmpleado],
    );

    await client.query("COMMIT");
    console.log(
      `Analista definitivo listo en smartcredit_db (${correoAnalista} · ${codigoEmpleado}).`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error ejecutando seed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
