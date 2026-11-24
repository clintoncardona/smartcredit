import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { enviarCorreoRecuperacion } from "../services/emailService.js";

const MAX_INTENTOS = 3;
const MINUTOS_BLOQUEO = 15;

function firmarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      codigoEmpleado: usuario.codigo_empleado || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );
}

export async function registrarCliente(req, res, next) {
  const {
    correo,
    password,
    cedula,
    nombres,
    apellidos,
    celular,
    direccion = "Por definir",
    ciudad = "Bogotá D. C.",
    ocupacion = "Empleado dependiente",
  } = req.body;

  if (!correo || !password || !cedula || !nombres || !apellidos || !celular) {
    return res
      .status(400)
      .json({ mensaje: "Todos los campos obligatorios deben completarse." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existe = await client.query(
      "SELECT id FROM usuarios WHERE correo = $1",
      [correo.toLowerCase().trim()],
    );
    if (existe.rows.length > 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ mensaje: "Este correo ya se encuentra registrado." });
    }

    const cedulaExiste = await client.query(
      "SELECT id FROM clientes WHERE cedula = $1",
      [cedula.trim()],
    );
    if (cedulaExiste.rows.length > 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ mensaje: "Ya existe una cuenta asociada a esta cédula." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `INSERT INTO usuarios (correo, password_hash, rol)
       VALUES ($1, $2, 'cliente')
       RETURNING id, correo, rol`,
      [correo.toLowerCase().trim(), passwordHash],
    );
    const usuario = userResult.rows[0];

    const clienteResult = await client.query(
      `INSERT INTO clientes (usuario_id, cedula, nombres, apellidos, celular, direccion, ciudad, ocupacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        usuario.id,
        cedula.trim(),
        nombres.trim(),
        apellidos.trim(),
        celular.trim(),
        direccion.trim(),
        ciudad.trim(),
        ocupacion.trim(),
      ],
    );

    await client.query("COMMIT");

    const token = firmarToken(usuario);
    return res.status(201).json({
      mensaje: "Cuenta creada exitosamente.",
      token,
      usuario,
      cliente: clienteResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

export async function login(req, res, next) {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ mensaje: "Ingresa tu correo y contraseña." });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      [correo.toLowerCase().trim()],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: "Credenciales inválidas." });
    }

    const usuario = result.rows[0];

    // Verificar si la cuenta está bloqueada temporalmente
    if (
      usuario.bloqueado_hasta &&
      new Date(usuario.bloqueado_hasta) > new Date()
    ) {
      const minutosRestantes = Math.ceil(
        (new Date(usuario.bloqueado_hasta).getTime() - Date.now()) / 60000,
      );
      return res.status(423).json({
        mensaje: `Cuenta bloqueada por seguridad. Intenta nuevamente en ${minutosRestantes} minuto(s).`,
        bloqueado: true,
        bloqueadoHasta: usuario.bloqueado_hasta,
      });
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.password_hash,
    );

    if (!passwordValida) {
      const nuevosIntentos = usuario.intentos_fallidos + 1;
      const bloquear = nuevosIntentos >= MAX_INTENTOS;
      const bloqueadoHasta = bloquear
        ? new Date(Date.now() + MINUTOS_BLOQUEO * 60 * 1000)
        : null;

      await pool.query(
        `UPDATE usuarios
         SET intentos_fallidos = $1, bloqueado_hasta = $2
         WHERE id = $3`,
        [nuevosIntentos, bloqueadoHasta, usuario.id],
      );

      if (bloquear) {
        return res.status(423).json({
          mensaje: `Has superado los ${MAX_INTENTOS} intentos permitidos. Cuenta bloqueada por ${MINUTOS_BLOQUEO} minutos.`,
          bloqueado: true,
          intentosFallidos: nuevosIntentos,
        });
      }

      return res.status(401).json({
        mensaje: `Contraseña incorrecta. Te quedan ${MAX_INTENTOS - nuevosIntentos} intento(s).`,
        bloqueado: false,
        intentosFallidos: nuevosIntentos,
      });
    }

    // Login exitoso: reiniciar contador de intentos fallidos
    await pool.query(
      "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = $1",
      [usuario.id],
    );

    let cliente = null;
    if (usuario.rol === "cliente") {
      const clienteRes = await pool.query(
        "SELECT * FROM clientes WHERE usuario_id = $1",
        [usuario.id],
      );
      cliente = clienteRes.rows[0] || null;
    }

    const token = firmarToken(usuario);
    return res.json({
      mensaje: "Inicio de sesión exitoso.",
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
        codigoEmpleado: usuario.codigo_empleado,
      },
      cliente,
    });
  } catch (error) {
    next(error);
  }
}

// Agregar al final de backend/src/controllers/auth.controller.js
export async function obtenerPerfilAutenticado(req, res, next) {
  try {
    const userRes = await pool.query(
      "SELECT id, correo, rol, codigo_empleado FROM usuarios WHERE id = $1",
      [req.usuario.id],
    );
    if (userRes.rows.length === 0) {
      return res.status(401).json({ mensaje: "Usuario no válido." });
    }
    const usuario = userRes.rows[0];
    let cliente = null;
    if (usuario.rol === "cliente") {
      const cRes = await pool.query(
        "SELECT * FROM clientes WHERE usuario_id = $1",
        [usuario.id],
      );
      cliente = cRes.rows[0] || null;
    }
    return res.json({
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
        codigoEmpleado: usuario.codigo_empleado,
      },
      cliente,
    });
  } catch (error) {
    next(error);
  }
}

const codigosRecuperacion = new Map();

export async function solicitarRecuperacion(req, res, next) {
  const correo = String(req.body.correo || "")
    .trim()
    .toLowerCase();

  if (!correo) {
    return res
      .status(400)
      .json({ mensaje: "Ingresa un correo electrónico válido." });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.correo, c.nombres
       FROM usuarios u
       LEFT JOIN clientes c ON c.usuario_id = u.id
       WHERE u.correo = $1`,
      [correo],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        mensaje:
          "No encontramos una cuenta registrada con ese correo electrónico.",
      });
    }

    const usuario = result.rows[0];
    const codigo = String(crypto.randomInt(100000, 999999));

    codigosRecuperacion.set(correo, {
      usuarioId: usuario.id,
      codigo,
      expiraEn: Date.now() + 15 * 60 * 1000,
      intentos: 0,
    });

    await enviarCorreoRecuperacion({
      correo: usuario.correo,
      nombre: usuario.nombres || "Cliente",
      codigo,
    });

    return res.json({
      mensaje: "Código de verificación enviado correctamente.",
    });
  } catch (error) {
    next(error);
  }
}

