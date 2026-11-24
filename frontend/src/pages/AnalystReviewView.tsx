import {
  Check,
  Clock,
  ExternalLink,
  FileCheck2,
  FileText,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { AlertBanner } from "../components/ui/AlertBanner";
import {
  AnalystLayout,
  type AnalystRoute,
} from "../components/ui/AnalystLayout";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { analystApi } from "../services/api";
import { formatCOP, type SolicitudCreditoData } from "../types/credit";

interface AnalystReviewViewProps {
  solicitudCliente?: SolicitudCreditoData;
  onNavigate: (route: AnalystRoute) => void;
  onLogout: () => void;
  onDecisionFinal?: (
    radicado: string,
    decision: "Aprobada" | "Rechazada",
  ) => void;
}

interface SoporteDB {
  id: number;
  nombre_original: string;
  ruta_archivo: string;
  tipo_mime: string;
  tamano_bytes: number;
}

interface SolicitudRevisionDB {
  id: number;
  radicado: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  celular: string;
  ciudad: string;
  ocupacion: string;
  correo: string;
  ingresos_mensuales: string | number;
  excedente_neto: string | number;
  monto_solicitado: string | number;
  plazo_meses: number;
  cuota_estimada: string | number;
  score_datacredito: number | null;
  observacion_analista: string | null;
  soportes: SoporteDB[];
}

const BACKEND_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/api$/, "");

const PLANTILLAS_CONCEPTO = [
  "Soportes legibles y capacidad de pago verificada dentro del límite prudencial.",
  "Ingresos y estabilidad laboral consistentes con la cuota mensual estimada.",
  "Documentación incompleta o poco legible para validar ingresos declarados.",
  "Nivel de endeudamiento actual compromete el flujo mensual disponible.",
];

