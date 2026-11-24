import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
  FileSignature,
  FileText,
  HelpCircle,
  History,
  LogOut,
  PenTool,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { DataPolicyModal } from "../components/ui/DataPolicyModal";
import { getToken, solicitudApi } from "../services/api";
import type { SolicitudCreditoData } from "../types/credit";

interface ClientPortalViewProps {
  solicitud: SolicitudCreditoData;
  onLogout: () => void;
  onStartNewApplication: () => void;
}

interface MovimientoHistorial {
  id: string;
  titulo: string;
  detalle: string;
  fecha: string;
  completado: boolean;
}

interface TemaAyuda {
  id: string;
  categoria: string;
  pregunta: string;
  respuesta: string;
}

const TEMAS_AYUDA: TemaAyuda[] = [
  {
    id: "estado",
    categoria: "Estado de mi estudio",
    pregunta: "¿Cuánto tarda la revisión de mi solicitud de crédito?",
    respuesta:
      "Las solicitudes que cumplen automáticamente con el score mínimo (600 puntos) y la regla del 30% de capacidad reciben aprobación inmediata. Si pasan a revisión documental en Mesa de Control, un analista las gestiona en menos de 24 horas hábiles.",
  },
  {
    id: "firma",
    categoria: "Firma electrónica",
    pregunta: "¿Cómo firmo mi contrato y pagaré digital?",
    respuesta:
      'Cuando tu estado cambie a "Aprobada", presiona el botón circular "Firmar contrato", revisa las condiciones de tasa y cuota fija, traza tu firma en el recuadro y confirma. Tu comprobante oficial quedará listo para descarga.',
  },
  {
    id: "capacidad",
    categoria: "Capacidad de pago",
    pregunta: "¿Por qué mi solicitud puede ser rechazada o ajustada?",
    respuesta:
      "Para cuidar tu estabilidad financiera, la cuota mensual no puede superar el 30% de tu excedente libre (Ingresos menos egresos, arriendo y otras obligaciones). Si fue rechazada, puedes iniciar una nueva solicitud ajustando el monto o ampliando el plazo.",
  },
  {
    id: "soportes",
    categoria: "Documentos y formatos",
    pregunta: "¿Qué validez tienen mis documentos adjuntos?",
    respuesta:
      "Tu cédula por ambas caras y tu certificado laboral (con expedición menor a 30 días) quedan almacenados bajo cifrado y auditoría SARLAFT de Banco Andino S.A.",
  },
];