export async function restablecerPassword(req, res, next) {
  const correo = String(req.body.correo || "")
    .trim()
    .toLowerCase();
  const codigo = String(req.body.codigo || "").trim();
  const nuevaPassword = String(req.body.nuevaPassword || "");

  const registro = codigosRecuperacion.get(correo);
  if (!registro) {
    return res.status(400).json({
      mensaje:
        "No hay una solicitud activa para este correo. Solicita un nuevo código.",
    });
  }

  if (Date.now() > registro.expiraEn) {
    codigosRecuperacion.delete(correo);
    return res.status(400).json({
      mensaje: "El código ha expirado. Solicita uno nuevo.",
    });
  }

  if (registro.codigo !== codigo) {
    registro.intentos += 1;
    if (registro.intentos >= 5) {
      codigosRecuperacion.delete(correo);
      return res.status(400).json({
        mensaje: "Superaste los intentos permitidos. Solicita un nuevo código.",
      });
    }
    return res.status(400).json({
      mensaje: "El código ingresado no es correcto. Verifica tu correo.",
    });
  }

  const passwordValida =
    nuevaPassword.length >= 8 &&
    /[A-Z]/.test(nuevaPassword) &&
    /\d/.test(nuevaPassword);

  if (!passwordValida) {
    return res.status(400).json({
      mensaje:
        "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula y un número.",
    });
  }

  try {
    const passwordHash = await bcrypt.hash(nuevaPassword, 10);

    const updateRes = await pool.query(
      `UPDATE usuarios
       SET password_hash = $1, intentos_fallidos = 0, bloqueado_hasta = NULL
       WHERE id = $2
       RETURNING id`,
      [passwordHash, registro.usuarioId],
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({
        mensaje: "No se pudo actualizar el usuario en la base de datos.",
      });
    }

    codigosRecuperacion.delete(correo);

    return res.json({
      mensaje: "Contraseña restablecida y cuenta desbloqueada con éxito.",
    });
  } catch (error) {
    next(error);
  }
}
