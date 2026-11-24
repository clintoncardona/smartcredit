import {
  BarChart3,
  Bell,
  CheckCircle2,
  FileSearch,
  HelpCircle,
  LayoutGrid,
  LogOut,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { AnalystGuideModal } from "./AnalystGuideModal";

export type AnalystRoute =
  | "3A-analista-general"
  | "3B-en-revision"
  | "3C-aprobadas"
  | "3D-rechazadas"
  | "3E-analitica";

interface AnalystLayoutProps {
  activeRoute: AnalystRoute;
  onNavigate: (route: AnalystRoute) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AnalystLayout: React.FC<AnalystLayoutProps> = ({
  activeRoute,
  onNavigate,
  onLogout,
  children,
}) => {
  const [guiaAbierta, setGuiaAbierta] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const navItems: Array<{
    route: AnalystRoute;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      route: "3A-analista-general",
      label: "General",
      icon: <LayoutGrid size={16} strokeWidth={1.9} />,
    },
    {
      route: "3B-en-revision",
      label: "En revisión",
      icon: <FileSearch size={16} strokeWidth={1.9} />,
    },
    {
      route: "3C-aprobadas",
      label: "Aprobadas",
      icon: <CheckCircle2 size={16} strokeWidth={1.9} />,
    },
    {
      route: "3D-rechazadas",
      label: "Rechazadas",
      icon: <XCircle size={16} strokeWidth={1.9} />,
    },
    {
      route: "3E-analitica",
      label: "Reportes y analítica",
      icon: <BarChart3 size={16} strokeWidth={1.9} />,
    },
  ];

  const rutaActualLabel =
    navItems.find((item) => item.route === activeRoute)?.label || "General";

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-900 flex selection:bg-[#820AD1] selection:text-white">
      {/* Sidebar izquierdo estilo SmartCredit */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200/80 flex-col justify-between p-5 shrink-0 sticky top-0 h-screen">
        <div className="space-y-7">
          {/* Marca */}
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-9 h-9 rounded-2xl bg-[#820AD1] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              BA
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-[#820AD1] tracking-tight">
                Banco Andino
              </p>
              <p className="text-[11px] text-slate-400 font-semibold">
                SmartCredit · Riesgo
              </p>
            </div>
          </div>

          {/* Navegación principal */}
          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Mesa de control
            </p>
            {navItems.map((item) => {
              const active = activeRoute === item.route;
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => onNavigate(item.route)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                    active
                      ? "bg-[#F3E8FF] text-[#820AD1] font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-[#F5F6F8] hover:text-slate-900 font-medium"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#820AD1]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bloque inferior de soporte y cierre de sesión */}
        <div className="space-y-3.5">
          <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-3xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#820AD1] text-white flex items-center justify-center shadow-2xs">
              <HelpCircle size={15} strokeWidth={2} />
            </div>
            <p className="text-xs font-bold text-slate-900">
              ¿Necesitas ayuda?
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Consulta las políticas de score, capacidad de pago y validación
              documental.
            </p>
            <button
              type="button"
              onClick={() => setGuiaAbierta(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#820AD1] hover:underline cursor-pointer pt-0.5"
            >
              <span>Ver guía de analistas →</span>
            </button>
          </div>

          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400">
            <span>Banco Andino · 2026</span>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-slate-600 hover:text-[#DC2626] hover:bg-red-50 font-semibold transition-colors cursor-pointer"
            >
              <LogOut size={12} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Contenedor derecho */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header superior */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-900">SmartCredit</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 hidden sm:inline">
              Mesa de control
            </span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="font-semibold text-[#820AD1]">
              {rutaActualLabel}
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Centro de alertas operativo */}
            <button
              type="button"
              onClick={() => setNotificacionesAbiertas((prev) => !prev)}
              className="relative p-2 rounded-full bg-[#F5F6F8] text-slate-600 hover:text-[#820AD1] hover:bg-[#F3E8FF] transition-colors cursor-pointer"
              title="Avisos operativos"
            >
              <Bell size={16} strokeWidth={1.9} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#820AD1]" />
            </button>

            {notificacionesAbiertas && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200/90 rounded-3xl shadow-xl p-4 space-y-3 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-bold text-slate-900">
                    Estado del motor de riesgo
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    En línea
                  </span>
                </div>
                <div className="space-y-2 text-[11px] text-slate-600">
                  <div className="rounded-2xl bg-[#F5F6F8] p-3 flex items-start gap-2.5">
                    <ShieldCheck
                      size={15}
                      className="text-[#820AD1] shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-900">
                        Consulta Datacrédito activa
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        Casos con score entre 600 y 699 se enrutan
                        automáticamente a revisión manual.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotificacionesAbiertas(false);
                    onNavigate("3B-en-revision");
                  }}
                  className="w-full py-2 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Ir a bandeja en revisión
                </button>
              </div>
            )}

            <div className="flex items-center gap-2.5 bg-[#F5F6F8] pl-1.5 pr-3 py-1 rounded-full">
              <div className="w-7 h-7 rounded-full bg-[#820AD1] text-white font-extrabold text-[11px] flex items-center justify-center">
                CG
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs font-bold text-slate-900">Carlos Gómez</p>
                <p className="text-[10px] text-slate-500 tabular-nums">
                  ANAL-089 · Analista Senior
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="md:hidden px-3 py-1.5 rounded-full bg-[#F3E8FF] text-xs font-bold text-[#820AD1]"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Navegación móvil */}
        <div className="md:hidden bg-white border-b border-slate-200/80 px-4 py-2.5 flex gap-1.5 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.route}
              type="button"
              onClick={() => onNavigate(item.route)}
              className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                activeRoute === item.route
                  ? "bg-[#820AD1] text-white font-bold"
                  : "bg-[#F3F4F6] text-slate-600 font-medium"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-7">
          {children}
        </main>
      </div>

      <AnalystGuideModal
        abierto={guiaAbierta}
        onCerrar={() => setGuiaAbierta(false)}
      />
    </div>
  );
};