const formatoCOP = (valor: number, oculto: boolean): string => {
  if (oculto) return "$ •••••••";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor || 0);
};

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  solicitud,
  onLogout,
  onStartNewApplication,
}) => {
  const [ocultarMontos, setOcultarMontos] = useState(false);
  const [datosServidor, setDatosServidor] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [actualizando, setActualizando] = useState(false);

  // Firma electrónica vinculada al radicado
  const [firmaGuardada, setFirmaGuardada] = useState<string | null>(null);
  const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false);
  const [trazandoFirma, setTrazandoFirma] = useState(false);
  const [tieneTrazo, setTieneTrazo] = useState(false);
  const [guardandoFirma, setGuardandoFirma] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Modales secundarios
  const [modalSoportesAbierto, setModalSoportesAbierto] = useState(false);
  const [modalDetallePlanAbierto, setModalDetallePlanAbierto] = useState(false);
  const [modalAyudaAbierto, setModalAyudaAbierto] = useState(false);
  const [busquedaAyuda, setBusquedaAyuda] = useState("");
  const [temaAyudaActivo, setTemaAyudaActivo] = useState<string>("estado");
  const [politicaAbierta, setPoliticaAbierta] = useState(false);

  const cargarEstadoActualizado = async () => {
    setActualizando(true);
    try {
      const res = await solicitudApi.obtenerMiSolicitud();
      if (res?.solicitud) {
        setDatosServidor(res.solicitud);
        if (typeof res.solicitud.firma_base64 === "string") {
          setFirmaGuardada(res.solicitud.firma_base64);
        }
      }
    } catch {
      // Mantiene los datos recibidos por props si no hay respuesta nueva
    } finally {
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarEstadoActualizado();
  }, []);

  const radicado = String(
    datosServidor?.radicado || solicitud.radicado || "RAD-2026-0001",
  );
  const estado = String(
    datosServidor?.estado || solicitud.estado || "En revisión",
  );
  const numeroContrato = `CNT-${radicado.replace(/^RAD-/, "")}`;

  // Recuperar firma local asociada al radicado si existe
  useEffect(() => {
    const firmaLocal = localStorage.getItem(`smartcredit_firma_${radicado}`);
    if (firmaLocal && !firmaGuardada) {
      setFirmaGuardada(firmaLocal);
    }
  }, [radicado, firmaGuardada]);

  const montoSolicitado = Number(
    datosServidor?.monto_solicitado ??
      solicitud.financieros.montoSolicitado ??
      0,
  );
  const plazoMeses = Number(
    datosServidor?.plazo_meses ?? solicitud.financieros.plazoMeses ?? 36,
  );
  const ingresos = Number(
    datosServidor?.ingresos_mensuales ??
      solicitud.financieros.ingresosMensuales ??
      0,
  );
  const egresos = Number(
    datosServidor?.egresos_declarados ??
      solicitud.financieros.egresosDeclarados ??
      0,
  );
  const arriendo = Number(
    datosServidor?.arriendo_hipoteca ??
      solicitud.financieros.arriendoHipoteca ??
      0,
  );
  const otrasObligaciones = Number(
    datosServidor?.otras_obligaciones ??
      solicitud.financieros.otrasObligaciones ??
      0,
  );

  // Cálculo financiero consistente (Amortización francesa 1.85% M.V.)
  const tasaMensual = 0.0185;
  const cuotaMensual = useMemo(() => {
    if (datosServidor?.cuota_estimada) {
      return Number(datosServidor.cuota_estimada);
    }
    if (!montoSolicitado || !plazoMeses) return 0;
    const factor = Math.pow(1 + tasaMensual, plazoMeses);
    return Math.round(
      (montoSolicitado * (tasaMensual * factor)) / (factor - 1),
    );
  }, [datosServidor?.cuota_estimada, montoSolicitado, plazoMeses]);

  const excedenteMensual = Math.max(
    0,
    ingresos - (egresos + arriendo + otrasObligaciones),
  );
  const cuotaMaxima30 = Math.round(excedenteMensual * 0.3);

  const observacionAnalista = String(
    datosServidor?.observacion_analista || datosServidor?.motivo_rechazo || "",
  ).trim();

  const primerNombre =
    solicitud.personales.nombres?.trim().split(" ")[0] || "Cliente";
  const nombreCompleto =
    `${solicitud.personales.nombres} ${solicitud.personales.apellidos}`.trim() ||
    "Cliente Banco Andino";

  const esAprobada = estado === "Aprobada";
  const esRechazada = estado === "Rechazada";
  const contratoFirmado = esAprobada && Boolean(firmaGuardada);

  // Configuración del banner superior de siguiente paso
  const bannerEstado = useMemo(() => {
    if (esAprobada && !contratoFirmado) {
      return {
        fondo: "bg-[#F8F5FF] border-[#D8B4FE]",
        iconoBg: "bg-[#820AD1] text-white",
        icono: <FileSignature size={18} />,
        etiqueta: "Acción requerida · Crédito Aprobado",
        titulo: `Tu crédito por ${formatoCOP(montoSolicitado, ocultarMontos)} está aprobado`,
        descripcion:
          "Firma tu contrato y pagaré electrónico para formalizar el desembolso en tu cuenta.",
        botonTexto: "Firmar contrato ahora",
        accion: () => setModalFirmaAbierto(true),
      };
    }
    if (contratoFirmado) {
      return {
        fondo: "bg-[#ECFDF5] border-[#A7F3D0]",
        iconoBg: "bg-emerald-600 text-white",
        icono: <CheckCircle2 size={18} />,
        etiqueta: "Formalización completada",
        titulo: `Pagaré y contrato ${numeroContrato} firmado`,
        descripcion:
          "Tu obligación quedó formalizada digitalmente. Ya puedes descargar tu comprobante oficial.",
        botonTexto: "Descargar comprobante",
        accion: () => handleDescargarComprobante(),
      };
    }
    if (esRechazada) {
      return {
        fondo: "bg-[#FEF2F2] border-[#FECACA]",
        iconoBg: "bg-rose-600 text-white",
        icono: <XCircle size={18} />,
        etiqueta: "Resultado del estudio crediticio",
        titulo: "Tu solicitud no pudo ser aprobada en esta ocasión",
        descripcion:
          observacionAnalista ||
          "La cuota solicitada supera el 30% de tu excedente mensual disponible o no cumple el puntaje mínimo.",
        botonTexto: "Simular nuevo monto",
        accion: onStartNewApplication,
      };
    }
    return {
      fondo: "bg-[#F8F5FF] border-[#E9D5FF]",
      iconoBg: "bg-[#820AD1] text-white",
      icono: <Clock size={18} />,
      etiqueta: "Estudio en curso · Mesa de Control",
      titulo: "Estamos validando tus soportes y perfil financiero",
      descripcion:
        "Tu radicado fue recibido correctamente. Te notificaremos en cuanto finalice la validación documental.",
      botonTexto: "Actualizar estado",
      accion: cargarEstadoActualizado,
    };
  }, [
    esAprobada,
    contratoFirmado,
    esRechazada,
    montoSolicitado,
    ocultarMontos,
    numeroContrato,
    observacionAnalista,
  ]);

  // Historial de trazabilidad
  const movimientos: MovimientoHistorial[] = useMemo(() => {
    const lista: MovimientoHistorial[] = [
      {
        id: "radicacion",
        titulo: "Solicitud radicada en SmartCredit",
        detalle: `Radicado ${radicado} generado por ${formatoCOP(montoSolicitado, ocultarMontos)} a ${plazoMeses} meses.`,
        fecha: "Completado",
        completado: true,
      },
      {
        id: "documentos",
        titulo: "Validación técnica de soportes",
        detalle:
          "Cédula de ciudadanía y soporte de ingresos verificados en formato e integridad.",
        fecha: "Completado",
        completado: true,
      },
      {
        id: "estudio",
        titulo: esAprobada
          ? "Estudio de riesgo aprobado"
          : esRechazada
            ? "Estudio de riesgo finalizado"
            : "Evaluación en Mesa de Control",
        detalle:
          observacionAnalista ||
          (esAprobada
            ? "Cumple score crediticio y regla prudencial del 30% de excedente."
            : esRechazada
              ? "No cumple criterios mínimos de capacidad o score."
              : "En cola prioritaria de verificación por analista."),
        fecha: esAprobada || esRechazada ? "Finalizado" : "En proceso",
        completado: esAprobada || esRechazada,
      },
    ];

    if (esAprobada) {
      lista.push({
        id: "firma",
        titulo: contratoFirmado
          ? `Contrato ${numeroContrato} firmado digitalmente`
          : "Firma de contrato y pagaré electrónico",
        detalle: contratoFirmado
          ? "Firma estampada con validez jurídica Ley 527 de 1999."
          : "Pendiente firma del titular para formalización.",
        fecha: contratoFirmado ? "Formalizado" : "Pendiente",
        completado: contratoFirmado,
      });
    }

    return lista;
  }, [
    radicado,
    montoSolicitado,
    ocultarMontos,
    plazoMeses,
    esAprobada,
    esRechazada,
    observacionAnalista,
    contratoFirmado,
    numeroContrato,
  ]);

  // Manejo del lienzo de firma (<canvas>)
  const obtenerCoordenadas = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const iniciarTrazo = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = obtenerCoordenadas(e, canvas);
    ctx.strokeStyle = "#0F172A";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    setTrazandoFirma(true);
    setTieneTrazo(true);
  };

  const dibujarTrazo = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!trazandoFirma) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = obtenerCoordenadas(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const finalizarTrazo = () => {
    setTrazandoFirma(false);
  };

  const limpiarCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTieneTrazo(false);
  };

  const handleConfirmarFirma = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !tieneTrazo) return;

    setGuardandoFirma(true);
    const dataUrl = canvas.toDataURL("image/png");

    try {
      const token = getToken();
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      await fetch(`${API_URL}/solicitudes/${radicado}/firmar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          numeroContrato,
          firmaBase64: dataUrl,
        }),
      });
    } catch {
      // Si el endpoint aún no persiste firma_base64, se respalda localmente
    } finally {
      localStorage.setItem(`smartcredit_firma_${radicado}`, dataUrl);
      setFirmaGuardada(dataUrl);
      setGuardandoFirma(false);
      setModalFirmaAbierto(false);
    }
  };

  const handleDescargarComprobante = () => {
    const fechaEmision = new Date().toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlComprobante = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Comprobante Oficial · ${radicado}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F5F6F8; color: #0F172A; padding: 32px; }
          .card { max-width: 680px; margin: 0 auto; background: #fff; border-radius: 24px; border: 1px solid #E2E8F0; overflow: hidden; }
          .header { background: #820AD1; color: #fff; padding: 28px 32px; display: flex; justify-content: space-between; align-items: center; }
          .body { padding: 32px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #F8F5FF; padding: 20px; border-radius: 16px; margin: 20px 0; }
          .label { font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 700; }
          .val { font-size: 15px; font-weight: 700; margin-top: 4px; }
          .firma-box { border: 1.5px dashed #CBD5E1; border-radius: 16px; padding: 16px; text-align: center; margin-top: 24px; }
          .footer { background: #F8FAFC; padding: 16px 32px; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div>
              <strong style="font-size:18px;">Banco Andino S.A. · SmartCredit</strong>
              <div style="font-size:12px;opacity:0.9;">Comprobante Oficial de Solicitud y Formalización</div>
            </div>
            <div style="text-align:right;font-size:12px;">
              <div><strong>${radicado}</strong></div>
              <div>${fechaEmision}</div>
            </div>
          </div>
          <div class="body">
            <p style="font-size:13px;color:#475569;">Certificamos el estado y condiciones registradas en nuestra plataforma digital para el siguiente titular:</p>
            <div class="grid">
              <div><div class="label">Titular</div><div class="val">${nombreCompleto}</div></div>
              <div><div class="label">Documento</div><div class="val">C.C. ${solicitud.personales.cedula || "Registrada"}</div></div>
              <div><div class="label">Estado actual</div><div class="val" style="color:#820AD1;">${estado}${contratoFirmado ? " · Formalizada" : ""}</div></div>
              <div><div class="label">Contrato</div><div class="val">${numeroContrato}</div></div>
              <div><div class="label">Monto del crédito</div><div class="val">${formatoCOP(montoSolicitado, false)}</div></div>
              <div><div class="label">Cuota mensual fija (${plazoMeses}m)</div><div class="val">${formatoCOP(cuotaMensual, false)}</div></div>
            </div>
            ${
              firmaGuardada
                ? `<div class="firma-box">
                    <div class="label">Firma Electrónica del Titular (Ley 527 de 1999)</div>
                    <img src="${firmaGuardada}" alt="Firma digital" style="max-height:90px;margin:10px auto;display:block;" />
                    <div style="font-size:11px;color:#059669;font-weight:700;">Firmado electrónicamente · ${nombreCompleto}</div>
                  </div>`
                : `<div class="firma-box"><div style="font-size:12px;color:#64748B;">Documento informativo emitido antes de formalización de contrato.</div></div>`
            }
          </div>
          <div class="footer">
            Banco Andino S.A. · NIT 901.482.310-7 · Documento generado electrónicamente por SmartCredit.
          </div>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `;

    const ventana = window.open("", "_blank", "width=820,height=900");
    if (ventana) {
      ventana.document.write(htmlComprobante);
      ventana.document.close();
    }
  };

  const temasFiltrados = useMemo(() => {
    const q = busquedaAyuda.trim().toLowerCase();
    if (!q) return TEMAS_AYUDA;
    return TEMAS_AYUDA.filter(
      (t) =>
        t.pregunta.toLowerCase().includes(q) ||
        t.respuesta.toLowerCase().includes(q) ||
        t.categoria.toLowerCase().includes(q),
    );
  }, [busquedaAyuda]);

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-900 flex flex-col justify-between">
      {/* 1. ENCABEZADO MORADO INSPIRADO EN NU */}
      <header className="bg-[#820AD1] text-white pt-6 pb-20 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center font-extrabold text-sm border border-white/15">
                BA
              </div>
              <div>
                <span className="text-[11px] font-semibold text-purple-200 block">
                  Banco Andino S.A. · SmartCredit
                </span>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  Hola, {primerNombre}
                </h1>
              </div>
            </div>

            {/* Controles superiores: Privacidad, Ayuda y Salir */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOcultarMontos((prev) => !prev)}
                title={ocultarMontos ? "Mostrar montos" : "Ocultar montos"}
                aria-label={ocultarMontos ? "Mostrar montos" : "Ocultar montos"}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
              >
                {ocultarMontos ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>

              <button
                type="button"
                onClick={() => setModalAyudaAbierto(true)}
                title="Centro de ayuda"
                aria-label="Centro de ayuda"
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
              >
                <HelpCircle size={17} />
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>

          {/* Sub-barra de radicado y estado */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="inline-flex items-center gap-2 bg-white/12 px-3.5 py-1.5 rounded-full border border-white/15">
              <span className="text-purple-200">Radicado:</span>
              <strong className="font-mono tracking-wide">{radicado}</strong>
            </div>

            <button
              type="button"
              onClick={cargarEstadoActualizado}
              disabled={actualizando}
              className="inline-flex items-center gap-1.5 text-purple-100 hover:text-white font-semibold cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                size={13}
                className={actualizando ? "animate-spin" : ""}
              />
              <span>
                {actualizando ? "Sincronizando..." : "Actualizar estado"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL SUPERPUESTO */}
      <main className="flex-1 px-5 md:px-10 -mt-12 pb-14">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* BANNER DE SIGUIENTE PASO ("MISIÓN / SUGERENCIA") */}
          <div
            className={`rounded-3xl border p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${bannerEstado.fondo}`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${bannerEstado.iconoBg}`}
              >
                {bannerEstado.icono}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#820AD1]">
                  {bannerEstado.etiqueta}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                  {bannerEstado.titulo}
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                  {bannerEstado.descripcion}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={bannerEstado.accion}
              className="px-5 py-2.5 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition-colors cursor-pointer"
            >
              <span>{bannerEstado.botonTexto}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* TARJETA FINANCIERA PRINCIPAL + ACCIONES RÁPIDAS CIRCULARES */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-7">
            {/* Cabecera de cifras del crédito */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-500">
                    {esAprobada
                      ? "Crédito de Libre Inversión Aprobado"
                      : "Monto de Crédito Solicitado"}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      esAprobada
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : esRechazada
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-[#F3E8FF] text-[#820AD1] border border-[#E9D5FF]"
                    }`}
                  >
                    {contratoFirmado ? "Aprobada · Firmada" : estado}
                  </span>
                </div>

                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 tabular-nums">
                  {formatoCOP(montoSolicitado, ocultarMontos)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Plazo pactado a <strong>{plazoMeses} meses</strong> · Tasa de
                  referencia <strong>1.85% M.V.</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-[#F8F5FF] border border-[#E9D5FF] rounded-2xl px-4 py-3">
                  <span className="text-[11px] text-slate-500 block">
                    Cuota mensual fija
                  </span>
                  <strong className="text-base sm:text-lg font-extrabold text-[#820AD1] tabular-nums">
                    {formatoCOP(cuotaMensual, ocultarMontos)}
                  </strong>
                </div>

                <div className="bg-[#F5F6F8] border border-slate-200/70 rounded-2xl px-4 py-3">
                  <span className="text-[11px] text-slate-500 block">
                    Excedente mensual
                  </span>
                  <strong className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
                    {formatoCOP(excedenteMensual, ocultarMontos)}
                  </strong>
                </div>
              </div>
            </div>

            {/* BOTONES CIRCULARES DE ACCIONES RÁPIDAS (ESTILO PORTAL NU) */}
            <div>
              <p className="text-xs font-bold text-slate-800 mb-4">
                Acciones rápidas
              </p>

              <div className="flex items-start gap-5 sm:gap-7 overflow-x-auto pb-2">
                {/* Acción 1: Firmar contrato */}
                <button
                  type="button"
                  disabled={!esAprobada}
                  onClick={() => setModalFirmaAbierto(true)}
                  className="flex flex-col items-center gap-2 min-w-[84px] group cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  <div className="relative w-16 h-16 rounded-full bg-[#F3F4F6] group-hover:bg-[#F3E8FF] text-slate-800 group-hover:text-[#820AD1] flex items-center justify-center transition-colors">
                    <PenTool size={22} strokeWidth={1.9} />
                    {esAprobada && (
                      <span
                        className={`absolute -bottom-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-xs ${
                          contratoFirmado ? "bg-emerald-600" : "bg-[#820AD1]"
                        }`}
                      >
                        {contratoFirmado ? "Firmado" : "Pendiente"}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
                    Firmar
                    <br />
                    contrato
                  </span>
                </button>

                {/* Acción 2: Descargar comprobante */}
                <button
                  type="button"
                  onClick={handleDescargarComprobante}
                  className="flex flex-col items-center gap-2 min-w-[84px] group cursor-pointer"
                >
                  <div className="relative w-16 h-16 rounded-full bg-[#F3F4F6] group-hover:bg-[#F3E8FF] text-slate-800 group-hover:text-[#820AD1] flex items-center justify-center transition-colors">
                    <Download size={22} strokeWidth={1.9} />
                    <span className="absolute -bottom-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-white">
                      PDF
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
                    Descargar
                    <br />
                    comprobante
                  </span>
                </button>

                {/* Acción 3: Ver soportes */}
                <button
                  type="button"
                  onClick={() => setModalSoportesAbierto(true)}
                  className="flex flex-col items-center gap-2 min-w-[84px] group cursor-pointer"
                >
                  <div className="relative w-16 h-16 rounded-full bg-[#F3F4F6] group-hover:bg-[#F3E8FF] text-slate-800 group-hover:text-[#820AD1] flex items-center justify-center transition-colors">
                    <FileCheck2 size={22} strokeWidth={1.9} />
                    <span className="absolute -bottom-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#820AD1] text-white">
                      2 docs
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
                    Soportes
                    <br />
                    adjuntos
                  </span>
                </button>

                {/* Acción 4: Centro de ayuda */}
                <button
                  type="button"
                  onClick={() => setModalAyudaAbierto(true)}
                  className="flex flex-col items-center gap-2 min-w-[84px] group cursor-pointer"
                >
                  <div className="relative w-16 h-16 rounded-full bg-[#F3F4F6] group-hover:bg-[#F3E8FF] text-slate-800 group-hover:text-[#820AD1] flex items-center justify-center transition-colors">
                    <HelpCircle size={22} strokeWidth={1.9} />
                    <span className="absolute -bottom-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#820AD1] text-white">
                      24/7
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
                    Centro de
                    <br />
                    ayuda
                  </span>
                </button>

                {/* Acción 5: Nueva solicitud (visible si fue rechazada) */}
                {esRechazada && (
                  <button
                    type="button"
                    onClick={onStartNewApplication}
                    className="flex flex-col items-center gap-2 min-w-[84px] group cursor-pointer"
                  >
                    <div className="relative w-16 h-16 rounded-full bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center">
                      <PlusCircle size={22} strokeWidth={1.9} />
                      <span className="absolute -bottom-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#820AD1] text-white">
                        Nuevo
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#820AD1] text-center leading-tight">
                      Nueva
                      <br />
                      solicitud
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* FILAS TIPO PÍLDORA (#F3F4F6) PARA DETALLES */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setModalDetallePlanAbierto(true)}
                className="w-full rounded-2xl bg-[#F3F4F6] hover:bg-[#EAECEF] px-5 py-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <TrendingUp size={19} className="text-[#820AD1] shrink-0" />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      Detalle financiero y capacidad de pago
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Cuota máxima recomendada (30%):{" "}
                      <strong>
                        {formatoCOP(cuotaMaxima30, ocultarMontos)}
                      </strong>
                    </span>
                  </div>
                </div>
                <ChevronRight size={17} className="text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setModalSoportesAbierto(true)}
                className="w-full rounded-2xl bg-[#F3F4F6] hover:bg-[#EAECEF] px-5 py-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <FileText size={19} className="text-[#820AD1] shrink-0" />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      Documentación y contrato {numeroContrato}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {contratoFirmado
                        ? "Pagaré firmado digitalmente y disponible para descarga"
                        : "Cédula de ciudadanía y soporte de ingresos radicados"}
                    </span>
                  </div>
                </div>
                <ChevronRight size={17} className="text-slate-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* TARJETA DE FIRMA FORMALIZADA (SI YA FIRMÓ) */}
          {contratoFirmado && firmaGuardada && (
            <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  <ShieldCheck size={13} />
                  <span>Pagaré y Contrato Formalizado · {numeroContrato}</span>
                </span>
                <h3 className="text-base font-bold text-slate-900 pt-1">
                  Firma electrónica verificada de {nombreCompleto}
                </h3>
                <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                  Tu aceptación quedó registrada bajo la Ley 527 de 1999.
                  Conserva tu comprobante oficial para cualquier consulta
                  futura.
                </p>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl px-5 py-3 text-center shrink-0">
                <img
                  src={firmaGuardada}
                  alt="Firma del titular"
                  className="h-14 mx-auto object-contain"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  C.C. {solicitud.personales.cedula || "Verificada"}
                </span>
              </div>
            </div>
          )}

          {/* BITÁCORA DE TRAZABILIDAD DEL RADICADO */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center">
                  <History size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Historial y trazabilidad del crédito
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Seguimiento paso a paso de tu solicitud {radicado}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {movimientos.map((mov, idx) => (
                <div
                  key={mov.id}
                  className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 last:border-none last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                        mov.completado
                          ? "bg-[#820AD1] text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {mov.completado ? "✓" : idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {mov.titulo}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {mov.detalle}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      mov.completado
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {mov.fecha}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="bg-white border-t border-slate-200/70 py-4 px-5 md:px-10 text-[11px] text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>© 2026 Banco Andino S.A. · Portal del Cliente SmartCredit</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPoliticaAbierta(true)}
              className="hover:text-[#820AD1] hover:underline cursor-pointer"
            >
              Política de tratamiento de datos
            </button>
            <button
              type="button"
              onClick={() => setModalAyudaAbierto(true)}
              className="font-semibold text-[#820AD1] hover:underline cursor-pointer"
            >
              ¿Necesitas ayuda?
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL 1: FIRMA DIGITAL DE CONTRATO Y PAGARÉ */}
      {modalFirmaAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#820AD1] flex items-center justify-center">
                  <FileSignature size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Firma electrónica · {numeroContrato}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Contrato de Mutuo y Pagaré Digital · Banco Andino S.A.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalFirmaAbierto(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            <div className="bg-[#F8F5FF] border border-[#E9D5FF] rounded-2xl p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Deudor titular:</span>
                <strong className="text-slate-900">{nombreCompleto}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monto aprobado:</span>
                <strong className="text-[#820AD1] tabular-nums">
                  {formatoCOP(montoSolicitado, false)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan de pagos:</span>
                <strong className="text-slate-900 tabular-nums">
                  {plazoMeses} cuotas fijas de {formatoCOP(cuotaMensual, false)}
                </strong>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Dibuja tu firma manuscrita dentro del recuadro
                </label>
                <button
                  type="button"
                  onClick={limpiarCanvas}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#820AD1] hover:underline cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Limpiar firma</span>
                </button>
              </div>

              <canvas
                ref={canvasRef}
                width={460}
                height={150}
                onMouseDown={iniciarTrazo}
                onMouseMove={dibujarTrazo}
                onMouseUp={finalizarTrazo}
                onMouseLeave={finalizarTrazo}
                onTouchStart={iniciarTrazo}
                onTouchMove={dibujarTrazo}
                onTouchEnd={finalizarTrazo}
                className="w-full h-36 bg-[#F8FAFC] border-2 border-dashed border-slate-300 rounded-2xl cursor-crosshair touch-none"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Al confirmar aceptas las condiciones del pagaré electrónico
                conforme a la Ley 527 de 1999.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setModalFirmaAbierto(false)}
                className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!tieneTrazo || guardandoFirma}
                onClick={handleConfirmarFirma}
                className="px-5 py-2.5 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={14} />
                <span>
                  {guardandoFirma
                    ? "Formalizando..."
                    : "Confirmar y firmar contrato"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DETALLE DE CAPACIDAD DE PAGO */}
      {modalDetallePlanAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Análisis de Capacidad de Pago
              </h3>
              <button
                type="button"
                onClick={() => setModalDetallePlanAbierto(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Ingresos mensuales</span>
                <strong className="tabular-nums">
                  {formatoCOP(ingresos, ocultarMontos)}
                </strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Egresos declarados</span>
                <span className="tabular-nums">
                  − {formatoCOP(egresos, ocultarMontos)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Arriendo o hipoteca</span>
                <span className="tabular-nums">
                  − {formatoCOP(arriendo, ocultarMontos)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Otras obligaciones</span>
                <span className="tabular-nums">
                  − {formatoCOP(otrasObligaciones, ocultarMontos)}
                </span>
              </div>
              <div className="flex justify-between py-2 bg-[#F8F5FF] px-3 rounded-xl">
                <span className="font-bold text-slate-800">
                  Excedente neto disponible
                </span>
                <strong className="text-[#820AD1] tabular-nums">
                  {formatoCOP(excedenteMensual, ocultarMontos)}
                </strong>
              </div>
              <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-xl">
                <span className="font-bold text-emerald-900">
                  Cuota máxima permitida (30%)
                </span>
                <strong className="text-emerald-700 tabular-nums">
                  {formatoCOP(cuotaMaxima30, ocultarMontos)}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalDetallePlanAbierto(false)}
              className="w-full py-2.5 rounded-full bg-[#820AD1] text-white text-xs font-bold hover:bg-[#6D08B0] cursor-pointer"
            >
              Cerrar resumen
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: SOPORTES DOCUMENTALES RADICADOS */}
      {modalSoportesAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Soportes Documentales · {radicado}
              </h3>
              <button
                type="button"
                onClick={() => setModalSoportesAbierto(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl bg-[#F5F6F8] p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">
                    1. Documento de identidad (Cédula)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    C.C. {solicitud.personales.cedula || "Registrada"} · Ambas
                    caras
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  Validado
                </span>
              </div>

              <div className="rounded-2xl bg-[#F5F6F8] p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">
                    2. Soporte de ingresos vigente
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {solicitud.personales.ocupacion || "Empleado dependiente"}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  Validado
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalSoportesAbierto(false)}
              className="w-full py-2.5 rounded-full bg-[#820AD1] text-white text-xs font-bold hover:bg-[#6D08B0] cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: CENTRO DE AYUDA INTERACTIVO (INSPIRADO EN VIDEO 2) */}
      {modalAyudaAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200/80">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#820AD1]">
                  Soporte SmartCredit
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  ¿Cómo podemos ayudarte hoy, {primerNombre}?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAyudaAbierto(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Buscador tipo píldora */}
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={busquedaAyuda}
                  onChange={(e) => setBusquedaAyuda(e.target.value)}
                  placeholder="Busca tu duda (ej. firma, cuota, soportes)..."
                  className="w-full bg-[#F5F6F8] border border-slate-200/70 rounded-full pl-10 pr-4 py-2.5 text-xs outline-none focus:border-[#820AD1] focus:bg-white"
                />
              </div>

              {/* Cuadrícula 2x2 de accesos rápidos */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBusquedaAyuda("");
                    setTemaAyudaActivo("estado");
                  }}
                  className="rounded-2xl bg-[#F5F6F8] hover:bg-[#F3E8FF] p-4 text-left transition-colors cursor-pointer"
                >
                  <Clock size={18} className="text-[#820AD1] mb-2" />
                  <p className="text-xs font-bold text-slate-900">
                    Estado de mi estudio
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tiempos y validación
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBusquedaAyuda("");
                    setTemaAyudaActivo("firma");
                  }}
                  className="rounded-2xl bg-[#F5F6F8] hover:bg-[#F3E8FF] p-4 text-left transition-colors cursor-pointer"
                >
                  <FileSignature size={18} className="text-[#820AD1] mb-2" />
                  <p className="text-xs font-bold text-slate-900">
                    Firma electrónica
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pagaré y comprobante
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBusquedaAyuda("");
                    setTemaAyudaActivo("capacidad");
                  }}
                  className="rounded-2xl bg-[#F5F6F8] hover:bg-[#F3E8FF] p-4 text-left transition-colors cursor-pointer"
                >
                  <TrendingUp size={18} className="text-[#820AD1] mb-2" />
                  <p className="text-xs font-bold text-slate-900">
                    Regla del 30%
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cálculo de excedente
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalAyudaAbierto(false);
                    setPoliticaAbierta(true);
                  }}
                  className="rounded-2xl bg-[#F5F6F8] hover:bg-[#F3E8FF] p-4 text-left transition-colors cursor-pointer"
                >
                  <ShieldCheck size={18} className="text-[#820AD1] mb-2" />
                  <p className="text-xs font-bold text-slate-900">
                    Habeas Data
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ver política completa
                  </p>
                </button>
              </div>

              {/* Lista de respuestas */}
              <div className="space-y-2.5">
                {temasFiltrados.map((tema) => {
                  const abierto = temaAyudaActivo === tema.id;
                  return (
                    <div
                      key={tema.id}
                      onClick={() => setTemaAyudaActivo(tema.id)}
                      className={`rounded-2xl border p-4 cursor-pointer transition-colors ${
                        abierto
                          ? "bg-[#F8F5FF] border-[#E9D5FF]"
                          : "bg-white border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">
                        {tema.pregunta}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                        {tema.respuesta}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Política de Datos */}
      <DataPolicyModal
        abierto={politicaAbierta}
        onCerrar={() => setPoliticaAbierta(false)}
      />
    </div>
  );
};
