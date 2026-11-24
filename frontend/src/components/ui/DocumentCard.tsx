import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { DocumentCardProps } from '../../types/ui';

export const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  subtitle,
  fileInfo,
  badgeText,
  onDownload,
  isLoading = false,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={clsx(
        "bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <FileText size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
            {badgeText && (
              <span className="bg-purple-100 text-purple-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
          <p className="text-[11px] text-gray-400 font-medium">{fileInfo}</p>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={onDownload}
        disabled={isLoading}
        className="w-full md:w-auto bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-purple-200 transition-colors cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <>
            <Download size={16} />
            <span>Descargar PDF</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
};