export const AnalystReviewView: React.FC<AnalystReviewViewProps> = ({
  onNavigate,
  onLogout,
  onDecisionFinal,
}) => {
  const [pendientes, setPendientes] = useState<SolicitudRevisionDB[]>([]);
  const [radicadoActivo, setRadicadoActivo] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [observacion, setObservacion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [feedback, setFeedback] = useState<{
    tipo: "success" | "warning" | "danger";
    titulo: string;
    detalle: string;
  } | null>(null);

  const cargarPendientes = async () => {
    setCargando(true);
    try {
      const res = await analystApi.listarSolicitudes("En revisión");
      const lista = (res.solicitudes as unknown as SolicitudRevisionDB[]) || [];
      setPendientes(lista);
      if (lista.length > 0) {
        setRadicadoActivo((prev) =>
          lista.some((s) => s.radicado === prev) ? prev : lista[0].radicado,
        );
      } else {
        setRadicadoActivo("");
      }
    } catch (err) {
      setFeedback({
        tipo: "danger",
        titulo: "Error al cargar la bandeja",
        detalle: (err as Error).message,
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return pendientes.filter(
      (p) =>
        p.radicado.toLowerCase().includes(q) ||
        `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q) ||
        p.cedula.toLowerCase().includes(q),
    );
  }, [pendientes, busqueda]);

  const casoActual =
    filtradas.find((item) => item.radicado === radicadoActivo) || filtradas[0];

  useEffect(() => {
    if (casoActual) {
      setObservacion(casoActual.observacion_analista || "");
    }
  }, [casoActual?.radicado]);

  const handleEmitirDictamen = async (decision: "Aprobada" | "Rechazada") => {
    if (!casoActual || !observacion.trim()) return;
    setProcesando(true);
    setFeedback(null);
    try {
      const res = await analystApi.emitirDictamen(
        casoActual.radicado,
        decision,
        observacion.trim(),
      );
      setFeedback({
        tipo: decision === "Aprobada" ? "success" : "warning",
        titulo: `Dictamen registrado: ${decision}`,
        detalle: res.mensaje,
      });
      onDecisionFinal?.(casoActual.radicado, decision);
      await cargarPendientes();
    } catch (err) {
      setFeedback({
        tipo: "danger",
        titulo: "No se pudo registrar el dictamen",
        detalle: (err as Error).message,
      });
    } finally {
      setProcesando(false);
    }
  };

  const excedenteActual = Number(casoActual?.excedente_neto ?? 0);
  const cuotaMaxActual = Math.max(0, Math.round(excedenteActual * 0.3));
  const cuotaEstActual = Number(casoActual?.cuota_estimada ?? 0);
  const cumpleRegla30 =
    cuotaMaxActual > 0 &&
    cuotaEstActual > 0 &&
    cuotaEstActual <= cuotaMaxActual;

  return (
    <AnalystLayout
      activeRoute="3B-en-revision"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#820AD1]">
            Mesa de control
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Cada solicitud merece una mirada
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Inspecciona los soportes, verifica la capacidad de pago y registra
            tu concepto antes de decidir.
          </p>
        </div>

        {feedback && (
          <AlertBanner
            variant={feedback.tipo}
            title={feedback.titulo}
            description={feedback.detalle}
          />
        )}

        {!cargando && pendientes.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <h2 className="text-base font-bold text-slate-900">
              No hay solicitudes pendientes de revisión manual
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Todas las solicitudes radicadas en franja intermedia ya cuentan
              con dictamen emitido.
            </p>
            <div className="pt-2 flex justify-center gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onNavigate("3C-aprobadas")}
              >
                Ver aprobadas
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onNavigate("3D-rechazadas")}
              >
                Ver rechazadas
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna izquierda 7/12: Bandeja de pendientes */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900">
                      Bandeja en revisión manual
                    </h2>
                    <Badge variant="amber">
                      {pendientes.length} pendientes
                    </Badge>
                  </div>

                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar por radicado, cliente o cédula"
                      className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8F9FB] text-[11px] font-semibold text-slate-400 border-y border-slate-100">
                        <th className="py-3 px-6">Radicado</th>
                        <th className="py-3 px-6">Cliente</th>
                        <th className="py-3 px-6 text-right">Monto COP</th>
                        <th className="py-3 px-6 text-center">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs tabular-nums">
                      {filtradas.map((item) => {
                        const activo = item.radicado === casoActual?.radicado;
                        return (
                          <tr
                            key={item.radicado}
                            onClick={() => setRadicadoActivo(item.radicado)}
                            className={`cursor-pointer transition-colors ${
                              activo
                                ? "bg-[#FAF5FF] border-l-4 border-l-[#820AD1]"
                                : "hover:bg-slate-50/80"
                            }`}
                          >
                            <td className="py-4 px-6 font-bold text-slate-900">
                              {item.radicado}
                            </td>
                            <td className="py-4 px-6 font-medium text-slate-700">
                              {item.nombres} {item.apellidos}
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-slate-900">
                              {formatCOP(Number(item.monto_solicitado))}
                            </td>
                            <td className="py-4 px-6 text-center font-bold text-[#820AD1]">
                              {item.score_datacredito ?? "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Aviso inferior ámbar */}
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-3xl p-4 flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center shrink-0">
                  <FileCheck2 size={16} />
                </div>
                <div>
                  <p className="font-bold text-[#92400E]">
                    Revisión con criterio humano
                  </p>
                  <p className="text-[11px] text-[#B45309] mt-0.5 leading-relaxed">
                    Estas solicitudes se ubican en la franja intermedia de score
                    (600–699 pts). Verifica la autenticidad de los soportes y el
                    margen de cuota antes de emitir tu dictamen.
                  </p>
                </div>
              </div>
            </div>

            {/* Columna derecha 5/12: Inspector detallado */}
            {casoActual && (
              <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl shadow-[0_6px_24px_rgba(15,23,42,0.04)] p-6 space-y-5">
                <div className="space-y-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-slate-900 tabular-nums">
                      {casoActual.radicado}
                    </h2>
                    <Badge variant="amber">En revisión manual</Badge>
                  </div>

                  <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Score Datacrédito
                      </p>
                      <p className="text-3xl font-extrabold text-[#820AD1] tabular-nums mt-0.5">
                        {casoActual.score_datacredito ?? 645}
                      </p>
                    </div>
                    <Badge variant="green">API: consulta exitosa</Badge>
                  </div>
                </div>

                {/* Datos del cliente */}
                <div className="space-y-2.5 text-xs border-b border-slate-100 pb-4 tabular-nums">
                  <p className="font-bold text-slate-900 text-sm">
                    {casoActual.nombres} {casoActual.apellidos}
                  </p>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cédula</span>
                    <span className="font-semibold text-slate-900">
                      {casoActual.cedula}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monto y plazo</span>
                    <span className="font-bold text-slate-900">
                      {formatCOP(Number(casoActual.monto_solicitado))} COP ·{" "}
                      {casoActual.plazo_meses} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Excedente neto</span>
                    <span className="font-bold text-slate-900">
                      {formatCOP(excedenteActual)} COP
                    </span>
                  </div>
                  {cuotaEstActual > 0 && (
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="text-slate-400">
                        Cuota est. vs cupo 30%
                      </span>
                      <span
                        className={`font-bold ${
                          cumpleRegla30 ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {formatCOP(cuotaEstActual)} /{" "}
                        {formatCOP(cuotaMaxActual)}
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 pt-1">
                    {casoActual.correo} · {casoActual.celular}
                  </p>
                </div>

                {/* Documentos */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-900">
                    Soportes adjuntos ({(casoActual.soportes || []).length})
                  </p>
                  <div className="space-y-2">
                    {(casoActual.soportes || []).map((sop) => (
                      <a
                        key={sop.id}
                        href={`${BACKEND_ORIGIN}${sop.ruta_archivo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#F5F6F8] hover:bg-[#FAF5FF] border border-slate-200/70 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-white text-[#820AD1] flex items-center justify-center shrink-0 shadow-2xs">
                            <FileText size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {sop.nombre_original}
                            </p>
                            <p className="text-[10px] text-slate-400 tabular-nums">
                              {Math.max(1, Math.round(sop.tamano_bytes / 1024))}{" "}
                              KB · Abrir documento
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="green">Validado</Badge>
                          <ExternalLink size={13} className="text-slate-400" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Historial compacto */}
                <div className="space-y-1.5 text-[11px] text-slate-500">
                  <p className="text-xs font-bold text-slate-900">
                    Trazabilidad
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock size={12} className="text-[#820AD1]" />
                    Solicitud radicada · Consulta API score{" "}
                    {casoActual.score_datacredito}
                  </p>
                </div>

                {/* Observaciones + Plantillas rápidas */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Observaciones / concepto del analista *
                  </label>

                  <div className="flex flex-wrap gap-1.5">
                    {PLANTILLAS_CONCEPTO.map((texto, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setObservacion(texto)}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F3F4F6] hover:bg-[#F3E8FF] text-slate-600 hover:text-[#820AD1] transition-colors cursor-pointer"
                      >
                        + Concepto {idx + 1}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Soportes legibles y consistentes con la información del cliente..."
                    className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] rounded-2xl p-3.5 text-xs outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
                  />
                  <p className="text-[10px] text-slate-400">
                    Al registrar el dictamen se actualizará el estado y se
                    notificará al cliente.
                  </p>
                </div>

                {/* Botones Aprobar / Rechazar */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Button
                    type="button"
                    variant="success"
                    size="lg"
                    fullWidth
                    disabled={procesando || !observacion.trim()}
                    onClick={() => handleEmitirDictamen("Aprobada")}
                    icon={<Check size={15} strokeWidth={2.5} />}
                  >
                    Aprobar
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    size="lg"
                    fullWidth
                    disabled={procesando || !observacion.trim()}
                    onClick={() => handleEmitirDictamen("Rechazada")}
                    icon={<X size={15} strokeWidth={2.5} />}
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AnalystLayout>
  );
};
