import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ChartCardProps } from '../../types/ui';

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badge,
  metricValue,
  helperText,
  children, // El gráfico real se inyectará aquí adentro más adelante
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={clsx(
        "bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm tracking-tight">{title}</h3>
            {badge && (
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {metricValue && (
          <span className="text-sm font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
            {metricValue}
          </span>
        )}
      </div>

      <div className="my-2 flex-1 w-full">
        {children}
      </div>

      {helperText && (
        <div className="border-t border-gray-50 pt-3 mt-2">
          <p className="text-[11px] text-gray-400 leading-relaxed">{helperText}</p>
        </div>
      )}
    </motion.div>
  );
};