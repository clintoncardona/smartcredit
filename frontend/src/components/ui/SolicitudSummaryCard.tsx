import React from 'react';
import { ReceiptText, Info } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatCOP } from '../../types/credit';

interface SolicitudSummaryCardProps {
  estado?: 'En preparación' | 'Lista para confirmar';
  radicado?: string;
  montoSolicitado: number;
  plazoMeses: number;
  solicitante: string;
  // Propiedades opcionales que se activan a partir del Paso 2B
  excedenteNeto?: number;
  cuotaMaxima?: number;
  mostrarDetalleFinanciero?: boolean;
}

export const SolicitudSummaryCard: React.FC<SolicitudSummaryCardProps> = ({
  estado = 'En preparación',
  radicado,
  montoSolicitado,
  plazoMeses,
  solicitante,
  excedenteNeto,
  cuotaMaxima,
  mostrarDetalleFinanciero = false,
}) => {
  return (
    <aside className="space-y-4">
      {/* TARJETA BLANCA PRINCIPAL: Tu solicitud */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">Tu solicitud</h3>
          <ReceiptText className="text-purple-600" size={18} />
        </div>

        <div className="mb-5">
          <Badge variant="purple">
            {radicado ? `Radicado ${radicado}` : estado}
          </Badge>
        </div>

        {/* Monto destacado */}
        <div className="mb-5">
          <p className="text-xs text-gray-500 mb-1">Monto solicitado</p>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {formatCOP(montoSolicitado)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Pesos colombianos · COP</p>
        </div>

        <hr className="border-gray-100 my-4" />

        {/* Resumen de condiciones */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Plazo</span>
            <span className="font-semibold text-gray-900">{plazoMeses} meses</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Solicitante</span>
            <span className="font-semibold text-gray-900">
              {solicitante.trim() || 'Por definir'}
            </span>
          </div>

          {/* Se muestra dinámicamente en los pasos 2B, 2C y 2D */}
          {mostrarDetalleFinanciero && excedenteNeto !== undefined && cuotaMaxima !== undefined && (
            <>
              <hr className="border-gray-100 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Excedente neto</span>
                <span className="font-semibold text-gray-900">{formatCOP(excedenteNeto)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Cuota máxima 30%</span>
                <span className="font-bold text-gray-900">{formatCOP(cuotaMaxima)}</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
                Referencia de capacidad. No corresponde a la cuota real del préstamo.
              </p>
            </>
          )}
        </div>

        <hr className="border-gray-100 my-4" />

        <p className="text-[11px] text-gray-400 leading-relaxed">
          {radicado
            ? 'Número reservado. Tu solicitud se enviará únicamente al confirmar la radicación.'
            : 'Aún no has enviado la solicitud. La evaluación comenzará después de radicar.'}
        </p>
      </div>

      {/* TARJETA DE ACOMPAÑAMIENTO */}
      <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
        <Info className="text-purple-600 shrink-0 mt-0.5" size={17} />
        <div>
          <h4 className="text-xs font-bold text-purple-900 mb-1">Estamos para acompañarte</h4>
          <p className="text-[11px] text-purple-800/80 leading-relaxed">
            Revisa tus datos con calma. Puedes volver al paso anterior antes de radicar.
          </p>
        </div>
      </div>
    </aside>
  );
};