import { useEffect, useRef, useState } from "react";

interface DropOverlayProps {
  activo: boolean;
  onArchivosSoltados: (archivos: File[]) => void;
  titulo?: string;
  subtitulo?: string;
}

export function DropOverlay({
  activo,
  onArchivosSoltados,
  titulo = "¡Suéltalo!",
  subtitulo = "Suelta aquí tu cédula o soporte financiero (PDF o JPG)",
}: DropOverlayProps) {
  const [arrastrando, setArrastrando] = useState(false);
  const contadorArrastre = useRef(0);

  useEffect(() => {
    if (!activo) {
      setArrastrando(false);
      contadorArrastre.current = 0;
      return;
    }

    const esArchivo = (e: DragEvent) =>
      Boolean(
        e.dataTransfer?.types &&
        Array.from(e.dataTransfer.types).includes("Files"),
      );

    const handleDragEnter = (e: DragEvent) => {
      if (!esArchivo(e)) return;
      e.preventDefault();
      contadorArrastre.current += 1;
      setArrastrando(true);
    };

    const handleDragOver = (e: DragEvent) => {
      if (!esArchivo(e)) return;
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!esArchivo(e)) return;
      e.preventDefault();
      contadorArrastre.current -= 1;
      if (contadorArrastre.current <= 0) {
        contadorArrastre.current = 0;
        setArrastrando(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (!esArchivo(e)) return;
      e.preventDefault();
      contadorArrastre.current = 0;
      setArrastrando(false);

      const archivos = Array.from(e.dataTransfer?.files || []);
      if (archivos.length > 0) {
        onArchivosSoltados(archivos);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [activo, onArchivosSoltados]);

  if (!activo || !arrastrando) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm transition-opacity duration-150">
      <div className="mx-6 flex w-full max-w-xl flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#A855F7] bg-[#820AD1]/20 px-8 py-14 text-center shadow-2xl">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#820AD1] text-white shadow-lg">
          <svg
            className="h-8 w-8 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </div>
        <p className="text-4xl font-extrabold tracking-tight text-white">
          {titulo}
        </p>
        <p className="mt-2 text-sm font-medium text-purple-200">{subtitulo}</p>
      </div>
    </div>
  );
}
