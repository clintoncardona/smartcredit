// backend/src/routes/analyst.routes.js
import { Router } from 'express';
import { verificarToken, exigirRol } from '../middlewares/auth.middleware.js';
import {
  obtenerResumenAnalista,
  listarSolicitudesMesa,
  emitirDictamenManual,
} from '../controllers/analyst.controller.js';

const router = Router();

router.use(verificarToken, exigirRol('analista'));

router.get('/resumen', obtenerResumenAnalista);
router.get('/solicitudes', listarSolicitudesMesa);
router.patch('/solicitudes/:radicado/dictamen', emitirDictamenManual);

export default router;