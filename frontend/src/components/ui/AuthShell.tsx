import { ArrowLeft, HelpCircle, Lock, ShieldCheck, X } from "lucide-react";
import React, { useState } from "react";
import { DataPolicyModal } from "./DataPolicyModal";

interface AuthShellProps {
  children: React.ReactNode;
  onGoHome?: () => void;
}

export const AuthShell: React.FC<AuthShellProps> = ({ children, onGoHome }) => {
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const [politicaAbierta, setPoliticaAbierta] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-900 flex flex-col justify-between selection:bg-[#820AD1] selection:text-white">
      {/* Encabezado minimalista homologado */}
      <header className="w-full max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-[#820AD1] text-white flex items-center justify-center font-extrabold text-xs shadow-xs group-hover:bg-[#6D08B0] transition-colors">
            BA
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold text-[#820AD1] tracking-tight block">
              Banco Andino S.A.
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase block">
              SmartCredit
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:border-[#820AD1]/40 hover:text-[#820AD1] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Volver al inicio</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setAyudaAbierta(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F3E8FF]/80 hover:bg-[#F3E8FF] text-xs font-bold text-[#820AD1] transition-colors cursor-pointer"
          >
            <HelpCircle size={14} strokeWidth={2.2} />
            <span>Centro de ayuda</span>
          </button>
        </div>
      </header>

      {/* Tarjeta central */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-[448px] bg-white border border-slate-200/80 rounded-3xl shadow-[0_8px_32px_rgba(15,23,42,0.05)] p-7 sm:p-9">
          {children}
        </div>

        <p className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck size={13} className="text-[#820AD1]" />
          <span>Conexión cifrada · Tus datos siempre protegidos.</span>
        </p>
      </main>

      {/* Pie de página global */}
      <footer className="w-full max-w-7xl mx-auto px-5 md:px-10 py-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <span>© 2026 Banco Andino S.A. · SmartCredit</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPoliticaAbierta(true)}
            className="hover:text-[#820AD1] hover:underline transition-colors cursor-pointer"
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
            Seguridad 24/7
          </span>
        </div>
      </footer>

      {/* Modal Centro de Ayuda */}
      {ayudaAbierta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Centro de ayuda · SmartCredit
              </h3>
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
                  Bloqueo preventivo de seguridad
                </strong>
                Si superas 3 intentos fallidos, bloqueamos temporalmente tu
                acceso. Puedes desbloquearlo al instante solicitando un código
                OTP a tu correo.
              </div>
              <div className="rounded-2xl bg-[#F5F6F8] p-3.5">
                <strong className="text-slate-900 block mb-0.5">
                  Documentos para tu solicitud
                </strong>
                Ten a la mano tu cédula por ambas caras y tu certificado laboral
                o desprendible vigente en PDF o JPG (máx. 5 MB).
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAyudaAbierta(false)}
              className="w-full py-2.5 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal Política de Datos */}
      <DataPolicyModal
        abierto={politicaAbierta}
        onCerrar={() => setPoliticaAbierta(false)}
      />
    </div>
  );
};
