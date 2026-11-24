import {
  ArrowRight,
  Briefcase,
  Mail,
  MapPin,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { WizardShell } from "../components/ui/WizardShell";
import type { DatosPersonales } from "../types/credit";

interface PersonalDataViewProps {
  initialData: DatosPersonales;
  montoSolicitado: number;
  plazoMeses: number;
  onBackToStart: () => void;
  onNext: (datosActualizados: DatosPersonales) => void;
}

const OCUPACIONES_SUGERIDAS = [
  "Empleado dependiente",
  "Profesional independiente",
  "Comerciante",
  "Pensionado",
  "Ingeniero(a) / Desarrollador(a)",
  "Docente",
  "Prestador(a) de servicios",
];

export const PersonalDataView: React.FC<PersonalDataViewProps> = ({
  initialData,
  montoSolicitado,
  plazoMeses,
  onBackToStart,
  onNext,
}) => {
  const [form, setForm] = useState<DatosPersonales>(initialData);

  const handleChange = (field: keyof DatosPersonales, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      ...form,
      ocupacion: form.ocupacion.trim(),
    });
  };

  const fullName = `${form.nombres} ${form.apellidos}`.trim();

  return (
    <WizardShell
      currentStep={1}
      title="Empecemos por tus datos"
      subtitle="Confirma tu información de contacto para mantenerte al tanto de tu solicitud."
      userName={fullName}
      montoSolicitado={montoSolicitado}
      plazoMeses={plazoMeses}
      onLogout={onBackToStart}
    >
      <form id="form-paso-1" onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center shrink-0">
              <UserCheck size={19} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Identificación y contacto
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Todos los campos son obligatorios para validar tu identidad.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Cédula de ciudadanía
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={form.cedula}
                onChange={(e) => handleChange("cedula", e.target.value)}
                placeholder="Ej. 1037645892"
                className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#820AD1]/15 tabular-nums transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Nombres
              </label>
              <input
                type="text"
                required
                value={form.nombres}
                onChange={(e) => handleChange("nombres", e.target.value)}
                placeholder="Ej. Juan Carlos"
                className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Apellidos
              </label>
              <input
                type="text"
                required
                value={form.apellidos}
                onChange={(e) => handleChange("apellidos", e.target.value)}
                placeholder="Ej. Pérez"
                className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Celular
              </label>
              <input
                type="tel"
                required
                value={form.celular}
                onChange={(e) => handleChange("celular", e.target.value)}
                placeholder="300 456 7890"
                className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#820AD1]/15 tabular-nums transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={form.correo}
                onChange={(e) => handleChange("correo", e.target.value)}
                placeholder="juan.perez@correo.com"
                className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
              />
              <Mail
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              ¿Dónde podemos contactarte?
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Dirección de residencia
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={form.direccion}
                  onChange={(e) => handleChange("direccion", e.target.value)}
                  placeholder="Carrera 15 # 93-45, Apto. 402"
                  className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
                />
                <MapPin
                  size={15}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Ciudad
                </label>
                <input
                  type="text"
                  required
                  value={form.ciudad}
                  onChange={(e) => handleChange("ciudad", e.target.value)}
                  placeholder="Medellín"
                  className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Ocupación actual
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="ocupaciones-sugeridas"
                    required
                    value={form.ocupacion}
                    onChange={(e) => handleChange("ocupacion", e.target.value)}
                    placeholder="Ej. Ingeniera de datos, Comerciante..."
                    className="w-full bg-[#F3F4F6] focus:bg-white border border-transparent focus:border-[#820AD1] text-xs text-slate-900 rounded-2xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#820AD1]/15 transition-all"
                  />
                  <Briefcase
                    size={15}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <datalist id="ocupaciones-sugeridas">
                    {OCUPACIONES_SUGERIDAS.map((opcion) => (
                      <option key={opcion} value={opcion} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl px-4 py-3 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck size={15} className="text-[#820AD1] shrink-0" />
            <span>
              Tus datos están protegidos bajo la Ley 1581 de 2012 y solo se
              usarán para gestionar tu solicitud.
            </span>
          </div>
        </div>

        {/* Barra inferior de botones tipo píldora */}
        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBackToStart}
          >
            Salir al inicio
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={<ArrowRight size={15} strokeWidth={2} />}
          >
            Siguiente: Datos financieros
          </Button>
        </div>
      </form>
    </WizardShell>
  );
};
