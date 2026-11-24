import cors from "cors";
import express from "express";
import fs from "fs";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import analystRoutes from "./routes/analyst.routes.js";
import authRoutes from "./routes/auth.routes.js";
import solicitudRoutes from "./routes/solicitud.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }
      return callback(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));

// Servir archivos cargados (soportes PDF / JPG)
app.use("/uploads", express.static(uploadsDir));

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    servicio: "SmartCredit API · Banco Andino",
    timestamp: new Date(),
  });
});

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/solicitudes", solicitudRoutes);
app.use("/api/analista", analystRoutes);

// Manejador centralizado de errores (incluye errores de Multer)
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        mensaje: "El archivo supera el tamaño máximo permitido de 5 MB.",
      });
    }
    return res
      .status(400)
      .json({ mensaje: `Error al subir archivo: ${err.message}` });
  }

  if (err.message?.includes("Formato no permitido")) {
    return res.status(400).json({ mensaje: err.message });
  }

  console.error("Error en el servidor:", err);
  return res.status(500).json({ mensaje: "Error interno del servidor." });
});

export default app;
