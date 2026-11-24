import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { TimelineTrackerProps } from '../../types/ui';

export const TimelineTracker: React.FC<TimelineTrackerProps> = ({ steps, className }) => {
  return (
    <div className={clsx("w-full py-4 px-2", className)}>
      <div className="flex items-center justify-between relative max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    isCompleted && "bg-emerald-600 text-white shadow-sm shadow-emerald-200",
                    isCurrent && "bg-purple-600 text-white ring-4 ring-purple-100 shadow-sm shadow-purple-200",
                    !isCompleted && !isCurrent && "bg-gray-200 text-gray-500"
                  )}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : index + 1}
                </motion.div>
                
                <div className="text-center mt-2">
                  <p className={clsx(
                    "text-xs font-semibold",
                    isCurrent ? "text-purple-700" : isCompleted ? "text-gray-900" : "text-gray-400"
                  )}>
                    {step.title}
                  </p>
                  {step.dateOrInfo && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{step.dateOrInfo}</p>
                  )}
                </div>
              </div>

              {!isLast && (
                <div className="flex-1 h-[2px] bg-gray-200 mx-4 relative -top-5 z-0">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-emerald-600"
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