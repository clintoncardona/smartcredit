import {
  BookOpen,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  ShieldAlert,
  X,
} from "lucide-react";
import React, { useState } from "react";

interface AnalystGuideModalProps {
  abierto: boolean;
  onCerrar: () => void;
}

export const AnalystGuideModal: React.FC<AnalystGuideModalProps> = ({
  abierto,
  onCerrar,
}) => {
  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-guia-analistas"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Encabezado fijo */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center shrink-0">
              <BookOpen size={18} strokeWidth={2} />
            </div>
            <div>
              <h2
                id="titulo-guia-analistas"
                className="text-sm font-bold text-slate-900 leading-tight"
              >
                Guía Operativa de Riesgo y Originación · Analistas
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mesa de Control SmartCredit · Manual rápido para analistas
                nuevos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar guía"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed">
          {/* Resumen de propósito */}
          <div className="bg-[#F8F5FF] border border-[#E9D5FF] rounded-2xl p-4">
            <p className="font-bold text-[#6D08B0] mb-1">
              Tu rol en la Mesa de Control
            </p>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Las solicitudes que llegan a la bandeja{" "}
              <strong>En revisión (3B)</strong> superaron los filtros iniciales
              del motor, pero requieren verificación documental y financiera
              humana antes de liberar el contrato y pagaré electrónico al
              cliente.
            </p>
          </div>

          {/* 1. Reglas numéricas de aprobación */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Calculator size={15} className="text-[#820AD1]" />
              <span>1. Parámetros mínimos de capacidad y score</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-slate-200/80 rounded-2xl p-3.5 bg-slate-50/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#820AD1]">
                  Score en centrales
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  Mínimo 600 puntos
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Puntajes inferiores a 600 aplican para rechazo por perfil de
                  riesgo crediticio.
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-3.5 bg-slate-50/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#820AD1]">
                  Regla de capacidad (30%)
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  Cuota ≤ 30% del excedente
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Excedente = Ingresos − (Egresos + Arriendo + Otras cuotas).
                </p>
              </div>
            </div>
          </section>

          {/* 2. Checklist documental */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileCheck2 size={15} className="text-[#820AD1]" />
              <span>2. Checklist obligatorio de validación documental</span>
            </h3>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-start gap-2">
                <CheckCircle2
                  size={14}
                  className="text-emerald-600 shrink-0 mt-0.5"
                />
                <span>
                  <strong>Cédula de ciudadanía:</strong> Verifica que ambas
                  caras sean nítidas, sin recortes, y que el número de documento
                  y nombres coincidan exactamente con los datos registrados.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  size={14}
                  className="text-emerald-600 shrink-0 mt-0.5"
                />
                <span>
                  <strong>Soporte de ingresos:</strong> Confirma que el
                  certificado laboral o desprendible tenga vigencia menor a{" "}
                  <strong>30 días</strong>, indique tipo de contrato, cargo y
                  que el salario soporte los ingresos declarados por el
                  solicitante.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  size={14}
                  className="text-emerald-600 shrink-0 mt-0.5"
                />
                <span>
                  <strong>Coherencia financiera:</strong> Si los ingresos
                  certificados son menores a los declarados, recalcula
                  mentalmente el excedente; si la cuota supera el 30%, procede
                  con rechazo motivado.
                </span>
              </li>
            </ul>
          </section>

          {/* 3. Criterios de decisión y trazabilidad */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldAlert size={15} className="text-[#820AD1]" />
              <span>3. Cuándo rechazar y cómo documentar observaciones</span>
            </h3>
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-3.5 text-[11px] text-[#991B1B] space-y-1">
              <p className="font-bold">Causales inmediatas de rechazo:</p>
              <p>
                Documentos ilegibles, adulterados o pertenecientes a un tercero;
                diferencia injustificada en ingresos; o capacidad de pago
                insuficiente tras depurar obligaciones.
              </p>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-1">
              <ClipboardCheck
                size={14}
                className="text-[#820AD1] shrink-0 mt-0.5"
              />
              <span>
                <strong>Bitácora de auditoría:</strong> Toda aprobación o
                rechazo manual requiere una observación clara y objetiva (ej.{" "}
                <em>
                  &ldquo;Certificado laboral verificado, salario acorde y
                  capacidad de pago suficiente&rdquo;
                </em>
                ). Una vez aprobada, el cliente podrá firmar su contrato digital
                en la pestaña <strong>Aprobadas (3C)</strong>.
              </span>
            </div>
          </section>
        </div>

        {/* Pie fijo */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-2 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            Entendido, volver a la Mesa de Control
          </button>
        </div>
      </div>
    </div>
  );
};

/** Botón listo para insertar en el header o barra lateral de la vista del analista */
export const AnalystGuideButton: React.FC = () => {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#820AD1] text-xs font-bold transition-colors cursor-pointer"
      >
        <BookOpen size={14} strokeWidth={2.2} />
        <span>Ver guía de analistas</span>
      </button>

      <AnalystGuideModal abierto={abierto} onCerrar={() => setAbierto(false)} />
    </>
  );
};
