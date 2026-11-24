import {
  Award,
  Check,
  Clock,
  DollarSign,
  Download,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  AnalystLayout,
  type AnalystRoute,
} from "../components/ui/AnalystLayout";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { analystApi } from "../services/api";
import { formatCOP, type SolicitudCreditoData } from "../types/credit";

interface AnalystAnalyticsViewProps {
  solicitudCliente?: SolicitudCreditoData;
  onNavigate: (route: AnalystRoute) => void;
  onLogout: () => void;
}

export const AnalystAnalyticsView: React.FC<AnalystAnalyticsViewProps> = ({
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
  const [plazos, setPlazos] = useState<
    Array<{ plazo_meses: number; cantidad: number; ticket_promedio: string }>
  >([]);
  const [exportado, setExportado] = useState(false);

  useEffect(() => {
    analystApi
      .obtenerResumen()
      .then((res) => {
        setKpis(res.kpis);
        setPlazos(res.distribucionPlazos || []);
      })
      .catch(() => {});
  }, []);

  const tasaAprobacion =
    kpis.total > 0 ? ((kpis.aprobadas / kpis.total) * 100).toFixed(1) : "0.0";

  const tasaRechazo =
    kpis.total > 0 ? ((kpis.rechazadas / kpis.total) * 100).toFixed(1) : "0.0";

  const handleExportCSV = () => {
    const filas = [
      ["Indicador", "Valor"],
      ["Total solicitudes", String(kpis.total)],
      ["Aprobadas", String(kpis.aprobadas)],
      ["Pendientes", String(kpis.pendientes)],
      ["Rechazadas", String(kpis.rechazadas)],
      ["Tasa de aprobacion (%)", `${tasaAprobacion}%`],
      ["Volumen aprobado (COP)", String(kpis.volumen_aprobado)],
      ["Score promedio", String(kpis.score_promedio)],
    ];
    const csv = "\uFEFF" + filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Reporte_Analitica_SmartCredit.csv";
    a.click();
    URL.revokeObjectURL(url);
    setExportado(true);
    setTimeout(() => setExportado(false), 3000);
  };

  return (
    <AnalystLayout
      activeRoute="3E-analitica"
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
              Reportes y analítica de originación
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Métricas consolidadas de colocación, riesgo crediticio y plazos
              solicitados.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleExportCSV}
            icon={exportado ? <Check size={14} /> : <Download size={14} />}
          >
            {exportado ? "Reporte descargado" : "Exportar CSV"}
          </Button>
        </div>

        {/* 4 Tarjetas KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Volumen originado</span>
              <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center">
                <DollarSign size={15} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-3">
              {formatCOP(Number(kpis.volumen_aprobado))}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Pesos colombianos</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Tasa de aprobación</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
                <TrendingUp size={15} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#059669] mt-3">
              {tasaAprobacion}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {kpis.aprobadas} de {kpis.total} solicitudes
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Score promedio</span>
              <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center">
                <Award size={15} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-3">
              {kpis.score_promedio} pts
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Escala 300 – 950</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">En revisión manual</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center">
                <Clock size={15} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-3">
              {kpis.pendientes}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Pendientes por dictamen
            </p>
          </div>
        </div>

        {/* Barra de conversión de cartera */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-3 tabular-nums">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Conversión del embudo de crédito
              </h2>
              <p className="text-[11px] text-slate-400">
                Proporción consolidada entre aprobaciones, revisión manual y
                rechazos
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <Badge variant="green">Aprobación {tasaAprobacion}%</Badge>
              <Badge variant="red">Rechazo {tasaRechazo}%</Badge>
            </div>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
            {kpis.total > 0 && (
              <>
                <div
                  style={{ width: `${(kpis.aprobadas / kpis.total) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                />
                <div
                  style={{ width: `${(kpis.pendientes / kpis.total) * 100}%` }}
                  className="bg-amber-400 h-full transition-all"
                />
                <div
                  style={{ width: `${(kpis.rechazadas / kpis.total) * 100}%` }}
                  className="bg-red-500 h-full transition-all"
                />
              </>
            )}
          </div>
        </div>

        {/* Tabla de distribución por plazo */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Distribución por plazo solicitado
            </h2>
            <span className="text-[11px] text-slate-400">
              Ticket promedio por horizonte
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FB] text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-6">Plazo</th>
                  <th className="py-3 px-6">Solicitudes</th>
                  <th className="py-3 px-6">Participación</th>
                  <th className="py-3 px-6 text-right">Ticket promedio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs tabular-nums">
                {plazos.map((p) => {
                  const pct =
                    kpis.total > 0
                      ? Math.round((p.cantidad / kpis.total) * 100)
                      : 0;
                  return (
                    <tr key={p.plazo_meses} className="hover:bg-slate-50/80">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {p.plazo_meses} meses
                      </td>
                      <td className="py-4 px-6 text-slate-600">{p.cantidad}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-36 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#820AD1] rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        {formatCOP(Number(p.ticket_promedio))} COP
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
