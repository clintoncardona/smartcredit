import {
  CheckCircle2,
  FileText,
  Lock,
  Scale,
  ShieldCheck,
  X,
} from "lucide-react";
import React from "react";

interface DataPolicyModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onAceptar?: () => void;
}

export const DataPolicyModal: React.FC<DataPolicyModalProps> = ({
  abierto,
  onCerrar,
  onAceptar,
}) => {
  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-politica-datos"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Encabezado fijo */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center shrink-0">
              <ShieldCheck size={18} strokeWidth={2} />
            </div>
            <div>
              <h2
                id="titulo-politica-datos"
                className="text-sm font-bold text-slate-900 leading-tight"
              >
                Autorización de Tratamiento de Datos Personales y Habeas Data
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Banco Andino S.A. · Plataforma SmartCredit · Versión vigente
                2026
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar ventana"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="px-6 py-5 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="bg-[#F8F5FF] border border-[#E9D5FF] rounded-2xl p-4 text-slate-700">
            <p className="font-semibold text-[#6D08B0] mb-1">
              Declaración previa e informada
            </p>
            <p className="text-[11px] leading-relaxed">
              De conformidad con la{" "}
              <strong>Ley Estatutaria 1581 de 2012</strong>, el Decreto 1377 de
              2013 y la <strong>Ley 1266 de 2008</strong> (Habeas Data
              Financiero), al registrarte en <strong>SmartCredit</strong>{" "}
              autorizas de manera previa, expresa, voluntaria e informada a{" "}
              <strong>Banco Andino S.A.</strong> para recolectar, almacenar,
              usar, circular, verificar y actualizar tus datos personales y
              financieros.
            </p>
          </div>

          <section className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText size={14} className="text-[#820AD1]" />
              <span>1. Datos objeto de tratamiento</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>
                <strong>Datos de identificación y contacto:</strong> nombres,
                apellidos, número de cédula de ciudadanía, teléfono celular,
                correo electrónico y dirección de residencia.
              </li>
              <li>
                <strong>Datos financieros, laborales y crediticios:</strong>{" "}
                ingresos mensuales, egresos, obligaciones vigentes, actividad
                económica y capacidad de endeudamiento.
              </li>
              <li>
                <strong>Soportes documentales y firma:</strong> imagen o archivo
                PDF del documento de identidad, certificados laborales o
                desprendibles de pago y firma electrónica manuscrita estampada
                en contratos y pagarés.
              </li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Scale size={14} className="text-[#820AD1]" />
              <span>2. Finalidades y consulta en centrales de riesgo</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>
                Estudiar, evaluar y decidir tu solicitud de crédito de libre
                inversión mediante motores automáticos de riesgo y análisis
                documental.
              </li>
              <li>
                Consultar, reportar, procesar y divulgar ante operadores de
                información financiera y centrales de riesgo (como{" "}
                <strong>DataCrédito Experian</strong> y{" "}
                <strong>TransUnion</strong>) tu comportamiento crediticio, nivel
                de endeudamiento y cumplimiento de obligaciones.
              </li>
              <li>
                Validar la autenticidad de los soportes adjuntos para prevención
                de fraude, lavado de activos y financiación del terrorismo
                (SARLAFT).
              </li>
              <li>
                Formalizar el contrato de mutuo y pagaré electrónico, así como
                enviarte notificaciones transaccionales sobre el estado de tu
                radicado.
              </li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Lock size={14} className="text-[#820AD1]" />
              <span>3. Tus derechos como titular (Derechos ARCO)</span>
            </h3>
            <p className="text-[11px]">
              Como titular de la información tienes derecho a{" "}
              <strong>conocer, actualizar y rectificar</strong> tus datos
              personales, solicitar prueba de esta autorización, ser informado
              sobre el uso dado a tus datos, presentar quejas ante la{" "}
              <strong>Superintendencia de Industria y Comercio (SIC)</strong> y
              revocar la autorización o solicitar la supresión del dato cuando
              no exista un deber legal o contractual vigente que lo impida.
            </p>
          </section>

          <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-[11px] text-slate-500">
            <strong className="text-slate-800 block mb-0.5">
              Responsable del Tratamiento y Canales de Atención
            </strong>
            Banco Andino S.A. · Oficial de Protección de Datos Personales ·
            Correo de atención:{" "}
            <span className="text-[#820AD1] font-medium">
              protecciondatos@bancoandino.com
            </span>
            . Los datos se conservarán durante la vigencia de la relación
            precontractual o contractual y los términos legales aplicables al
            sector financiero en Colombia.
          </section>
        </div>

        {/* Pie fijo */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          {onAceptar && (
            <button
              type="button"
              onClick={() => {
                onAceptar();
                onCerrar();
              }}
              className="px-5 py-2 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>He leído y acepto</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
