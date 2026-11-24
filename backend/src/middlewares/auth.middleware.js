// backend/src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';

export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token de autenticación requerido.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Sesión expirada o token inválido.' });
  }
}

export function exigirRol(rolPermitido) {
  return (req, res, next) => {
    if (req.usuario?.rol !== rolPermitido) {
      return res.status(403).json({ mensaje: 'No tienes permisos para acceder a este recurso.' });
    }
    next();
  };
}