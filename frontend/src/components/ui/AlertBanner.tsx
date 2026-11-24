import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import React from "react";

interface AlertBannerProps {
  variant?: "success" | "warning" | "danger" | "info";
  title: string;
  description?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = "info",
  title,
  description,
}) => {
  const styles = {
    success: {
      box: "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]",
      icon: (
        <CheckCircle2
          size={16}
          strokeWidth={2}
          className="text-[#059669] shrink-0 mt-0.5"
        />
      ),
    },
    warning: {
      box: "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]",
      icon: (
        <AlertTriangle
          size={16}
          strokeWidth={2}
          className="text-[#D97706] shrink-0 mt-0.5"
        />
      ),
    },
    danger: {
      box: "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]",
      icon: (
        <XCircle
          size={16}
          strokeWidth={2}
          className="text-[#DC2626] shrink-0 mt-0.5"
        />
      ),
    },
    info: {
      box: "bg-[#FAF5FF] border-[#E9D5FF] text-[#581C87]",
      icon: (
        <Info
          size={16}
          strokeWidth={2}
          className="text-[#820AD1] shrink-0 mt-0.5"
        />
      ),
    },
  }[variant];

  return (
    <div
      className={`border rounded-2xl p-4 flex items-start gap-3 text-xs ${styles.box}`}
    >
      {styles.icon}
      <div>
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="mt-0.5 opacity-90 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
};
