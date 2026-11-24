import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { InputProps } from '../../types/ui';

// forwardRef es avanzado, pero necesario para que el input funcione con librerías de formularios como React Hook Form
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {/* Renderizado condicional: Solo muestra el label si se envía en los props */}
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-gray-700 ml-0.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={twMerge(
            clsx(
              "w-full bg-gray-50/80 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200",
              "focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600",
              "disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20",
              className
            )
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-gray-400 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
      {/* Si hay error, mostramos el mensaje en rojo */}
      {error && <p className="text-xs text-red-600 font-medium ml-1">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-gray-500 ml-1">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';