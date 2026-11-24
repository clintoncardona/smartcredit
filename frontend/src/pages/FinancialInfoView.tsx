import {
  AlertCircle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { WizardShell } from "../components/ui/WizardShell";
import { formatCOP, type DatosFinancieros } from "../types/credit";

interface FinancialInfoViewProps {
  initialData: DatosFinancieros;
  userName: string;
  onBack: () => void;
  onNext: (datosActualizados: DatosFinancieros) => void;
}

const formatMiles = (val: number) =>
  val && val > 0 ? val.toLocaleString("es-CO") : "";

const parseMiles = (txt: string) => {
  const digits = txt.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
};

export const FinancialInfoView: React.FC<FinancialInfoViewProps> = ({
  initialData,
  userName,
  onBack,
  onNext,
}) => {
  const [ingresosTxt, setIngresosTxt] = useState(
    formatMiles(initialData.ingresosMensuales),
  );
  const [egresosTxt, setEgresosTxt] = useState(
    formatMiles(initialData.egresosDeclarados),
  );
  const [arriendoTxt, setArriendoTxt] = useState(
    formatMiles(initialData.arriendoHipoteca),
  );
  const [obligacionesTxt, setObligacionesTxt] = useState(
    formatMiles(initialData.otrasObligaciones),
  );
  const [montoTxt, setMontoTxt] = useState(
    formatMiles(initialData.montoSolicitado),
  );
  const [plazo, setPlazo] = useState<DatosFinancieros["plazoMeses"]>(
    initialData.plazoMeses || 36,
  );

  const handleMilesChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    raw: string,
  ) => {
    const digits = raw.replace(/\D/g, "");
    setter(digits ? Number(digits).toLocaleString("es-CO") : "");
  };

  const numIngresos = parseMiles(ingresosTxt);
  const numEgresos = parseMiles(egresosTxt);
  const numArriendo = parseMiles(arriendoTxt);
  const numObligaciones = parseMiles(obligacionesTxt);
  const numMonto = parseMiles(montoTxt);

  const excedenteNeto =
    numIngresos - numEgresos - numArriendo - numObligaciones;
  const cuotaMaxima = Math.max(0, Math.round(excedenteNeto * 0.3));

  // Cuota mensual estimada de referencia (1.85% M.V.) para orientación visual
  const tasaRef = 0.0185;
  const factor = Math.pow(1 + tasaRef, plazo);
  const cuotaReferencial =
    numMonto > 0
      ? Math.round((numMonto * (tasaRef * factor)) / (factor - 1))
      : 0;

  const porcentajeUsoCapacidad =
    cuotaMaxima > 0 ? Math.round((cuotaReferencial / cuotaMaxima) * 100) : 0;
  const dentroDeRegla30 =
    cuotaMaxima > 0 && cuotaReferencial > 0 && cuotaReferencial <= cuotaMaxima;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numIngresos < 500000 || numMonto < 1000000) return;

    onNext({
      ingresosMensuales: numIngresos,
      egresosDeclarados: numEgresos,
      arriendoHipoteca: numArriendo,
      otrasObligaciones: numObligaciones,
      montoSolicitado: numMonto,
      plazoMeses: plazo,
    });
  };

  return (
    <WizardShell
      currentStep={2}
      title="Un crédito que se ajuste a ti"
      subtitle="Cuéntanos sobre tus ingresos y gastos mensuales, en pesos colombianos."
      userName={userName}
      montoSolicitado={numMonto}
      plazoMeses={plazo}
      excedenteNeto={excedenteNeto}
      cuotaMaxima={cuotaMaxima}
      showFinancialSummary
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center shrink-0">
              <Wallet size={19} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Flujo financiero mensual
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculamos tu excedente libre para asignarte una cuota
                saludable.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Ingresos mensuales
              </label>
              <div className="flex items-center bg-[#F3F4F6] focus-within:bg-white border border-transparent focus-within:border-[#820AD1] rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#820AD1]/15 transition-all">
                <span className="text-xs font-bold text-slate-500 mr-1.5">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={ingresosTxt}
                  onChange={(e) =>
                    handleMilesChange(setIngresosTxt, e.target.value)
                  }
                  placeholder="4.500.000"
                  className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none tabular-nums"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Total de tus ingresos recibidos al mes.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Egresos declarados
              </label>
              <div className="flex items-center bg-[#F3F4F6] focus-within:bg-white border border-transparent focus-within:border-[#820AD1] rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#820AD1]/15 transition-all">
                <span className="text-xs font-bold text-slate-500 mr-1.5">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={egresosTxt}
                  onChange={(e) =>
                    handleMilesChange(setEgresosTxt, e.target.value)
                  }
                  placeholder="1.200.000"
                  className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none tabular-nums"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Gastos básicos sin arriendo ni otras cuotas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Arriendo o hipoteca
              </label>
              <div className="flex items-center bg-[#F3F4F6] focus-within:bg-white border border-transparent focus-within:border-[#820AD1] rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#820AD1]/15 transition-all">
                <span className="text-xs font-bold text-slate-500 mr-1.5">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={arriendoTxt}
                  onChange={(e) =>
                    handleMilesChange(setArriendoTxt, e.target.value)
                  }
                  placeholder="800.000"
                  className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Otras obligaciones financieras
              </label>
              <div className="flex items-center bg-[#F3F4F6] focus-within:bg-white border border-transparent focus-within:border-[#820AD1] rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#820AD1]/15 transition-all">
                <span className="text-xs font-bold text-slate-500 mr-1.5">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={obligacionesTxt}
                  onChange={(e) =>
                    handleMilesChange(setObligacionesTxt, e.target.value)
                  }
                  placeholder="300.000"
                  className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Configura tu crédito
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Monto solicitado
                </label>
                <div className="flex items-center bg-[#F3F4F6] focus-within:bg-white border border-transparent focus-within:border-[#820AD1] rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#820AD1]/15 transition-all">
                  <span className="text-xs font-bold text-slate-500 mr-1.5">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={montoTxt}
                    onChange={(e) =>
                      handleMilesChange(setMontoTxt, e.target.value)
                    }
                    placeholder="15.000.000"
                    className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none tabular-nums"
                  />
                  <span className="text-[11px] font-semibold text-slate-400 ml-1">
                    COP
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Plazo en meses
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([12, 24, 36, 48] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPlazo(m)}
                      className={`py-3 rounded-2xl text-xs font-bold tabular-nums transition-all cursor-pointer ${
                        plazo === m
                          ? "bg-[#820AD1] text-white shadow-xs"
                          : "bg-[#F3F4F6] text-slate-700 hover:bg-slate-200/80"
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tarjetas comparativas de capacidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 tabular-nums">
              <div className="bg-[#F5F6F8] border border-slate-200/70 rounded-2xl p-4">
                <p className="text-[11px] font-semibold text-slate-500">
                  Excedente neto mensual
                </p>
                <p
                  className={`text-xl font-extrabold mt-1 ${
                    excedenteNeto <= 0 ? "text-[#DC2626]" : "text-slate-900"
                  }`}
                >
                  {formatCOP(excedenteNeto)}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Ingresos menos egresos, arriendo y obligaciones.
                </p>
              </div>

              <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl p-4">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#820AD1]">
                  <Calculator size={13} />
                  Cuota máxima permitida (30%)
                </p>
                <p className="text-xl font-extrabold text-[#820AD1] mt-1">
                  {formatCOP(cuotaMaxima)}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Límite prudencial del 30% sobre tu excedente neto.
                </p>
              </div>
            </div>

            {/* Medidor visual en vivo de holgura financiera */}
            {numIngresos > 0 && numMonto > 0 && (
              <div
                className={`rounded-2xl border p-4 space-y-2.5 text-xs ${
                  dentroDeRegla30
                    ? "bg-[#ECFDF5]/75 border-[#A7F3D0]"
                    : "bg-[#FFFBEB] border-[#FDE68A]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                    {dentroDeRegla30 ? (
                      <CheckCircle2 size={15} className="text-emerald-600" />
                    ) : (
                      <AlertCircle size={15} className="text-amber-600" />
                    )}
                    <span>
                      Cuota referencial estimada:{" "}
                      <strong className="tabular-nums">
                        {formatCOP(cuotaReferencial)} / mes
                      </strong>
                    </span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      dentroDeRegla30
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {dentroDeRegla30
                      ? `Dentro del cupo (${porcentajeUsoCapacidad}%)`
                      : "Supera el 30% recomendado"}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/80 overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(8, porcentajeUsoCapacidad))}%`,
                    }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      dentroDeRegla30 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {dentroDeRegla30
                    ? "Tu cuota estimada se mantiene dentro del 30% de tu flujo libre mensual."
                    : "Sugerencia: amplía el plazo en meses o ajusta el monto solicitado para mejorar tu probabilidad de aprobación automática."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            Anterior
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={numIngresos < 500000 || numMonto < 1000000}
            icon={<ArrowRight size={15} strokeWidth={2} />}
          >
            Siguiente: Adjuntar soportes
          </Button>
        </div>
      </form>
    </WizardShell>
  );
};
