import {
  Check,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { formatCOP } from "../../types/credit";
import { Badge } from "./Badge";
import { DataPolicyModal } from "./DataPolicyModal";

interface WizardShellProps {
  currentStep: 1 | 2 | 3 | 4;
  eyebrow?: string;
  title: string;
  subtitle: string;
  userName: string;
  radicado?: string;
  estadoBadge?: string;
  montoSolicitado: number;
  plazoMeses: number;
  excedenteNeto?: number;
  cuotaMaxima?: number;
  showFinancialSummary?: boolean;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const WizardShell: React.FC<WizardShellProps> = ({
  currentStep,
  eyebrow = "TU CRÉDITO, PASO A PASO",
  title,
  subtitle,
  userName,
  radicado,
  estadoBadge = "En preparación",
  montoSolicitado,
  plazoMeses,
  excedenteNeto,
  cuotaMaxima,
  showFinancialSummary = false,
  onLogout,
  children,
}) => {
  const [ocultarCifras, setOcultarCifras] = useState(false);
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const [politicaAbierta, setPoliticaAbierta] = useState(false);

  const steps = [
    { num: 1, label: "Datos personales" },
    { num: 2, label: "Info financiera" },
    { num: 3, label: "Soportes" },
    { num: 4, label: "Confirmación" },
  ];

  const iniciales =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "CL";

  const mostrarMonto = (valor: number) =>
    ocultarCifras ? "$ •••••••" : formatCOP(valor);

  const progresoPorcentaje = Math.round((currentStep / steps.length) * 100);

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-900 flex flex-col selection:bg-[#820AD1] selection:text-white">
      {/* Barra superior sólida púrpura homologada con el ecosistema SmartCredit */}
      <header className="bg-[#820AD1] text-white h-16 px-4 md:px-8 flex items-center sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-[#820AD1] flex items-center justify-center font-extrabold text-xs shadow-xs">
              BA
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold tracking-tight block">
                Banco Andino S.A.
              </span>
              <span className="text-[10px] font-semibold text-purple-200 tracking-wide uppercase block">
                SmartCredit · Solicitud
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <button
              type="button"
              onClick={() => setAyudaAbierta(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold transition-colors cursor-pointer"
            >
              <HelpCircle size={14} />
              <span className="hidden sm:inline">Ayuda</span>
            </button>

            <div className="inline-flex items-center gap-2 bg-white/12 px-3 py-1.5 rounded-full border border-white/15">
              <span className="w-6 h-6 rounded-full bg-white text-[#820AD1] font-extrabold text-[10px] flex items-center justify-center">
                {iniciales}
              </span>
              <span className="font-semibold hidden md:inline max-w-[150px] truncate">
                {userName || "Cliente"}
              </span>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Salir al inicio"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Cabecera de paso + Stepper moderno */}
      <div className="max-w-6xl w-full mx-auto px-4 md:px-8 pt-7 pb-5 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#820AD1]">
              {eyebrow}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="purple">Paso {currentStep} de 4</Badge>
            <span className="text-[11px] font-bold text-slate-400 tabular-nums">
              {progresoPorcentaje}%
            </span>
          </div>
        </div>

        {/* Stepper visual en píldoras */}
        <div className="bg-white border border-slate-200/75 rounded-2xl p-3 sm:p-4 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {steps.map((step) => {
              const completado = step.num < currentStep;
              const activo = step.num === currentStep;
              return (
                <div
                  key={step.num}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                    activo
                      ? "bg-[#F3E8FF]/80 border border-[#E9D5FF]"
                      : completado
                        ? "bg-[#F8FAFC]"
                        : "opacity-60"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 transition-colors ${
                      completado || activo
                        ? "bg-[#820AD1] text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {completado ? (
                      <Check size={13} strokeWidth={2.5} />
                    ) : (
                      step.num
                    )}
                  </div>
                  <span
                    className={`text-xs truncate ${
                      activo
                        ? "font-bold text-[#820AD1]"
                        : completado
                          ? "font-semibold text-slate-800"
                          : "text-slate-400 font-medium"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cuerpo principal 2 columnas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-5">{children}</div>

        {/* Columna derecha: Tu solicitud + Estamos para acompañarte */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-22">
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_6px_24px_rgba(15,23,42,0.04)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center">
                  <FileText size={15} strokeWidth={2} />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Tu solicitud
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOcultarCifras((prev) => !prev)}
                title={ocultarCifras ? "Mostrar cifras" : "Ocultar cifras"}
                aria-label={ocultarCifras ? "Mostrar cifras" : "Ocultar cifras"}
                className="w-8 h-8 rounded-full bg-[#F3F4F6] hover:bg-[#F3E8FF] text-slate-600 hover:text-[#820AD1] flex items-center justify-center transition-colors cursor-pointer"
              >
                {ocultarCifras ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div>
              <Badge variant="purple">
                {radicado && currentStep === 4
                  ? `Radicado ${radicado}`
                  : estadoBadge}
              </Badge>
            </div>

            <div className="bg-[#F8F5FF] border border-[#E9D5FF]/80 rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-slate-500">
                Monto solicitado
              </p>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums mt-0.5">
                {montoSolicitado > 0 ? mostrarMonto(montoSolicitado) : "$ 0"}
              </p>
              <p className="text-[11px] text-[#820AD1] font-medium mt-0.5">
                Pesos colombianos · COP
              </p>
            </div>

            <div className="space-y-2.5 text-xs tabular-nums">
              <div className="flex justify-between">
                <span className="text-slate-500">Plazo elegido</span>
                <span className="font-bold text-slate-900">
                  {plazoMeses > 0 ? `${plazoMeses} meses` : "36 meses"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 shrink-0">Solicitante</span>
                <span className="font-bold text-slate-900 truncate">
                  {userName || "Por diligenciar"}
                </span>
              </div>

              {showFinancialSummary && (
                <>
                  <div className="border-t border-slate-100 pt-2.5 flex justify-between">
                    <span className="text-slate-500">Excedente neto</span>
                    <span className="font-bold text-slate-900">
                      {mostrarMonto(excedenteNeto ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cuota máxima 30%</span>
                    <span className="font-bold text-[#820AD1]">
                      {mostrarMonto(cuotaMaxima ?? 0)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
              {currentStep === 4
                ? "Número reservado. Tu solicitud se enviará únicamente al confirmar la radicación."
                : "Aún no has enviado la solicitud. La evaluación comenzará después de radicar."}
            </p>
          </div>

          {/* Tarjeta inferior lavanda "Estamos para acompañarte" */}
          <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-3xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#820AD1] text-white flex items-center justify-center shrink-0">
              <Info size={16} strokeWidth={2} />
            </div>
            <div className="text-xs">
              <p className="font-bold text-[#820AD1]">
                Estamos para acompañarte
              </p>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                Revisa tus datos con calma. Puedes regresar a pasos anteriores
                antes de radicar tu solicitud.
              </p>
            </div>
          </div>
        </aside>
      </main>

      {/* Pie de página global */}
      <footer className="max-w-6xl w-full mx-auto px-4 md:px-8 py-5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <span>© 2026 Banco Andino S.A. · SmartCredit</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPoliticaAbierta(true)}
            className="hover:text-[#820AD1] hover:underline cursor-pointer"
          >
            Política de tratamiento de datos
          </button>
          <button
            type="button"
            onClick={() => setAyudaAbierta(true)}
            className="font-semibold text-[#820AD1] hover:underline cursor-pointer"
          >
            ¿Necesitas ayuda?
          </button>
          <span className="inline-flex items-center gap-1">
            <Lock size={11} />
            Conexión segura
          </span>
        </div>
      </footer>

      {/* Modal de Ayuda Rápida */}
      {ayudaAbierta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#820AD1]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Guía rápida de radicación
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAyudaAbierta(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="rounded-2xl bg-[#F5F6F8] p-3.5">
                <strong className="text-slate-900 block mb-0.5">
                  Regla prudencial del 30%
                </strong>
                Para proteger tu flujo mensual, evaluamos que la cuota no supere
                el 30% de tu excedente libre (ingresos menos egresos, arriendo y
                obligaciones).
              </div>
              <div className="rounded-2xl bg-[#F5F6F8] p-3.5">
                <strong className="text-slate-900 block mb-0.5">
                  Soportes requeridos
                </strong>
                Adjunta tu cédula legible por ambas caras y tu certificado
                laboral o desprendible de nómina vigente en PDF o JPG (máx. 5
                MB).
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAyudaAbierta(false)}
              className="w-full py-2.5 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold cursor-pointer"
            >
              Continuar con mi solicitud
            </button>
          </div>
        </div>
      )}

      {/* Modal de Política de Datos */}
      <DataPolicyModal
        abierto={politicaAbierta}
        onCerrar={() => setPoliticaAbierta(false)}
      />
    </div>
  );
};
