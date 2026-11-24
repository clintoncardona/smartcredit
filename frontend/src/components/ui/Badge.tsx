import React from "react";

interface BadgeProps {
  variant?: "green" | "amber" | "red" | "indigo" | "purple" | "slate";
  children: React.ReactNode;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "purple",
  children,
  showDot = true,
}) => {
  const styles: Record<
    NonNullable<BadgeProps["variant"]>,
    { pill: string; dot: string }
  > = {
    green: {
      pill: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
      dot: "bg-[#10B981]",
    },
    amber: {
      pill: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
      dot: "bg-[#F59E0B]",
    },
    red: {
      pill: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
      dot: "bg-[#EF4444]",
    },
    indigo: {
      pill: "bg-[#F3E8FF] text-[#820AD1] border-[#E9D5FF]",
      dot: "bg-[#820AD1]",
    },
    purple: {
      pill: "bg-[#F3E8FF] text-[#820AD1] border-[#E9D5FF]",
      dot: "bg-[#820AD1]",
    },
    slate: {
      pill: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-500",
    },
  };

  const current = styles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${current.pill}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      )}
      {children}
    </span>
  );
};
