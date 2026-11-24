import { Router } from "express";
import {
  firmarContrato,
  guardarBorradorSolicitud,
  obtenerMiSolicitud,
  radicarSolicitud,
  subirSoporteDocumental,
} from "../controllers/solicitud.controller.js";
import { exigirRol, verificarToken } from "../middlewares/auth.middleware.js";
import { uploadSoporte } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(verificarToken, exigirRol("cliente"));

router.get("/mi-solicitud", obtenerMiSolicitud);
router.post("/borrador", guardarBorradorSolicitud);
router.post(
  "/:radicado/soportes",
  uploadSoporte.single("archivo"),
  subirSoporteDocumental,
);
router.post("/:radicado/radicar", radicarSolicitud);
router.post("/:radicado/firmar", firmarContrato);

export default router;
