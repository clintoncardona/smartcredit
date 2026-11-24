import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { AuthShell } from "../components/ui/AuthShell";
import { authApi } from "../services/api";

interface LoginViewProps {
  onLoginSuccess: (
    rol: "cliente" | "analista",
    correo: string,
    clienteData?: Record<string, unknown> | null,
  ) => Promise<void> | void;
  onGoToRegister: () => void;
  onGoHome?: () => void;
}

type PasoRecuperacion = "solicitar" | "verificar" | "completado";

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onGoToRegister,
  onGoHome,
}) => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cuentaBloqueada, setCuentaBloqueada] = useState(false);

  // Estados del flujo real de recuperación por correo
  const [modalRecuperar, setModalRecuperar] = useState(false);
  const [pasoRecuperar, setPasoRecuperar] =
    useState<PasoRecuperacion>("solicitar");
  const [correoRecuperar, setCorreoRecuperar] = useState("");
  const [codigoOtp, setCodigoOtp] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
  const [cargandoRecuperar, setCargandoRecuperar] = useState(false);
  const [errorRecuperar, setErrorRecuperar] = useState<string | null>(null);

  const abrirModalRecuperacion = () => {
    setCorreoRecuperar(correo);
    setCodigoOtp("");
    setNuevaPassword("");
    setErrorRecuperar(null);
    setPasoRecuperar("solicitar");
    setModalRecuperar(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cuentaBloqueada) return;

    setErrorMsg(null);
    setCargando(true);

    try {
      const res = await authApi.login(correo.trim(), password);
      if (res?.token) {
        localStorage.setItem("smartcredit_token", res.token);
      }
      await onLoginSuccess(res.usuario.rol, res.usuario.correo, res.cliente);
    } catch (err) {
      const mensaje = (err as Error).message || "Error de autenticación.";
      if (/bloquead|intentos/i.test(mensaje)) {
        setCuentaBloqueada(true);
      }
      setErrorMsg(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const handleEnviarCodigo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!correoRecuperar.trim()) return;

    setErrorRecuperar(null);
    setCargandoRecuperar(true);

    try {
      await authApi.solicitarRecuperacion(correoRecuperar.trim());
      setPasoRecuperar("verificar");
    } catch (err) {
      setErrorRecuperar(
        (err as Error).message || "No fue posible enviar el código al correo.",
      );
    } finally {
      setCargandoRecuperar(false);
    }
  };

  const handleRestablecerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRecuperar(null);

    const passwordValida =
      nuevaPassword.length >= 8 &&
      /[A-Z]/.test(nuevaPassword) &&
      /\d/.test(nuevaPassword);

    if (!passwordValida) {
      setErrorRecuperar(
        "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula y un número.",
      );
      return;
    }

    setCargandoRecuperar(true);

    try {
      await authApi.restablecerPassword({
        correo: correoRecuperar.trim(),
        codigo: codigoOtp.trim(),
        nuevaPassword,
      });
      setPasoRecuperar("completado");
    } catch (err) {
      setErrorRecuperar(
        (err as Error).message || "No fue posible restablecer la contraseña.",
      );
    } finally {
      setCargandoRecuperar(false);
    }
  };

  return (
    <AuthShell onGoHome={onGoHome}>
      <div className="space-y-5">
        {/* Ícono superior */}
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
            cuentaBloqueada
              ? "bg-rose-50 text-rose-600"
              : "bg-[#F3E8FF] text-[#820AD1]"
          }`}
        >
          {cuentaBloqueada ? (
            <ShieldAlert size={20} strokeWidth={2} />
          ) : (
            <ShieldCheck size={20} strokeWidth={2} />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {cuentaBloqueada
              ? "Protegimos tu cuenta"
              : "Qué bueno tenerte aquí"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {cuentaBloqueada
              ? "Detectamos 3 intentos fallidos consecutivos. Verifica tu identidad por correo para volver a entrar."
              : "Ingresa a SmartCredit y consulta tu solicitud o mesa de control en un solo lugar."}
          </p>
        </div>

        {/* Tarjeta de bloqueo preventivo con acción inmediata */}
        {cuentaBloqueada ? (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 space-y-3 text-xs text-[#991B1B]">
            <div className="flex items-start gap-2.5">
              <Lock size={15} className="text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Acceso bloqueado preventivamente</p>
                <p className="text-[11px] text-[#B91C1C] mt-0.5 leading-relaxed">
                  Por seguridad bancaria, el inicio de sesión está pausado hasta
                  que restablezcas tu clave.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={abrirModalRecuperacion}
              className="w-full py-2.5 px-4 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Desbloquear con código al correo</span>
              <ArrowRight size={13} />
            </button>
          </div>
        ) : (
          errorMsg && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-3.5 text-xs text-[#991B1B]">
              <p className="font-bold">No pudimos iniciar sesión</p>
              <p className="text-[11px] text-[#B91C1C] mt-0.5">{errorMsg}</p>
            </div>
          )
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                autoComplete="email"
                required
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  if (cuentaBloqueada) {
                    setCuentaBloqueada(false);
                    setErrorMsg(null);
                  }
                }}
                placeholder="juan.perez@correo.com"
                className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
              />
              <Mail
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                tabIndex={-1}
              >
                {mostrarPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={abrirModalRecuperacion}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#820AD1] hover:underline cursor-pointer"
              >
                <span>Recuperar mi acceso</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          <div className="pt-1 space-y-2">
            {cuentaBloqueada ? (
              <>
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 rounded-full bg-[#F3F4F6] text-slate-400 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <span>Ingresar</span>
                  <Lock size={14} />
                </button>
                <p className="text-center text-[11px] text-slate-400">
                  Completa el desbloqueo por correo para habilitar el botón de
                  ingreso.
                </p>
              </>
            ) : (
              <button
                type="submit"
                disabled={cargando}
                className="w-full py-3.5 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <span>{cargando ? "Verificando acceso..." : "Ingresar"}</span>
                {!cargando && <ArrowRight size={14} />}
              </button>
            )}
          </div>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          ¿Aún no tienes cuenta?{" "}
          <button
            type="button"
            onClick={onGoToRegister}
            className="font-bold text-[#820AD1] hover:underline cursor-pointer"
          >
            Regístrate
          </button>
        </div>
      </div>

      {/* Modal de Recuperación Real por Correo con indicador de pasos */}
      {modalRecuperar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-[1px]">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center">
                  <KeyRound size={15} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recuperar acceso
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalRecuperar(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Indicador visual de 3 pasos */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
              <div
                className={`py-1.5 px-2 rounded-full text-center ${
                  pasoRecuperar === "solicitar"
                    ? "bg-[#820AD1] text-white"
                    : "bg-[#F3E8FF] text-[#820AD1]"
                }`}
              >
                1. Correo
              </div>
              <div
                className={`py-1.5 px-2 rounded-full text-center ${
                  pasoRecuperar === "verificar"
                    ? "bg-[#820AD1] text-white"
                    : pasoRecuperar === "completado"
                      ? "bg-[#F3E8FF] text-[#820AD1]"
                      : "bg-[#F3F4F6] text-slate-400"
                }`}
              >
                2. Código OTP
              </div>
              <div
                className={`py-1.5 px-2 rounded-full text-center ${
                  pasoRecuperar === "completado"
                    ? "bg-emerald-600 text-white"
                    : "bg-[#F3F4F6] text-slate-400"
                }`}
              >
                3. Listo
              </div>
            </div>

            {errorRecuperar && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-3 text-[11px] text-[#991B1B]">
                {errorRecuperar}
              </div>
            )}

            {pasoRecuperar === "solicitar" && (
              <form onSubmit={handleEnviarCodigo} className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ingresa tu correo registrado. Te enviaremos un código de
                  seguridad de 6 dígitos para restablecer tu contraseña y
                  desbloquear tu cuenta.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Correo registrado
                  </label>
                  <input
                    type="email"
                    required
                    value={correoRecuperar}
                    onChange={(e) => setCorreoRecuperar(e.target.value)}
                    placeholder="juan.perez@correo.com"
                    className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={cargandoRecuperar}
                  className="w-full py-3 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {cargandoRecuperar
                    ? "Enviando correo..."
                    : "Enviar código de verificación"}
                </button>
              </form>
            )}

            {pasoRecuperar === "verificar" && (
              <form
                onSubmit={handleRestablecerPassword}
                className="space-y-3.5"
              >
                <div className="bg-[#F8F5FF] border border-[#E9D5FF] rounded-2xl p-3 text-[11px] text-slate-700">
                  Enviamos un código de 6 dígitos a{" "}
                  <strong className="text-[#820AD1]">{correoRecuperar}</strong>.
                  Revisa tu bandeja de entrada o spam.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Código de verificación (6 dígitos)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={codigoOtp}
                    onChange={(e) =>
                      setCodigoOtp(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="000000"
                    className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-center font-mono text-base font-bold tracking-[0.4em] text-slate-900 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarNuevaPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={nuevaPassword}
                      onChange={(e) => setNuevaPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs rounded-2xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarNuevaPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {mostrarNuevaPassword ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mínimo 8 caracteres, una mayúscula y un número.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={cargandoRecuperar || codigoOtp.length !== 6}
                  className="w-full py-3 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {cargandoRecuperar
                    ? "Actualizando acceso..."
                    : "Restablecer contraseña y desbloquear"}
                </button>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorRecuperar(null);
                      setPasoRecuperar("solicitar");
                    }}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    Cambiar correo
                  </button>
                  <button
                    type="button"
                    disabled={cargandoRecuperar}
                    onClick={() => handleEnviarCodigo()}
                    className="inline-flex items-center gap-1 font-semibold text-[#820AD1] hover:underline cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Reenviar código</span>
                  </button>
                </div>
              </form>
            )}

            {pasoRecuperar === "completado" && (
              <div className="space-y-4">
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#065F46]">
                  <CheckCircle2
                    size={16}
                    className="text-[#059669] shrink-0 mt-0.5"
                  />
                  <p>
                    <strong>¡Acceso restablecido!</strong> Tu contraseña ha sido
                    actualizada y tu cuenta ya está desbloqueada.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCorreo(correoRecuperar);
                    setPassword("");
                    setCuentaBloqueada(false);
                    setErrorMsg(null);
                    setModalRecuperar(false);
                  }}
                  className="w-full py-3 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold cursor-pointer"
                >
                  Iniciar sesión ahora
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AuthShell>
  );
};
