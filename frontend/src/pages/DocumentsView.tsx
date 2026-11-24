import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileText,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { AlertBanner } from "../components/ui/AlertBanner";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { WizardShell } from "../components/ui/WizardShell";
import { solicitudApi } from "../services/api";
import type { DatosFinancieros, DocumentoSoporte } from "../types/credit";

interface DocumentsViewProps {
  radicado: string;
  initialDocuments: DocumentoSoporte[];
  financieros: DatosFinancieros;
  userName: string;
  onBack: () => void;
  onNext: (documentosValidados: DocumentoSoporte[]) => void;
}

interface ArchivoEscaneoEstado {
  id: string;
  nombre: string;
  estado: "escaneando" | "error";
  mensaje: string;
}

async function verificarContenidoArchivo(file: File): Promise<{
  valido: boolean;
  diagnostico: string;
}> {
  if (file.size < 100) {
    return {
      valido: false,
      diagnostico: `El archivo "${file.name}" está vacío o dañado.`,
    };
  }
  if (file.size > 5 * 1024 * 1024) {
    return {
      valido: false,
      diagnostico: `El archivo "${file.name}" supera el límite de 5 MB.`,
    };
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  ) {
    const header = String.fromCharCode(...bytes.slice(0, 5));
    if (header !== "%PDF-") {
      return {
        valido: false,
        diagnostico: `"${file.name}" no posee una cabecera PDF real.`,
      };
    }
    const texto = new TextDecoder("latin1").decode(bytes);
    if (!texto.includes("%%EOF") || !/\d+\s+0\s+obj/.test(texto)) {
      return {
        valido: false,
        diagnostico: `"${file.name}" está incompleto o corrupto.`,
      };
    }
    return {
      valido: true,
      diagnostico: "Verificado: Legible e íntegro",
    };
  }

  if (
    file.type === "image/jpeg" ||
    file.type === "image/jpg" ||
    /\.(jpg|jpeg)$/i.test(file.name)
  ) {
    const soiOk = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const eoiOk =
      bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
    if (!soiOk || !eoiOk) {
      return {
        valido: false,
        diagnostico: `"${file.name}" tiene estructura JPEG corrupta.`,
      };
    }

    const objectUrl = URL.createObjectURL(file);
    try {
      return await new Promise<{ valido: boolean; diagnostico: string }>(
        (resolve) => {
          const img = new Image();
          img.onload = () => {
            if (img.width < 300 || img.height < 200) {
              resolve({
                valido: false,
                diagnostico: `"${file.name}" tiene resolución insuficiente (${img.width}×${img.height} px).`,
              });
              return;
            }
            const canvas = document.createElement("canvas");
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, 32, 32);
              const data = ctx.getImageData(0, 0, 32, 32).data;
              let minLum = 255;
              let maxLum = 0;
              for (let i = 0; i < data.length; i += 4) {
                const lum =
                  0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                if (lum < minLum) minLum = lum;
                if (lum > maxLum) maxLum = lum;
              }
              if (maxLum - minLum < 15) {
                resolve({
                  valido: false,
                  diagnostico: `"${file.name}" parece estar en blanco o sin contraste legible.`,
                });
                return;
              }
            }
            resolve({
              valido: true,
              diagnostico: `Verificado: Legible (${img.width}×${img.height} px)`,
            });
          };
          img.onerror = () =>
            resolve({
              valido: false,
              diagnostico: `No se pudo decodificar la imagen "${file.name}".`,
            });
          img.src = objectUrl;
        },
      );
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  return {
    valido: false,
    diagnostico: `Formato no admitido en "${file.name}". Usa PDF o JPG.`,
  };
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  radicado,
  initialDocuments,
  financieros,
  userName,
  onBack,
  onNext,
}) => {
  const [documentos, setDocumentos] =
    useState<DocumentoSoporte[]>(initialDocuments);
  const [escaneos, setEscaneos] = useState<ArchivoEscaneoEstado[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const excedente =
    financieros.ingresosMensuales -
    financieros.egresosDeclarados -
    financieros.arriendoHipoteca -
    financieros.otrasObligaciones;
  const cuotaMaxima = Math.max(0, Math.round(excedente * 0.3));

  const formatearTamano = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  };

  const handleSeleccionArchivos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorArchivo(null);
    setSubiendo(true);

    try {
      for (const file of Array.from(files)) {
        const tempId = `scan-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)}`;
        setEscaneos((prev) => [
          ...prev,
          {
            id: tempId,
            nombre: file.name,
            estado: "escaneando",
            mensaje: "Analizando estructura del documento...",
          },
        ]);

        const inspeccion = await verificarContenidoArchivo(file);
        if (!inspeccion.valido) {
          setEscaneos((prev) =>
            prev.map((item) =>
              item.id === tempId
                ? { ...item, estado: "error", mensaje: inspeccion.diagnostico }
                : item,
            ),
          );
          setErrorArchivo(
            `${inspeccion.diagnostico} Reemplaza este archivo para continuar.`,
          );
          continue;
        }

        const res = await solicitudApi.subirSoporte(radicado, file);
        const sup = res.soporte;
        const previewUrl = URL.createObjectURL(file);

        setDocumentos((prev) => [
          ...prev,
          {
            id: String(sup.id ?? tempId),
            nombre: String(sup.nombre_original ?? file.name),
            tamano: formatearTamano(Number(sup.tamano_bytes ?? file.size)),
            tipo: file.type === "application/pdf" ? "PDF" : "JPG",
            validado: true,
            diagnostico: inspeccion.diagnostico,
            previewUrl,
            rutaArchivo: String(sup.ruta_archivo ?? ""),
          },
        ]);
        setEscaneos((prev) => prev.filter((item) => item.id !== tempId));
      }
    } catch (err) {
      setErrorArchivo((err as Error).message);
    } finally {
      setSubiendo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const hayErrores = escaneos.some((e) => e.estado === "error");
  const listo =
    documentos.length >= 2 &&
    documentos.every((d) => d.validado) &&
    !hayErrores;

  return (
    <WizardShell
      currentStep={3}
      title="Todo listo para respaldar tu solicitud"
      subtitle="Adjunta tu cédula y un soporte reciente de ingresos."
      userName={userName}
      montoSolicitado={financieros.montoSolicitado}
      plazoMeses={financieros.plazoMeses}
      excedenteNeto={excedente}
      cuotaMaxima={cuotaMaxima}
      showFinancialSummary
    >
      <div className="space-y-5">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 md:p-8 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center shrink-0">
              <FileCheck2 size={19} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Adjuntar soportes obligatorios
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Validamos en tiempo real la integridad y legibilidad de cada
                archivo.
              </p>
            </div>
          </div>

          {/* Checklist visual de los 2 documentos requeridos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl bg-[#F5F6F8] p-3.5 flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                  documentos.length >= 1
                    ? "bg-emerald-600 text-white"
                    : "bg-[#820AD1] text-white"
                }`}
              >
                {documentos.length >= 1 ? "✓" : "1"}
              </span>
              <div>
                <p className="font-bold text-slate-900">Cédula de ciudadanía</p>
                <p className="text-[11px] text-slate-500">
                  Ambas caras legibles en PDF o JPG
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F5F6F8] p-3.5 flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                  documentos.length >= 2
                    ? "bg-emerald-600 text-white"
                    : "bg-[#820AD1] text-white"
                }`}
              >
                {documentos.length >= 2 ? "✓" : "2"}
              </span>
              <div>
                <p className="font-bold text-slate-900">Soporte de ingresos</p>
                <p className="text-[11px] text-slate-500">
                  Certificado laboral o nómina reciente
                </p>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
            multiple
            onChange={(e) => handleSeleccionArchivos(e.target.files)}
            className="hidden"
          />

          {/* Dropzone modernizado */}
          <div
            onClick={() => !subiendo && fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!subiendo) handleSeleccionArchivos(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-[#D8B4FE] hover:border-[#820AD1] bg-[#FAF5FF]/50 hover:bg-[#F3E8FF]/40 rounded-3xl p-8 text-center transition-all cursor-pointer space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#820AD1] text-white flex items-center justify-center mx-auto shadow-xs">
              {subiendo ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <UploadCloud size={20} />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {subiendo
                  ? "Analizando estructura del documento..."
                  : "Arrastra tus documentos aquí"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                o selecciónalos desde tu computadora o celular
              </p>
            </div>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#820AD1] shadow-2xs">
                <span>Seleccionar archivos</span>
                <Plus size={14} />
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Formatos admitidos: PDF o JPG · Máximo 5 MB por archivo
            </p>
          </div>

          {errorArchivo && (
            <AlertBanner
              variant="danger"
              title="Documento no válido"
              description={errorArchivo}
            />
          )}

          {escaneos.length > 0 && (
            <div className="space-y-2">
              {escaneos.map((scan) => (
                <div
                  key={scan.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-xs ${
                    scan.estado === "error"
                      ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
                      : "bg-[#FAF5FF] border-[#E9D5FF] text-[#820AD1]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {scan.estado === "escaneando" ? (
                      <Loader2 size={14} className="animate-spin shrink-0" />
                    ) : (
                      <AlertTriangle size={14} className="shrink-0" />
                    )}
                    <span className="truncate font-medium">
                      {scan.nombre}: {scan.mensaje}
                    </span>
                  </div>
                  {scan.estado === "error" && (
                    <button
                      type="button"
                      onClick={() => {
                        setEscaneos((prev) =>
                          prev.filter((s) => s.id !== scan.id),
                        );
                        setErrorArchivo(null);
                      }}
                      className="text-[11px] font-bold underline ml-2 cursor-pointer"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Lista de documentos adjuntos */}
          {documentos.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  Documentos adjuntos
                </span>
                <span className="font-bold text-[#820AD1] tabular-nums">
                  {documentos.length} de 2 completos
                </span>
              </div>

              <div className="space-y-2.5">
                {documentos.map((doc) => (
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
                          {doc.tamano} · {doc.tipo} ·{" "}
                          <span className="text-[#059669] font-semibold">
                            {doc.diagnostico || "Verificado: Legible e íntegro"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <Badge variant="green">Validado</Badge>
                      <button
                        type="button"
                        onClick={() =>
                          setDocumentos((prev) =>
                            prev.filter((d) => d.id !== doc.id),
                          )
                        }
                        className="p-1.5 rounded-full text-slate-400 hover:text-[#DC2626] hover:bg-white cursor-pointer transition-colors"
                        title="Eliminar archivo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banner verde de validación */}
          {listo && (
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 flex items-start gap-2.5 text-xs">
              <CheckCircle2
                size={16}
                className="text-[#059669] shrink-0 mt-0.5"
              />
              <div>
                <p className="font-bold text-[#065F46]">
                  Tus archivos están validados
                </p>
                <p className="text-[11px] text-[#047857] mt-0.5 leading-relaxed">
                  Peso menor de 5 MB y formato real PDF/JPG verificados por el
                  contenido del archivo. Ya puedes avanzar al resumen final.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            Anterior
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={!listo || subiendo}
            onClick={() => onNext(documentos)}
            icon={<ArrowRight size={15} strokeWidth={2} />}
          >
            Siguiente: Confirmación
          </Button>
        </div>
      </div>
    </WizardShell>
  );
};
