import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { MetricCardProps } from '../../types/ui';

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  active = false,
  onClick
}) => {
  return (
    <motion.div
      whileHover={onClick ? { y: -2, transition: { duration: 0.2 } } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={clsx(
        "p-5 rounded-2xl border transition-all duration-200 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)]",
        active ? "border-purple-500 ring-2 ring-purple-500/10" : "border-gray-100 hover:border-gray-200",
        onClick && "cursor-pointer" // Solo aplica cursor pointer si el botón hace algo (onClick)
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium text-gray-500">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
        {value}
      </div>
      {subtitle && (
        <p className="text-[11px] text-gray-400 font-normal">{subtitle}</p>
      )}
    </motion.div>
  );
};