import {
  ArrowRight,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  IdCard,
  Mail,
  Smartphone,
  UserPlus,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { AuthShell } from "../components/ui/AuthShell";
import { DataPolicyModal } from "../components/ui/DataPolicyModal";
import { authApi } from "../services/api";

interface RegisterViewProps {
  correoInicial?: string;
  onRegisterSuccess: (datosRegistro: {
    cedula: string;
    nombres: string;
    apellidos: string;
    celular: string;
    correo: string;
  }) => void;
  onGoToLogin: () => void;
  onGoHome?: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  correoInicial = "",
  onRegisterSuccess,
  onGoToLogin,
  onGoHome,
}) => {
  const [cedula, setCedula] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [celular, setCelular] = useState("");
  const [correo, setCorreo] = useState(correoInicial);
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [aceptoPolitica, setAceptoPolitica] = useState(false);
  const [modalPoliticaAbierto, setModalPoliticaAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (correoInicial) {
      setCorreo(correoInicial);
    }
  }, [correoInicial]);

  const cumpleLongitud = password.length >= 8;
  const cumpleMayuscula = /[A-Z]/.test(password);
  const cumpleNumero = /\d/.test(password);
  const passwordValida = cumpleLongitud && cumpleMayuscula && cumpleNumero;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceptoPolitica) return;

    if (!passwordValida) {
      setErrorMsg(
        "La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número.",
      );
      return;
    }

    setErrorMsg(null);
    setCargando(true);

    try {
      const cedulaLimpia = cedula.replace(/\./g, "").trim();
      const res = await authApi.register({
        cedula: cedulaLimpia,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        celular: celular.trim(),
        correo: correo.trim(),
        password,
      });

      if (res?.token) {
        localStorage.setItem("smartcredit_token", res.token);
      }

      onRegisterSuccess({
        cedula: cedulaLimpia,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        celular: celular.trim(),
        correo: correo.trim(),
      });
    } catch (err) {
      setErrorMsg(
        (err as Error).message || "No fue posible completar el registro.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthShell onGoHome={onGoHome}>
      <div className="space-y-5">
        <div className="w-11 h-11 rounded-2xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center">
          <UserPlus size={20} strokeWidth={2} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            El primer paso es conocerte
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Crea tu cuenta para empezar tu solicitud. Ten tu documento de
            identidad a la mano.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-3.5 text-xs text-[#991B1B]">
            <p className="font-bold">Revisa tus datos</p>
            <p className="text-[11px] text-[#B91C1C] mt-0.5">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Cédula de ciudadanía
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="1.098.765.432"
                className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#820AD1]/15 tabular-nums transition-all"
              />
              <IdCard
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Nombres
              </label>
              <input
                type="text"
                required
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Juan"
                className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Apellidos
              </label>
              <input
                type="text"
                required
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Pérez"
                className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Celular
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="300 456 7890"
                className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#820AD1]/15 tabular-nums transition-all"
              />
              <Smartphone
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

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
                onChange={(e) => setCorreo(e.target.value)}
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••"
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

            {/* Píldoras interactivas de requisitos de contraseña */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                  cumpleLongitud
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-[#F3F4F6] text-slate-400"
                }`}
              >
                {cumpleLongitud && <Check size={10} />}
                <span>8+ caracteres</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                  cumpleMayuscula
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-[#F3F4F6] text-slate-400"
                }`}
              >
                {cumpleMayuscula && <Check size={10} />}
                <span>1 mayúscula</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                  cumpleNumero
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-[#F3F4F6] text-slate-400"
                }`}
              >
                {cumpleNumero && <Check size={10} />}
                <span>1 número</span>
              </span>
            </div>
          </div>

          {/* Autorización de tratamiento de datos */}
          <div className="pt-1 bg-[#F8F5FF] border border-[#E9D5FF]/80 rounded-2xl p-3.5">
            <div className="flex items-start gap-2.5">
              <input
                id="check-politica-datos"
                type="checkbox"
                checked={aceptoPolitica}
                onChange={(e) => setAceptoPolitica(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#820AD1] cursor-pointer shrink-0"
              />
              <div className="text-[11px] leading-relaxed">
                <label
                  htmlFor="check-politica-datos"
                  className="block text-xs font-bold text-slate-900 cursor-pointer"
                >
                  Autorizo el tratamiento de datos personales y consulta en
                  centrales
                </label>
                <span className="text-slate-500 block mt-0.5">
                  Acepto la política de privacidad conforme a la Ley 1581 de
                  2012 y Ley 1266 de 2008.
                </span>
                <button
                  type="button"
                  onClick={() => setModalPoliticaAbierto(true)}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#820AD1] hover:underline cursor-pointer"
                >
                  <span>Ver autorización y política completa</span>
                  <ExternalLink size={11} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={cargando || !aceptoPolitica}
              className="w-full py-3.5 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <span>
                {cargando ? "Creando cuenta..." : "Crear Cuenta y Continuar"}
              </span>
              {!cargando && <ArrowRight size={14} />}
            </button>
          </div>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            onClick={onGoToLogin}
            className="font-bold text-[#820AD1] hover:underline cursor-pointer"
          >
            Iniciar sesión
          </button>
        </div>
      </div>

      {/* Ventana detallada de Política y Autorización */}
      <DataPolicyModal
        abierto={modalPoliticaAbierto}
        onCerrar={() => setModalPoliticaAbierto(false)}
        onAceptar={() => setAceptoPolitica(true)}
      />
    </AuthShell>
  );
};
