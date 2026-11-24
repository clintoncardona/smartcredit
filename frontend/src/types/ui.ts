// src/types/ui.ts
import React from 'react';

// --- TIPOS PARA EL BOTÓN ---
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean; // Para mostrar el spinner de carga
  icon?: React.ReactNode; // Permite pasar un icono de Lucide React
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean; // Si es true, el botón ocupa todo el ancho disponible
}

// --- TIPOS PARA EL INPUT ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string; // Si hay error, el input se pondrá rojo automáticamente
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// --- TIPOS PARA EL BADGE (Etiquetas de estado) ---
export type BadgeVariant = 'purple' | 'green' | 'red' | 'amber' | 'gray';
export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  showDot?: boolean; // Muestra un puntito de color al lado del texto
  className?: string;
}

// --- TIPOS PARA ALERTAS ---
export type AlertVariant = 'danger' | 'warning' | 'success' | 'info';
export interface AlertProps {
  title?: string;
  description: React.ReactNode;
  variant?: AlertVariant;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

// --- TIPOS PARA STEP WIZARD (Progreso) ---
export interface Step {
  id: number;
  label: string;
}
export interface StepWizardProps {
  steps: Step[];
  currentStep: number;
}

// --- TIPOS PARA TARJETAS MÉTRICAS (Mesa de Control) ---
export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

// --- TIPOS PARA TIMELINE (Seguimiento de crédito) ---
export interface TimelineStep {
  id: string | number;
  title: string;
  dateOrInfo?: string;
  status: 'completed' | 'current' | 'pending';
}
export interface TimelineTrackerProps {
  steps: TimelineStep[];
  className?: string;
}

// --- TIPOS PARA TARJETA DE DOCUMENTO ---
export interface DocumentCardProps {
  title: string;
  subtitle: string;
  fileInfo: string;
  badgeText?: string;
  onDownload: () => void;
  isLoading?: boolean;
  className?: string;
}

// --- TIPOS PARA GRÁFICOS ---
export interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  metricValue?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}