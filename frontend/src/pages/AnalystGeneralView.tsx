import {
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Clock,
  Timer,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  AnalystLayout,
  type AnalystRoute,
} from "../components/ui/AnalystLayout";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { analystApi } from "../services/api";
import { formatCOP, type SolicitudCreditoData } from "../types/credit";

interface AnalystGeneralViewProps {
  solicitudCliente?: SolicitudCreditoData;
  onNavigate: (route: AnalystRoute) => void;
  onLogout: () => void;
}

interface SolicitudResumenRow {
  id: number;
  radicado: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  monto_solicitado: string | number;
  score_datacredito: number | null;
  estado: "En revisión" | "Aprobada" | "Rechazada";
  creado_en?: string;
}

export const AnalystGeneralView: React.FC<AnalystGeneralViewProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [kpis, setKpis] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
    volumen_aprobado: "0",
    score_promedio: 0,
  });
  const [solicitudes, setSolicitudes] = useState<SolicitudResumenRow[]>([]);

  useEffect(() => {
    Promise.all([analystApi.obtenerResumen(), analystApi.listarSolicitudes()])
      .then(([resumenRes, listaRes]) => {
        setKpis(resumenRes.kpis);
        setSolicitudes(
          (listaRes.solicitudes as unknown as SolicitudResumenRow[]) || [],
        );
      })
      .catch(() => {});
  }, []);

  const totalCalc = Math.max(
    1,
    kpis.aprobadas + kpis.pendientes + kpis.rechazadas,
  );
  const pctAprob = Math.round((kpis.aprobadas / totalCalc) * 100);
  const pctPend = Math.round((kpis.pendientes / totalCalc) * 100);
  const pctRech = Math.max(0, 100 - pctAprob - pctPend);

  // Gráfica de dona SVG
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashAprob = (pctAprob / 100) * circumference;
  const dashPend = (pctPend / 100) * circumference;
  const dashRech = (pctRech / 100) * circumference;

  // Actividad por franja horaria
  const barrasHorarias = useMemo(() => {
    const franjas = [
      { label: "08 h", count: 0 },
      { label: "09 h", count: 0 },
      { label: "10 h", count: 0 },
      { label: "11 h", count: 0 },
      { label: "12 h", count: 0 },
      { label: "13 h", count: 0 },
      { label: "14 h", count: 0 },
    ];
    solicitudes.forEach((s, idx) => {
      if (s.creado_en) {
        const h = new Date(s.creado_en).getHours();
        const slot = Math.min(6, Math.max(0, h - 8));
        franjas[slot].count += 1;
      } else {
        franjas[idx % franjas.length].count += 1;
      }
    });
    const maxVal = Math.max(1, ...franjas.map((f) => f.count));
    return franjas.map((f) => ({
      ...f,
      esPico: f.count === maxVal && f.count > 0,
      alturaPct: Math.max(18, Math.round((f.count / maxVal) * 100)),
    }));
  }, [solicitudes]);

  return (
    <AnalystLayout
      activeRoute="3A-analista-general"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#820AD1]">
              Mesa de control
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Una mirada a tu operación
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Prioriza las solicitudes y sigue el estado en tiempo real de la
              originación.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => onNavigate("3B-en-revision")}
            icon={<ArrowRight size={14} />}
          >
            Atender pendientes ({kpis.pendientes})
          </Button>
        </div>

        {/* 4 Tarjetas KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
          <button
            type="button"
            onClick={() => onNavigate("3B-en-revision")}
            className="bg-white border border-slate-200/80 rounded-3xl p-5 text-left shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:border-[#820AD1]/45 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Pendientes</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={15} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">
              {kpis.pendientes}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              En revisión manual
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("3C-aprobadas")}
            className="bg-white border border-slate-200/80 rounded-3xl p-5 text-left shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:border-[#820AD1]/45 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Aprobadas</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={15} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">
              {kpis.aprobadas}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Manuales y automáticas
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("3D-rechazadas")}
            className="bg-white border border-slate-200/80 rounded-3xl p-5 text-left shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:border-[#820AD1]/45 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Rechazadas</span>
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle size={15} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">
              {kpis.rechazadas}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Con causal registrada
            </p>
          </button>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">P95 Motor</span>
              <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center">
                <Timer size={15} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">
              &lt;3.5s
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Score promedio: {kpis.score_promedio} pts
            </p>
          </div>
        </div>

        {/* Fila de 2 Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Gráfica de Dona */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Distribución de solicitudes
              </h2>
              <Badge variant="purple">Consolidado</Badge>
            </div>

            <div className="flex items-center justify-around gap-4 my-5">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="16"
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="16"
                    strokeDasharray={`${dashAprob} ${circumference}`}
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="16"
                    strokeDasharray={`${dashPend} ${circumference}`}
                    strokeDashoffset={-dashAprob}
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="transparent"
                    stroke="#EF4444"
                    strokeWidth="16"
                    strokeDasharray={`${dashRech} ${circumference}`}
                    strokeDashoffset={-(dashAprob + dashPend)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center tabular-nums">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {kpis.total}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    solicitudes
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs tabular-nums">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    Aprobadas
                  </p>
                  <p className="font-bold text-slate-900 pl-4">
                    {kpis.aprobadas} · {pctAprob}%
                  </p>
                </div>
                <div>
                  <p className="inline-flex items-center gap-1.5 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    Pendientes
                  </p>
                  <p className="font-bold text-slate-900 pl-4">
                    {kpis.pendientes} · {pctPend}%
                  </p>
                </div>
                <div>
                  <p className="inline-flex items-center gap-1.5 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    Rechazadas
                  </p>
                  <p className="font-bold text-slate-900 pl-4">
                    {kpis.rechazadas} · {pctRech}%
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 tabular-nums border-t border-slate-100 pt-3">
              Total consolidado en mesa: {kpis.total} solicitudes evaluadas.
            </p>
          </div>

          {/* Gráfica de Barras de Actividad */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Actividad de radicación
                </h2>
                <p className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                  Solicitudes por franja horaria · {kpis.total} en total
                </p>
              </div>
              <Badge variant="purple">Hoy</Badge>
            </div>

            <div className="grid grid-cols-7 gap-3 items-end h-36 pt-6 px-2 tabular-nums">
              {barrasHorarias.map((b) => (
                <div
                  key={b.label}
                  className="flex flex-col items-center justify-end h-full gap-1.5"
                >
                  <span className="text-[10px] font-bold text-slate-600">
                    {b.count}
                  </span>
                  <div
                    className={`w-full max-w-[40px] rounded-t-xl transition-all ${
                      b.esPico ? "bg-[#820AD1]" : "bg-[#E9D5FF]"
                    }`}
                    style={{ height: `${b.alturaPct}%` }}
                  />
                  <span className="text-[10px] font-medium text-slate-400">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 pt-3 border-t border-slate-100">
              <BarChart2 size={13} className="text-[#820AD1]" />
              Distribución horaria de radicaciones recibidas en plataforma.
            </p>
          </div>
        </div>

        {/* Tabla Solicitudes Recientes */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Solicitudes recientes
              </h2>
              <p className="text-[11px] text-slate-400">
                Haz clic en cualquier fila para navegar a su bandeja de gestión
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onNavigate("3B-en-revision")}
              icon={<ArrowRight size={14} />}
            >
              Ver en revisión
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FB] text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-6">Radicado</th>
                  <th className="py-3 px-6">Cliente</th>
                  <th className="py-3 px-6 text-right">Monto solicitado</th>
                  <th className="py-3 px-6 text-center">Score</th>
                  <th className="py-3 px-6">Estado</th>
                  <th className="py-3 px-6 text-right">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs tabular-nums">
                {solicitudes.slice(0, 6).map((item) => {
                  const destino: AnalystRoute =
                    item.estado === "En revisión"
                      ? "3B-en-revision"
                      : item.estado === "Aprobada"
                        ? "3C-aprobadas"
                        : "3D-rechazadas";

                  return (
                    <tr
                      key={item.radicado}
                      onClick={() => onNavigate(destino)}
                      className="hover:bg-[#FAF5FF]/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {item.radicado}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-700">
                        {item.nombres} {item.apellidos}
                      </td>
                      <td className="py-3.5 px-6 text-right font-bold text-slate-900">
                        {formatCOP(Number(item.monto_solicitado))} COP
                      </td>
                      <td className="py-3.5 px-6 text-center font-bold text-slate-700">
                        {item.score_datacredito ?? "—"}
                      </td>
                      <td className="py-3.5 px-6">
                        {item.estado === "Aprobada" && (
                          <Badge variant="green">Aprobada</Badge>
                        )}
                        {item.estado === "En revisión" && (
                          <Badge variant="amber">En revisión</Badge>
                        )}
                        {item.estado === "Rechazada" && (
                          <Badge variant="red">Rechazada</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right text-slate-400">
                        {item.creado_en
                          ? new Date(item.creado_en).toLocaleTimeString(
                              "es-CO",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AnalystLayout>
  );
};
