import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { StepWizardProps } from '../../types/ui';

export const StepWizard: React.FC<StepWizardProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        {/* Usamos el método .map de JavaScript para iterar sobre el array de pasos (steps) y dibujar cada uno */}
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2.5 z-10 bg-gray-50 px-2">
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300",
                    isCompleted && "bg-purple-600 text-white",
                    isCurrent && "bg-purple-600 text-white ring-4 ring-purple-100 shadow-sm shadow-purple-200",
                    !isCompleted && !isCurrent && "bg-gray-200 text-gray-500"
                  )}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
                </div>
                <span
                  className={clsx(
                    "text-xs font-semibold hidden md:inline transition-colors",
                    isCurrent ? "text-purple-700" : isCompleted ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Barra que conecta los pasos */}
              {!isLast && (
                <div className="flex-1 h-[2px] bg-gray-200 mx-2 relative -z-0">
                  <div
                    className="h-full bg-purple-600 transition-all duration-500 ease-out"
                    style={{ width: isCompleted ? '100%' : '0%' }} // Llena la barra si el paso anterior está completado
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};