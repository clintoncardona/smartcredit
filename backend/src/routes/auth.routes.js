import { Router } from "express";
import jwt from "jsonwebtoken";
import {
  login,
  obtenerPerfilAutenticado,
  registrarCliente,
  restablecerPassword,
  solicitarRecuperacion,
} from "../controllers/auth.controller.js";

const router = Router();

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no proporcionado." });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ mensaje: "Token inválido o expirado." });
  }
}

router.post("/register", registrarCliente);
router.post("/login", login);
router.get("/me", verificarToken, obtenerPerfilAutenticado);
router.post("/solicitar-recuperacion", solicitarRecuperacion);
router.post("/restablecer-password", restablecerPassword);

export default router;
