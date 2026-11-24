import { CheckCircle2, Search, UserCheck, X, Zap } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  AnalystLayout,
  type AnalystRoute,
} from "../components/ui/AnalystLayout";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { analystApi } from "../services/api";
import { formatCOP, type SolicitudCreditoData } from "../types/credit";

interface AnalystApprovedViewProps {
  solicitudCliente?: SolicitudCreditoData;
  onNavigate: (route: AnalystRoute) => void;
  onLogout: () => void;
}

interface SolicitudAprobadaDB {
  radicado: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  monto_solicitado: string | number;
  plazo_meses: number;
  cuota_estimada: string | number;
  score_datacredito: number | null;
  modalidad_decision: "Automática" | "Manual" | null;
  observacion_analista: string | null;
  numero_contrato: string | null;
  firmado_digitalmente: boolean | null;
  firma_base64: string | null;
  creado_en?: string;
}

export const AnalystApprovedView: React.FC<AnalystApprovedViewProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [aprobadas, setAprobadas] = useState<SolicitudAprobadaDB[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState<
    "Todas" | "Automática" | "Manual"
  >("Todas");
  const [detalle, setDetalle] = useState<SolicitudAprobadaDB | null>(null);

  useEffect(() => {
    analystApi
      .listarSolicitudes("Aprobada")
      .then((res) =>
        setAprobadas(
          (res.solicitudes as unknown as SolicitudAprobadaDB[]) || [],
        ),
      )
      .catch(() => setAprobadas([]));
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return aprobadas.filter((item) => {
      const nombre = `${item.nombres} ${item.apellidos}`.toLowerCase();
      const mod = item.modalidad_decision || "Automática";
      const coincideMod =
        filtroModalidad === "Todas" || mod === filtroModalidad;
      const coincideTxt =
        item.radicado.toLowerCase().includes(q) ||
        nombre.includes(q) ||
        item.cedula.toLowerCase().includes(q);
      return coincideMod && coincideTxt;
    });
  }, [aprobadas, busqueda, filtroModalidad]);

  const autoCount = aprobadas.filter(
    (a) => (a.modalidad_decision || "Automática") === "Automática",
  ).length;
  const manualCount = aprobadas.filter(
    (a) => a.modalidad_decision === "Manual",
  ).length;

  return (
    <AnalystLayout
      activeRoute="3C-aprobadas"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#820AD1]">
            Mesa de control
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Solicitudes que siguen adelante
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consulta las aprobaciones, contratos generados y firmas digitales
            manuscritas.
          </p>
        </div>

        {/* 3 Tarjetas KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Total aprobadas</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
                <CheckCircle2 size={15} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">
              {aprobadas.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Aprobaciones vigentes
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Aprobación automática</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
                <Zap size={15} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">
              {autoCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Score ≥ 700 pts</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Aprobación manual</span>
              <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center">
                <UserCheck size={15} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">
              {manualCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Con dictamen de un analista
            </p>
          </div>
        </div>

        {/* Tabla principal */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Cartera aprobada
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
                value={filtroModalidad}
                onChange={(e) =>
                  setFiltroModalidad(
                    e.target.value as "Todas" | "Automática" | "Manual",
                  )
                }
                className="bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs rounded-2xl px-4 py-3 font-semibold text-slate-700 outline-none transition-all"
              >
                <option value="Todas">Todas las modalidades</option>
                <option value="Automática">Automática</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FB] text-[11px] font-semibold text-slate-400 border-y border-slate-100">
                  <th className="py-3 px-5">Radicado</th>
                  <th className="py-3 px-5">Cliente</th>
                  <th className="py-3 px-5 text-right">Monto aprobado</th>
                  <th className="py-3 px-5 text-center">Plazo</th>
                  <th className="py-3 px-5 text-center">Score</th>
                  <th className="py-3 px-5">Modalidad</th>
                  <th className="py-3 px-5">Estado</th>
                  <th className="py-3 px-5">Contrato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs tabular-nums">
                {filtradas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-slate-400 text-xs"
                    >
                      No se encontraron solicitudes aprobadas con los filtros
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
                      <td className="py-4 px-5 text-center text-slate-500">
                        {item.plazo_meses} m
                      </td>
                      <td className="py-4 px-5 text-center font-bold text-slate-700">
                        {item.score_datacredito ?? "—"}
                      </td>
                      <td className="py-4 px-5">
                        <Badge
                          variant={
                            item.modalidad_decision === "Manual"
                              ? "purple"
                              : "green"
                          }
                        >
                          {item.modalidad_decision || "Automática"}
                        </Badge>
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant="green">Aprobada</Badge>
                      </td>
                      <td className="py-4 px-5">
                        <button
                          type="button"
                          onClick={() => setDetalle(item)}
                          className="px-3 py-1 rounded-full bg-[#FAF5FF] hover:bg-[#F3E8FF] text-xs font-bold text-[#820AD1] transition-colors cursor-pointer"
                        >
                          {item.firmado_digitalmente
                            ? "Ver Contrato Firmado"
                            : "Ver Borrador"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal detalle contrato y firma digitalizada */}
      {detalle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase text-[#820AD1]">
                  {detalle.numero_contrato ||
                    detalle.radicado.replace("RAD-", "CNT-2026-")}
                </p>
                <h3 className="text-sm font-bold text-slate-900 tabular-nums mt-0.5">
                  {detalle.radicado} · Formalización
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetalle(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-[#F5F6F8] rounded-2xl p-4 space-y-2.5 text-xs tabular-nums">
              <div className="flex justify-between">
                <span className="text-slate-500">Titular</span>
                <span className="font-bold text-slate-900">
                  {detalle.nombres} {detalle.apellidos}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monto y plazo</span>
                <span className="font-semibold text-slate-900">
                  {formatCOP(Number(detalle.monto_solicitado))} ·{" "}
                  {detalle.plazo_meses} m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cuota mensual</span>
                <span className="font-bold text-[#820AD1]">
                  {formatCOP(Number(detalle.cuota_estimada))} COP
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Estado firma</span>
                {detalle.firmado_digitalmente ? (
                  <Badge variant="green">Firmado digitalmente</Badge>
                ) : (
                  <Badge variant="amber">Pendiente de firma</Badge>
                )}
              </div>
            </div>

            {detalle.firmado_digitalmente && detalle.firma_base64 && (
              <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl p-4 text-center space-y-2">
                <p className="text-[11px] font-bold text-[#820AD1]">
                  Firma manuscrita registrada del titular
                </p>
                <img
                  src={detalle.firma_base64}
                  alt="Firma del titular"
                  className="h-16 mx-auto bg-white border border-slate-200 rounded-xl px-4 py-1"
                />
              </div>
            )}

            {detalle.observacion_analista && (
              <div className="bg-[#F5F6F8] rounded-2xl p-3.5 text-xs text-slate-600">
                <span className="font-bold text-slate-900 block mb-0.5">
                  Concepto del analista:
                </span>
                {detalle.observacion_analista}
              </div>
            )}

            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={() => setDetalle(null)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </AnalystLayout>
  );
};
