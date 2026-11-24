// backend/server.js
import dotenv from 'dotenv';
import app from './src/app.js';
import { pool } from './src/config/db.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function iniciarServidor() {
  try {
    const res = await pool.query('SELECT NOW() AS hora_db');
    console.log(`PostgreSQL conectado (${res.rows[0].hora_db})`);

    app.listen(PORT, () => {
      console.log(`Servidor SmartCredit corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL:', error.message);
    process.exit(1);
  }
}

iniciarServidor();