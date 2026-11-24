import React from 'react';
import { HelpCircle, ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-slate-800">
      {/* HEADER FIJO */}
      <header className="w-full flex justify-between items-center px-6 md:px-12 py-6">
        <div className="flex items-center gap-2 text-purple-700 font-semibold text-lg">
          <div className="bg-purple-700 text-white p-1.5 rounded-lg">
             <span className="font-bold text-sm tracking-tighter">M</span>
          </div>
          Banco Andino - SmartCredit
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors">
          <HelpCircle size={18} />
          <span className="hidden sm:inline">Centro de ayuda</span>
        </button>
      </header>

      {/* CONTENIDO DINÁMICO (Aquí se inyectará el Login o el Registro) */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* FOOTER FIJO */}
      <footer className="w-full px-6 py-8 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <ShieldCheck size={16} />
          <span>Tus datos, siempre protegidos.</span>
        </div>
        
        <div className="w-full flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 max-w-6xl mx-auto gap-4">
          <p>© 2026 Banco Andino S.A. - SmartCredit</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Política de privacidad</a>
            <a href="#" className="hover:text-gray-600 transition-colors text-purple-700 font-medium">¿Necesitas ayuda?</a>
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} /> Conexión segura
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};