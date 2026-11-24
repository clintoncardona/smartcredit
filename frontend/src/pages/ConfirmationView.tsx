import {
  ArrowRight,
  CheckCircle2,
  Eye,
  FileText,
  Pencil,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import React, { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { WizardShell } from "../components/ui/WizardShell";
import {
  formatCOP,
  type DocumentoSoporte,
  type SolicitudCreditoData,
} from "../types/credit";

interface ConfirmationViewProps {
  solicitud: SolicitudCreditoData;
  onBack: () => void;
  onEditStep: (
    rutaPaso: "2A-datos-personales" | "2B-info-financiera" | "2C-soportes",
  ) => void;
  onConfirmRadicacion: () => Promise<void> | void;
}

const BACKEND_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/api$/, "");

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  solicitud,
  onBack,
  onEditStep,
  onConfirmRadicacion,
}) => {
  const [enviando, setEnviando] = useState(false);
  const [declaracionVeraz, setDeclaracionVeraz] = useState(true);
  const [documentoVisor, setDocumentoVisor] = useState<DocumentoSoporte | null>(
    null,
  );
  const [zoomImagen, setZoomImagen] = useState(100);

  const { personales, financieros, soportes } = solicitud;
  const excedente =
    financieros.ingresosMensuales -
    financieros.egresosDeclarados -
    financieros.arriendoHipoteca -
    financieros.otrasObligaciones;
  const cuotaMaxima = Math.max(0, Math.round(excedente * 0.3));
  const fullName = `${personales.nombres} ${personales.apellidos}`.trim();

  const handleConfirmar = async () => {
    if (!declaracionVeraz) return;
    setEnviando(true);
    try {
      await onConfirmRadicacion();
    } finally {
      setEnviando(false);
    }
  };

  const resolverUrlDocumento = (doc: DocumentoSoporte): string => {
    if (doc.previewUrl) return doc.previewUrl;
    if (doc.rutaArchivo) return `${BACKEND_ORIGIN}${doc.rutaArchivo}`;
    return "";
  };

  return (
    <WizardShell
      currentStep={4}
      title="Revisa, confirma y da el siguiente paso"
      subtitle="Verifica que todo esté correcto. Tu solicitud todavía no ha sido enviada."
      userName={fullName}
      radicado={solicitud.radicado}
      montoSolicitado={financieros.montoSolicitado}
      plazoMeses={financieros.plazoMeses}
      excedenteNeto={excedente}
      cuotaMaxima={cuotaMaxima}
      showFinancialSummary
    >
      <div className="space-y-5">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Resumen de tu solicitud
                </h2>
                <p className="text-[11px] text-slate-400">
                  Puedes editar cualquier sección antes de confirmar.
                </p>
              </div>
            </div>
            <Badge variant="purple">Lista para confirmar</Badge>
          </div>

          {/* 2 tarjetas superiores: Datos personales | Contacto y crédito */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#F5F6F8] rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#820AD1]">
                  Datos personales
                </span>
                <button
                  type="button"
                  onClick={() => onEditStep("2A-datos-personales")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[11px] font-bold text-[#820AD1] hover:bg-[#F3E8FF] transition-colors cursor-pointer"
                >
                  <Pencil size={11} />
                  <span>Editar</span>
                </button>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nombres</span>
                <span className="font-semibold text-slate-900">
                  {personales.nombres}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Apellidos</span>
                <span className="font-semibold text-slate-900">
                  {personales.apellidos}
                </span>
              </div>
              <div className="flex justify-between tabular-nums">
                <span className="text-slate-500">Cédula</span>
                <span className="font-semibold text-slate-900">
                  {personales.cedula}
                </span>
              </div>
              <div className="flex justify-between tabular-nums">
                <span className="text-slate-500">Celular</span>
                <span className="font-semibold text-slate-900">
                  {personales.celular}
                </span>
              </div>
              <div className="pt-0.5">
                <p className="text-slate-500">Correo</p>
                <p className="font-semibold text-slate-900 mt-0.5 truncate">
                  {personales.correo}
                </p>
              </div>
            </div>

            <div className="bg-[#F5F6F8] rounded-2xl p-4 space-y-2.5">
              <span className="block font-bold text-[#820AD1] py-1">
                Contacto y crédito
              </span>
              <div>
                <p className="text-slate-500">Dirección</p>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {personales.direccion}
                </p>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ciudad</span>
                <span className="font-semibold text-slate-900">
                  {personales.ciudad}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ocupación</span>
                <span className="font-semibold text-slate-900">
                  {personales.ocupacion}
                </span>
              </div>
              <div className="flex justify-between tabular-nums">
                <span className="text-slate-500">Monto</span>
                <span className="font-bold text-slate-900">
                  {formatCOP(financieros.montoSolicitado)} COP
                </span>
              </div>
              <div className="flex justify-between tabular-nums">
                <span className="text-slate-500">Plazo</span>
                <span className="font-semibold text-slate-900">
                  {financieros.plazoMeses} meses
                </span>
              </div>
            </div>
          </div>

          {/* Información financiera mensual */}
          <div className="bg-[#F8F5FF] border border-[#E9D5FF]/80 rounded-2xl p-4 space-y-3 text-xs tabular-nums">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#820AD1]">
                Información financiera mensual
              </span>
              <button
                type="button"
                onClick={() => onEditStep("2B-info-financiera")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[11px] font-bold text-[#820AD1] hover:bg-[#F3E8FF] transition-colors cursor-pointer"
              >
                <Pencil size={11} />
                <span>Editar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Ingresos</span>
                <span className="font-semibold text-slate-900">
                  {formatCOP(financieros.ingresosMensuales)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Otras obligaciones</span>
                <span className="font-semibold text-slate-900">
                  {formatCOP(financieros.otrasObligaciones)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Egresos</span>
                <span className="font-semibold text-slate-900">
                  {formatCOP(financieros.egresosDeclarados)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Excedente neto</span>
                <span className="font-bold text-slate-900">
                  {formatCOP(excedente)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Arriendo / hipoteca</span>
                <span className="font-semibold text-slate-900">
                  {formatCOP(financieros.arriendoHipoteca)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cuota máxima 30%</span>
                <span className="font-bold text-[#820AD1]">
                  {formatCOP(cuotaMaxima)}
                </span>
              </div>
            </div>
          </div>

          {/* Documentos de soporte con Vista Previa */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#820AD1]">
                Documentos de soporte
              </span>
              <button
                type="button"
                onClick={() => onEditStep("2C-soportes")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[11px] font-bold text-[#820AD1] hover:bg-[#F3E8FF] transition-colors cursor-pointer"
              >
                <Pencil size={11} />
                <span>Editar</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {soportes.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-[#F5F6F8] border border-slate-200/70 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white text-[#820AD1] flex items-center justify-center shrink-0 shadow-2xs">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {doc.nombre}
                      </p>
                      <p className="text-[11px] text-slate-500 tabular-nums">
                        {doc.tamano} · {doc.tipo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setZoomImagen(100);
                        setDocumentoVisor(doc);
                      }}
                      icon={<Eye size={13} />}
                    >
                      Vista previa
                    </Button>
                    <Badge variant="green">Validado</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkbox declaración juramentada */}
          <label className="flex items-start gap-3 bg-[#F5F6F8] rounded-2xl p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={declaracionVeraz}
              onChange={(e) => setDeclaracionVeraz(e.target.checked)}
              className="mt-0.5 accent-[#820AD1] w-4 h-4 rounded shrink-0"
            />
            <span className="text-xs leading-relaxed">
              <strong className="text-slate-900 block">
                Declaro que la información es completa y veraz
              </strong>
              <span className="text-slate-500 text-[11px]">
                He revisado mis datos y documentos. Entiendo que la solicitud
                quedará sujeta a evaluación al radicarla.
              </span>
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            Anterior
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={enviando || !declaracionVeraz}
            onClick={handleConfirmar}
            icon={<ArrowRight size={15} strokeWidth={2} />}
          >
            {enviando ? "Radicando..." : "Confirmar y Radicar"}
          </Button>
        </div>
      </div>

      {/* Modal de vista previa de documentos */}
      {documentoVisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[1px]">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200/80">
            <div className="px-6 py-3.5 bg-[#FAF5FF] border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {documentoVisor.nombre}
                </p>
                <p className="text-[11px] text-slate-500 tabular-nums">
                  {documentoVisor.tipo} · {documentoVisor.tamano}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {documentoVisor.tipo === "JPG" && (
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2.5 py-1">
                    <button
                      type="button"
                      onClick={() => setZoomImagen((z) => Math.max(50, z - 25))}
                      className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="text-[11px] font-bold text-slate-700 w-10 text-center tabular-nums">
                      {zoomImagen}%
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setZoomImagen((z) => Math.min(200, z + 25))
                      }
                      className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomImagen(100)}
                      className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setDocumentoVisor(null)}
                  className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-4">
              {documentoVisor.tipo === "PDF" ? (
                <iframe
                  src={resolverUrlDocumento(documentoVisor)}
                  title={documentoVisor.nombre}
                  className="w-full h-full bg-white rounded-2xl border border-slate-200"
                />
              ) : (
                <img
                  src={resolverUrlDocumento(documentoVisor)}
                  alt={documentoVisor.nombre}
                  style={{ width: `${zoomImagen}%`, maxWidth: "none" }}
                  className="rounded-2xl border border-slate-200 bg-white transition-all"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </WizardShell>
  );
};
