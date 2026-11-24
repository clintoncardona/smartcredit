import React from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { Badge } from './Badge';
import { StepWizard } from './StepWizard';

interface ClientFlowLayoutProps {
  currentStep: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  userName: string;
  sidebar: React.ReactNode; // Aquí inyectaremos SolicitudSummaryCard
  children: React.ReactNode; // Aquí va el formulario del paso actual
}

const CREDIT_STEPS = [
  { id: 1, label: 'Datos personales' },
  { id: 2, label: 'Información financiera' },
  { id: 3, label: 'Soportes' },
  { id: 4, label: 'Confirmación' },
];

export const ClientFlowLayout: React.FC<ClientFlowLayoutProps> = ({
  currentStep,
  title,
  subtitle,
  userName,
  sidebar,
  children,
}) => {
  // Obtener iniciales del usuario (ej. "Juan Pérez" -> "JP")
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'JP';

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-slate-800">
      {/* HEADER MORADO CORPORATIVO */}
      <header className="w-full bg-[#6D0AD6] text-white px-6 md:px-12 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 font-semibold text-base md:text-lg">
            <div className="bg-white text-[#6D0AD6] w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-sm">
              M
            </div>
            <span>Banco Andino - SmartCredit</span>
          </div>

          <div className="flex items-center gap-4 text-xs md:text-sm">
            <span className="hidden sm:inline text-purple-100 font-medium">
              Solicitud de crédito
            </span>
            <div className="h-4 w-[1px] bg-purple-400/40 hidden sm:block" />
            <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
              <div className="w-7 h-7 rounded-full bg-purple-500/60 border border-purple-300/40 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <span className="font-medium">{userName || 'Juan Pérez'}</span>
              <ChevronDown size={15} className="text-purple-200" />
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Cabecera del Paso */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-purple-700 mb-1">
              TU CRÉDITO, PASO A PASO
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className="self-start sm:self-center">
            <Badge variant="purple">Paso {currentStep} de 4</Badge>
          </div>
        </div>

        {/* Barra de Progreso (StepWizard) */}
        <div className="mb-6">
          <StepWizard steps={CREDIT_STEPS} currentStep={currentStep} />
        </div>

        {/* Grilla de 2 Columnas: Formulario (Izquierda) + Resumen (Derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">{children}</div>
          <div className="lg:col-span-4 lg:sticky lg:top-6">{sidebar}</div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full px-6 py-6 mt-8 border-t border-gray-200/60">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <p>© 2026 Banco Andino S.A. - SmartCredit</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">
              Política de privacidad
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors text-purple-700 font-medium">
              ¿Necesitas ayuda?
            </a>
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} /> Conexión segura
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};