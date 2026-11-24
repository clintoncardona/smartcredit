import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-[#820AD1] hover:bg-[#6D08B0] text-white shadow-xs",
    secondary: "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#820AD1]",
    outline:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
    danger: "bg-[#DC2626] hover:bg-[#B91C1C] text-white",
    success: "bg-[#059669] hover:bg-[#047857] text-white",
  };

  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "text-xs px-3.5 py-2",
    md: "text-xs px-5 py-2.5",
    lg: "text-sm px-6 py-3",
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {children}
      {icon}
    </button>
  );
};
