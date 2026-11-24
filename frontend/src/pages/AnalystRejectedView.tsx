import { Search, TrendingDown, Wallet, XCircle } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  AnalystLayout,
  type AnalystRoute,
} from "../components/ui/AnalystLayout";
import { Badge } from "../components/ui/Badge";
import { analystApi } from "../services/api";
import { formatCOP, type SolicitudCreditoData } from "../types/credit";

interface AnalystRejectedViewProps {
  solicitudCliente?: SolicitudCreditoData;
  onNavigate: (route: AnalystRoute) => void;
  onLogout: () => void;
}

interface SolicitudRechazadaDB {
  radicado: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  monto_solicitado: string | number;
  excedente_neto: string | number;
  score_datacredito: number | null;
  causal_rechazo: string | null;
}

export const AnalystRejectedView: React.FC<AnalystRejectedViewProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [rechazadas, setRechazadas] = useState<SolicitudRechazadaDB[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCausa, setFiltroCausa] = useState<
    "Todas" | "Score" | "Capacidad"
  >("Todas");

  useEffect(() => {
    analystApi
      .listarSolicitudes("Rechazada")
      .then((res) =>
        setRechazadas(
          (res.solicitudes as unknown as SolicitudRechazadaDB[]) || [],
        ),
      )
      .catch(() => setRechazadas([]));
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return rechazadas.filter((item) => {
      const nombre = `${item.nombres} ${item.apellidos}`.toLowerCase();
      const causal = (item.causal_rechazo || "").toLowerCase();
      const coincideCausa =
        filtroCausa === "Todas" ||
        (filtroCausa === "Score" && causal.includes("score")) ||
        (filtroCausa === "Capacidad" && !causal.includes("score"));
      const coincideTxt =
        item.radicado.toLowerCase().includes(q) ||
        nombre.includes(q) ||
        item.cedula.toLowerCase().includes(q);
      return coincideCausa && coincideTxt;
    });
  }, [rechazadas, busqueda, filtroCausa]);

  const porScore = rechazadas.filter((r) =>
    (r.causal_rechazo || "").toLowerCase().includes("score"),
  ).length;
  const porCapacidad = rechazadas.length - porScore;

  return (
    <AnalystLayout
      activeRoute="3D-rechazadas"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#820AD1]">
            Mesa de control
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Decisiones claras, causas visibles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consulta el detalle auditable de las solicitudes que no cumplieron
            los criterios de riesgo.
          </p>
        </div>

        {/* 3 Tarjetas KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Total rechazadas</span>
              <div className="w-8 h-8 rounded-xl bg-red-50 text-[#EF4444] flex items-center justify-center">
                <XCircle size={15} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">
              {rechazadas.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Decisiones auditables
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Score inferior a 600</span>
              <div className="w-8 h-8 rounded-xl bg-red-50 text-[#EF4444] flex items-center justify-center">
                <TrendingDown size={15} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">
              {porScore}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Por debajo del umbral mínimo
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Capacidad o criterio</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
                <Wallet size={15} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">
              {porCapacidad}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Excedente 30% o dictamen manual
            </p>
          </div>
        </div>

        {/* Tabla principal */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Historial de rechazos
              </h2>
              <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                {filtradas.length} resultados
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por radicado, nombre o cédula"
                  className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
                />
              </div>

              <select
                value={filtroCausa}
                onChange={(e) =>
                  setFiltroCausa(
                    e.target.value as "Todas" | "Score" | "Capacidad",
                  )
                }
                className="bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs rounded-2xl px-4 py-3 font-semibold text-slate-700 outline-none transition-all"
              >
                <option value="Todas">Todas las causas</option>
                <option value="Score">Score inferior a 600</option>
                <option value="Capacidad">Capacidad / dictamen</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FB] text-[11px] font-semibold text-slate-400 border-y border-slate-100">
                  <th className="py-3 px-5">Radicado</th>
                  <th className="py-3 px-5">Cliente</th>
                  <th className="py-3 px-5 text-right">Monto solicitado</th>
                  <th className="py-3 px-5 text-center">Score</th>
                  <th className="py-3 px-5 text-right">Excedente COP</th>
                  <th className="py-3 px-5">Causa de rechazo</th>
                  <th className="py-3 px-5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs tabular-nums">
                {filtradas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-slate-400 text-xs"
                    >
                      No se encontraron solicitudes rechazadas con los filtros
                      aplicados.
                    </td>
                  </tr>
                ) : (
                  filtradas.map((item) => (
                    <tr key={item.radicado} className="hover:bg-slate-50/80">
                      <td className="py-4 px-5 font-bold text-slate-900">
                        {item.radicado}
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-700">
                        {item.nombres} {item.apellidos}
                      </td>
                      <td className="py-4 px-5 text-right font-bold text-slate-900">
                        {formatCOP(Number(item.monto_solicitado))} COP
                      </td>
                      <td className="py-4 px-5 text-center font-bold text-slate-700">
                        {item.score_datacredito ?? "—"}
                      </td>
                      <td className="py-4 px-5 text-right font-semibold text-slate-700">
                        {formatCOP(Number(item.excedente_neto))}
                      </td>
                      <td className="py-4 px-5 text-slate-600 max-w-xs leading-relaxed">
                        {item.causal_rechazo ||
                          "Causal registrada en evaluación"}
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant="red">Rechazada</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AnalystLayout>
  );
};
