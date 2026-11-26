import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck2,
  FileSignature,
  Lock,
  Mail,
  Minus,
  Pause,
  PhoneCall,
  Play,
  Plus,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TableProperties,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { DataPolicyModal } from "../components/ui/DataPolicyModal";

export interface SimulacionInicial {
  monto: number;
  plazo: number;
  correo?: string;
}

interface LandingViewProps {
  onGoToLogin: () => void;
  onGoToRegister: (simulacion?: SimulacionInicial) => void;
}

interface SlideHero {
  id: string;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  cta: string;
  badge: string;
  destacado: string;
  imagen: string;
  microUiTitulo: string;
  microUiValor: string;
  microUiDetalle: string;
}

interface PilarSmartCredit {
  id: string;
  tituloCorta: string;
  titulo: string;
  descripcion: string;
  accion: string;
  tag: string;
  imagen: string;
  microBadge: string;
}

interface ArticuloEducativo {
  id: string;
  categoria: string;
  lectura: string;
  titulo: string;
  resumen: string;
  imagen: string;
  contenido: string[];
  consejoClave: string;
}

interface FilaAmortizacion {
  mes: number;
  cuota: number;
  abonoCapital: number;
  interes: number;
  saldoRestante: number;
}

const HERO_IMAGEN =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1800&q=80";

const SLIDES_HERO: SlideHero[] = [
  {
    id: "credito",
    etiqueta: "Crédito de Libre Inversión",
    titulo: "Tu crédito digital, claro y sin filas",
    descripcion:
      "Solicita desde $1.000.000 hasta $50.000.000 COP con estudio en línea, tasa fija y respuesta transparente.",
    cta: "Solicitar crédito",
    badge: "Tasa desde 1.85% M.V.",
    destacado: "100% Digital",
    imagen:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
    microUiTitulo: "Cuota fija proyectada",
    microUiValor: "$382.940 / mes",
    microUiDetalle: "Estudio sin costo · $10.000.000 a 36 meses",
  },
  {
    id: "simulador",
    etiqueta: "Simulador SmartCredit",
    titulo: "Conoce tu cuota antes de aplicar",
    descripcion:
      "Calcula tu plan de pagos en segundos y valida tu capacidad real aplicando la regla prudencial del 30%.",
    cta: "Simular mi cuota",
    badge: "Sin costos ocultos",
    destacado: "Plazos de 12 a 48 meses",
    imagen:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    microUiTitulo: "Capacidad verificada",
    microUiValor: "Regla 30% excedente",
    microUiDetalle: "Protegemos tu estabilidad financiera mensual",
  },
  {
    id: "firma",
    etiqueta: "Formalización Ágil",
    titulo: "Firma tu contrato desde donde estés",
    descripcion:
      "Radica tus soportes, sigue tu estudio en tiempo real y firma tu pagaré electrónico con plena validez jurídica.",
    cta: "Crear mi cuenta",
    badge: "Respaldo Banco Andino",
    destacado: "Firma electrónica",
    imagen:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    microUiTitulo: "Contrato CNT-2026",
    microUiValor: "Firmado en línea",
    microUiDetalle: "Comprobante oficial descargable al instante",
  },
];

const PILARES_SMARTCREDIT: PilarSmartCredit[] = [
  {
    id: "radicacion",
    tituloCorta: "Radicación digital",
    titulo: "Radica tu solicitud en menos de 5 minutos",
    descripcion:
      "Completa tus datos básicos, adjunta tu cédula por ambas caras y tu certificado laboral en PDF o JPG con validación técnica inmediata.",
    accion: "Empezar mi solicitud",
    tag: "Paso 1 · Sin papeleo",
    imagen:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1000&q=80",
    microBadge: "2 de 2 soportes validados",
  },
  {
    id: "capacidad",
    tituloCorta: "Evaluación justa",
    titulo: "Cálculo transparente de tu capacidad de pago",
    descripcion:
      "Analizamos tu excedente real restando tus obligaciones actuales para asegurar que la cuota no supere el 30% de tu flujo disponible.",
    accion: "Calcular mi cuota",
    tag: "Paso 2 · Motor SmartCredit",
    imagen:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
    microBadge: "Cuota máxima recomendada",
  },
  {
    id: "seguimiento",
    tituloCorta: "Trazabilidad 24/7",
    titulo: "Sigue cada etapa en tiempo real desde tu portal",
    descripcion:
      "Consulta en todo momento si tu radicado está en estudio, aprobado o en revisión documental, con bitácora completa de movimientos.",
    accion: "Consultar mi estado",
    tag: "Portal del Cliente",
    imagen:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
    microBadge: "Estado actualizado en vivo",
  },
  {
    id: "contrato",
    tituloCorta: "Firma electrónica",
    titulo: "Formaliza tu pagaré y contrato sin ir a oficinas",
    descripcion:
      "Una vez aprobado tu crédito, revisa las condiciones finales, estampa tu firma digital y descarga tu certificado oficial al instante.",
    accion: "Conocer el proceso",
    tag: "Ley 527 de 1999",
    imagen:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80",
    microBadge: "Pagaré digital certificado",
  },
  {
    id: "respaldo",
    tituloCorta: "Banco Andino",
    titulo: "Tecnología financiera con solidez bancaria",
    descripcion:
      "Banco Andino S.A. combina arquitectura digital moderna con controles estrictos de seguridad, prevención SARLAFT y protección de datos.",
    accion: "Ver política de datos",
    tag: "Respaldo institucional",
    imagen:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
    microBadge: "Cumplimiento Ley 1581",
  },
];

const ARTICULOS_EDUCATIVOS: ArticuloEducativo[] = [
  {
    id: "regla-30",
    categoria: "Salud Financiera",
    lectura: "3 min de lectura",
    titulo: "¿Cómo funciona la regla del 30% en tu capacidad de pago?",
    resumen:
      "Aprende a calcular tu excedente mensual real para elegir un monto y plazo que protejan tu tranquilidad.",
    imagen:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=900&q=80",
    contenido: [
      "En Banco Andino S.A. evaluamos tu capacidad de pago a partir de tu excedente financiero real, no solo de tu ingreso bruto. Para obtenerlo, restamos tus egresos básicos, arriendo o hipoteca y otras cuotas vigentes.",
      "Sobre ese excedente neto aplicamos un límite prudencial del 30%. Si tu excedente mensual es de $2.500.000 COP, tu cuota recomendada no debe superar los $750.000 COP.",
      "Elegir un plazo adecuado (por ejemplo 36 meses en lugar de 12) reduce el valor de cada cuota mensual y aumenta tus probabilidades de aprobación inmediata.",
    ],
    consejoClave:
      "Antes de radicar, usa el simulador SmartCredit para verificar que tu cuota estimada esté por debajo del 30% de tu flujo libre mensual.",
  },
  {
    id: "documentos-clave",
    categoria: "Guía de Radicación",
    lectura: "2 min de lectura",
    titulo: "Prepara tus soportes para una validación sin reprocesos",
    resumen:
      "Conoce los requisitos exactos de tu cédula y certificado laboral para pasar el filtro documental a la primera.",
    imagen:
      "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=900&q=80",
    contenido: [
      "Para validar tu identidad, adjunta tu cédula de ciudadanía legible por ambas caras en formato JPG, PNG o PDF (máximo 5 MB), evitando reflejos sobre la fotografía o el número de documento.",
      "Como soporte de ingresos, sube un certificado laboral con fecha de expedición no mayor a 30 días donde conste tu cargo, tipo de contrato, antigüedad y salario mensual.",
      "Nuestro escáner técnico verifica automáticamente la integridad real del archivo antes de enviarlo a estudio.",
    ],
    consejoClave:
      "Asegúrate de que el salario registrado en el paso de Información Financiera coincida con el valor indicado en tu certificado laboral.",
  },
  {
    id: "score-crediticio",
    categoria: "Crédito Responsable",
    lectura: "4 min de lectura",
    titulo: "Score crediticio: qué revisamos y cómo fortalecer tu perfil",
    resumen:
      "Entiende cómo influyen tu historial de pagos y nivel de endeudamiento en las condiciones de tu crédito.",
    imagen:
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=900&q=80",
    contenido: [
      "El puntaje en centrales de riesgo resume tu comportamiento histórico frente a obligaciones financieras y de servicios. En SmartCredit tomamos como referencia un umbral mínimo de 600 puntos.",
      "Mantener tus obligaciones actuales al día y evitar múltiples solicitudes simultáneas en distintas entidades conserva estable tu calificación.",
      "Al cumplir puntualmente con las cuotas de tu crédito SmartCredit, construyes historial positivo dentro del sistema financiero colombiano.",
    ],
    consejoClave:
      "Puedes realizar abonos extraordinarios a capital en cualquier momento sin penalizaciones para disminuir intereses totales.",
  },
];

const PREGUNTAS_FRECUENTES = [
  {
    pregunta: "¿Qué es Banco Andino S.A. y cómo funciona SmartCredit?",
    respuesta:
      "Banco Andino S.A. es una entidad financiera colombiana enfocada en banca digital transparente. SmartCredit es nuestra plataforma oficial de originación de crédito que te permite simular, radicar soportes, consultar el estado de tu estudio y firmar tu contrato 100% en línea.",
  },
  {
    pregunta: "¿Qué documentos necesito para radicar mi solicitud?",
    respuesta:
      "Solo necesitas tener a la mano tu documento de identidad (cédula de ciudadanía legible por ambas caras) y tu soporte de ingresos vigente (certificado laboral con expedición menor a 30 días o desprendibles de pago) en formato PDF o JPG de hasta 5 MB.",
  },
  {
    pregunta: "¿Cómo se calcula mi capacidad de pago en SmartCredit?",
    respuesta:
      "Calculamos tu excedente mensual restando tus egresos, arriendo y otras obligaciones financieras a tus ingresos declarados. Para proteger tu estabilidad económica, la cuota mensual del crédito no debe superar el 30% de ese excedente disponible.",
  },
  {
    pregunta: "¿Cómo funciona la firma del contrato si mi crédito es aprobado?",
    respuesta:
      "Cuando tu solicitud recibe aprobación automática o por parte de nuestra Mesa de Control, se habilita directamente en tu portal el contrato y pagaré electrónico (CNT-2026) para que lo firmes de forma digital y descargues tu certificado oficial.",
  },
  {
    pregunta:
      "¿Cómo protege Banco Andino S.A. mis datos personales y mi cuenta?",
    respuesta:
      "Tratamos tu información bajo la Ley 1581 de 2012 y la Ley 1266 de 2008. Además, contamos con bloqueo preventivo automático tras 3 intentos fallidos de inicio de sesión y recuperación verificada mediante código de seguridad enviado a tu correo.",
  },
];

const formatoCOP = (valor: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);

export const LandingView: React.FC<LandingViewProps> = ({
  onGoToLogin,
  onGoToRegister,
}) => {
  const [correoHero, setCorreoHero] = useState("");
  const [slideActivo, setSlideActivo] = useState(0);
  const [carruselPausado, setCarruselPausado] = useState(false);

  const [montoSimulado, setMontoSimulado] = useState(10000000);
  const [plazoSimulado, setPlazoSimulado] = useState(36);

  const [pilarActivo, setPilarActivo] = useState(0);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(0);
  const [politicaAbierta, setPoliticaAbierta] = useState(false);
  const [articuloActivo, setArticuloActivo] =
    useState<ArticuloEducativo | null>(null);

  useEffect(() => {
    if (carruselPausado) return;
    const timer = setInterval(() => {
      setSlideActivo((prev) => (prev + 1) % SLIDES_HERO.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [carruselPausado]);

  // Amortización francesa con tasa de referencia 1.85% M.V.
  const tasaMensual = 0.0185;
  const factor = Math.pow(1 + tasaMensual, plazoSimulado);
  const cuotaEstimada = Math.round(
    (montoSimulado * (tasaMensual * factor)) / (factor - 1),
  );
  const ingresoSugerido = Math.round(cuotaEstimada / 0.3 + 1200000);

  const [amortizacionAbierta, setAmortizacionAbierta] = useState(false);

  const tablaAmortizacion: FilaAmortizacion[] = (() => {
    const filas: FilaAmortizacion[] = [];
    let saldo = montoSimulado;
    for (let mes = 1; mes <= plazoSimulado; mes++) {
      const interes = Math.round(saldo * tasaMensual);
      const esUltima = mes === plazoSimulado;
      const abonoCapital = esUltima
        ? saldo
        : Math.min(saldo, Math.max(0, cuotaEstimada - interes));
      const cuotaMes = esUltima ? abonoCapital + interes : cuotaEstimada;
      saldo = Math.max(0, saldo - abonoCapital);
      filas.push({
        mes,
        cuota: cuotaMes,
        abonoCapital,
        interes,
        saldoRestante: saldo,
      });
    }
    return filas;
  })();

  const totalIntereses = tablaAmortizacion.reduce(
    (acc, fila) => acc + fila.interes,
    0,
  );
  const totalAPagar = montoSimulado + totalIntereses;

  const desplazarseA = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const iniciarRegistroConContexto = (correoOpcional?: string) => {
    onGoToRegister({
      monto: montoSimulado,
      plazo: plazoSimulado,
      correo: (correoOpcional ?? correoHero).trim() || undefined,
    });
  };

  const handleSubmitHero = (e: React.FormEvent) => {
    e.preventDefault();
    iniciarRegistroConContexto(correoHero);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#820AD1] selection:text-white">
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#820AD1] text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
              BA
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold text-[#820AD1] tracking-tight block">
                Banco Andino S.A.
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase block">
                SmartCredit
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-700">
            <button
              type="button"
              onClick={() => desplazarseA("simulador")}
              className="hover:text-[#820AD1] transition-colors cursor-pointer"
            >
              Simulador de crédito
            </button>
            <button
              type="button"
              onClick={() => desplazarseA("beneficios")}
              className="hover:text-[#820AD1] transition-colors cursor-pointer"
            >
              Cómo funciona
            </button>
            <button
              type="button"
              onClick={() => desplazarseA("educacion")}
              className="hover:text-[#820AD1] transition-colors cursor-pointer"
            >
              Educación financiera
            </button>
            <button
              type="button"
              onClick={() => desplazarseA("seguridad")}
              className="hover:text-[#820AD1] transition-colors cursor-pointer"
            >
              Seguridad
            </button>
            <button
              type="button"
              onClick={() => desplazarseA("preguntas")}
              className="hover:text-[#820AD1] transition-colors cursor-pointer"
            >
              Preguntas
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGoToLogin}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#820AD1] hover:bg-[#F3E8FF]/70 transition-colors cursor-pointer"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => iniciarRegistroConContexto()}
              className="px-5 py-2.5 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Solicitar crédito
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO FOTOGRÁFICO FULL-BLEED + TARJETA FLOTANTE DE INICIO RÁPIDO */}
      <section className="relative bg-slate-950 overflow-hidden">
        <img
          src={HERO_IMAGEN}
          alt="Cliente gestionando su crédito digital en SmartCredit"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/30" />

        <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-14 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Titular principal a la izquierda */}
          <div className="lg:col-span-7 text-white space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/15">
              <Sparkles size={13} className="text-[#E9D5FF]" />
              <span>Banca Digital · Banco Andino S.A.</span>
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.08]">
              Tu crédito digital, claro y sin letras pequeñas
            </h1>

            <p className="text-sm sm:text-base text-slate-200 max-w-xl leading-relaxed">
              Simula tu cuota al instante, radica tus documentos desde tu
              celular y firma tu contrato electrónico con el respaldo de Banco
              Andino S.A.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-200">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={16} className="text-[#C084FC]" />
                <span>Desde $1M hasta $50M COP</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={16} className="text-[#C084FC]" />
                <span>Estudio sin costo</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={16} className="text-[#C084FC]" />
                <span>Firma electrónica Ley 527</span>
              </span>
            </div>
          </div>

          {/* Tarjeta blanca flotante a la derecha (estilo Nu) */}
          <div className="lg:col-span-5 flex lg:justify-end">
            <form
              onSubmit={handleSubmitHero}
              className="w-full max-w-[390px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/20 space-y-4"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#820AD1]">
                  SmartCredit en línea
                </span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1 leading-snug">
                  Empieza tu solicitud en menos de 5 minutos
                </h2>
              </div>

              <div>
                <label
                  htmlFor="hero-correo"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  Tu correo electrónico
                </label>
                <input
                  id="hero-correo"
                  type="email"
                  value={correoHero}
                  onChange={(e) => setCorreoHero(e.target.value)}
                  placeholder="juan.perez@correo.com"
                  className="w-full border-b-2 border-slate-200 focus:border-[#820AD1] py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors bg-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold flex items-center justify-between shadow-sm transition-colors cursor-pointer"
              >
                <span>Continuar con mi solicitud</span>
                <ArrowRight size={16} />
              </button>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                ¿Ya tienes una solicitud radicada?{" "}
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="font-bold text-[#820AD1] hover:underline cursor-pointer"
                >
                  Ingresa a tu portal
                </button>
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* 3. CARRUSEL INTERACTIVO DE 3 TARJETAS CON IMAGEN + MICRO-UI (SIN SALTOS) */}
      <section className="py-16 md:py-20 px-5 md:px-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-[#820AD1]">
                Experiencia SmartCredit
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                Diseñado para darte el control de tu crédito
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Explora cada etapa de nuestro proceso digital haciendo clic sobre
              las tarjetas.
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:h-[380px] gap-5 items-center">
            {SLIDES_HERO.map((slide, index) => {
              const esActiva = index === slideActivo;

              return (
                <div
                  key={slide.id}
                  onClick={() => setSlideActivo(index)}
                  className={`relative w-full min-w-0 rounded-3xl cursor-pointer overflow-hidden transition-[flex,height,box-shadow] duration-500 ease-out bg-slate-900 ${
                    esActiva
                      ? "md:flex-[2.25] h-[360px] md:h-[380px] shadow-[0_20px_50px_rgba(130,10,209,0.24)]"
                      : "md:flex-1 h-[240px] md:h-[325px]"
                  }`}
                >
                  {/* Fotografía de fondo */}
                  <img
                    src={slide.imagen}
                    alt={slide.titulo}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${
                      esActiva ? "scale-105 opacity-75" : "scale-100 opacity-50"
                    }`}
                  />

                  {/* Degradado corporativo */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      esActiva
                        ? "bg-gradient-to-t from-[#3B0764]/95 via-[#581C87]/75 to-slate-950/35"
                        : "bg-gradient-to-t from-slate-950/90 via-slate-900/70 to-slate-900/40"
                    }`}
                  />

                  {/* Contenido */}
                  <div className="relative h-full p-6 sm:p-7 flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full shrink-0 backdrop-blur-md ${
                          esActiva
                            ? "bg-[#820AD1] text-white"
                            : "bg-white/15 text-white"
                        }`}
                      >
                        {slide.badge}
                      </span>
                      <span className="text-[11px] font-semibold text-purple-200 truncate">
                        {slide.destacado}
                      </span>
                    </div>

                    <div className="my-3 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-[#E9D5FF] mb-1">
                          {slide.etiqueta}
                        </p>
                        <h3
                          className={`font-bold tracking-tight leading-snug ${
                            esActiva
                              ? "text-2xl sm:text-3xl"
                              : "text-lg line-clamp-2"
                          }`}
                        >
                          {slide.titulo}
                        </h3>
                      </div>

                      {/* Micro-UI flotante y descripción visible solo al expandirse */}
                      <div
                        className={`overflow-hidden transition-all duration-500 ease-out ${
                          esActiva
                            ? "max-h-40 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed line-clamp-2 mb-3">
                          {slide.descripcion}
                        </p>

                        <div className="inline-flex items-center gap-3 bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl px-3.5 py-2">
                          <div className="w-8 h-8 rounded-xl bg-[#820AD1] flex items-center justify-center shrink-0">
                            <TrendingUp size={15} className="text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] text-purple-200 uppercase font-semibold tracking-wider">
                              {slide.microUiTitulo} ·{" "}
                              <strong className="text-white">
                                {slide.microUiValor}
                              </strong>
                            </p>
                            <p className="text-[11px] text-white/85">
                              {slide.microUiDetalle}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (slide.id === "simulador") {
                            desplazarseA("simulador");
                          } else {
                            iniciarRegistroConContexto();
                          }
                        }}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                          esActiva
                            ? "bg-white text-[#820AD1] hover:bg-purple-50 shadow-sm"
                            : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                        }`}
                      >
                        <span>{slide.cta}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controles del carrusel */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
              {SLIDES_HERO.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Diapositiva ${idx + 1}`}
                  onClick={() => setSlideActivo(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === slideActivo
                      ? "w-6 bg-[#820AD1]"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Anterior"
              onClick={() =>
                setSlideActivo(
                  (prev) =>
                    (prev - 1 + SLIDES_HERO.length) % SLIDES_HERO.length,
                )
              }
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#820AD1] hover:text-[#820AD1] cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              aria-label="Siguiente"
              onClick={() =>
                setSlideActivo((prev) => (prev + 1) % SLIDES_HERO.length)
              }
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#820AD1] hover:text-[#820AD1] cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>

            <button
              type="button"
              aria-label={carruselPausado ? "Reanudar" : "Pausar"}
              onClick={() => setCarruselPausado((prev) => !prev)}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#820AD1] hover:text-[#820AD1] cursor-pointer"
            >
              {carruselPausado ? <Play size={13} /> : <Pause size={13} />}
            </button>
          </div>
        </div>
      </section>

      {/* 4. BLOQUE LAVANDA CON SIMULADOR INTERACTIVO EN VIVO */}
      <section
        id="simulador"
        className="bg-[#F3E8FF]/65 py-16 md:py-24 px-5 md:px-10 border-y border-[#E9D5FF]/60"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#820AD1]">
              <Calculator size={15} />
              <span>Simulador Oficial SmartCredit</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Conoce el Crédito SmartCredit de Banco Andino
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ajusta el monto y el plazo que necesitas. Evaluamos tu perfil con
              reglas claras y te asignamos una cuota acorde a tu capacidad real,
              sin letras pequeñas.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#820AD1] shrink-0" />
                <span>
                  Sin cobro por estudio de crédito ni comisiones ocultas
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#820AD1] shrink-0" />
                <span>Cuota fija mensual durante toda la vigencia</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#820AD1] shrink-0" />
                <span>Abonos a capital permitidos en cualquier momento</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Tarjeta 1: Controles */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#820AD1]">
                  1. Configura tu crédito
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  ¿Cuánto dinero necesitas?
                </h3>

                <div className="mt-5 space-y-5">
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs text-slate-500">Monto</span>
                      <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                        {formatoCOP(montoSimulado)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000000}
                      max={50000000}
                      step={500000}
                      value={montoSimulado}
                      onChange={(e) => setMontoSimulado(Number(e.target.value))}
                      className="w-full accent-[#820AD1] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 tabular-nums">
                      <span>$1.000.000</span>
                      <span>$50.000.000</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs text-slate-500">
                        Plazo en meses
                      </span>
                      <span className="text-sm font-bold text-[#820AD1]">
                        {plazoSimulado} meses
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[12, 24, 36, 48].map((meses) => (
                        <button
                          key={meses}
                          type="button"
                          onClick={() => setPlazoSimulado(meses)}
                          className={`py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            plazoSimulado === meses
                              ? "bg-[#820AD1] text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {meses}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                Tasa de referencia: <strong>1.85% M.V.</strong> (24.6% E.A.)
                sujeta a validación de score.
              </div>
            </div>

            {/* Tarjeta 2: Proyección */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  2. Tu proyección mensual
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  Cuota mensual fija estimada
                </p>
                <p className="text-3xl font-extrabold text-[#820AD1] tracking-tight mt-1 tabular-nums">
                  {formatoCOP(cuotaEstimada)}
                </p>

                <div className="mt-5 bg-[#F8F5FF] rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monto solicitado</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatoCOP(montoSimulado)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plazo elegido</span>
                    <span className="font-bold text-slate-900">
                      {plazoSimulado} cuotas
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#E9D5FF] pt-2">
                    <span className="text-slate-500">Ingreso sugerido</span>
                    <button
                      type="button"
                      onClick={() => setAmortizacionAbierta(true)}
                      className="mt-3 w-full py-2.5 px-3 rounded-xl bg-[#F3E8FF]/70 hover:bg-[#F3E8FF] text-[#820AD1] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <TableProperties size={14} />
                      <span>Ver tabla de amortización</span>
                    </button>
                    <span className="font-semibold text-slate-700 tabular-nums">
                      ~{formatoCOP(ingresoSugerido)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => iniciarRegistroConContexto()}
                  className="w-full py-3 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <span>Solicitar este monto</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Ya tengo cuenta · Ingresar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GALERÍA EXPANDIBLE DE 5 PILARES CON FOTOGRAFÍA Y MICRO-UI */}
      <section id="beneficios" className="py-16 md:py-24 px-5 md:px-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-8">
            Haz más con SmartCredit de Banco Andino
          </h2>

          <div className="flex flex-col md:flex-row gap-3.5 h-auto md:h-[390px]">
            {PILARES_SMARTCREDIT.map((pilar, idx) => {
              const activo = idx === pilarActivo;
              return (
                <div
                  key={pilar.id}
                  onClick={() => setPilarActivo(idx)}
                  onMouseEnter={() => setPilarActivo(idx)}
                  className={`relative rounded-3xl overflow-hidden cursor-pointer transition-[flex,box-shadow] duration-500 ease-out bg-slate-900 ${
                    activo
                      ? "md:flex-[2.5] min-h-[270px] shadow-xl"
                      : "md:flex-1 min-h-[120px]"
                  }`}
                >
                  <img
                    src={pilar.imagen}
                    alt={pilar.titulo}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
                      activo ? "scale-105 opacity-70" : "scale-100 opacity-45"
                    }`}
                  />
                  <div
                    className={`absolute inset-0 ${
                      activo
                        ? "bg-gradient-to-t from-[#3B0764]/95 via-[#581C87]/70 to-slate-950/30"
                        : "bg-gradient-to-t from-slate-950/90 via-slate-900/65 to-slate-900/35"
                    }`}
                  />

                  <div className="relative h-full p-6 flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
                        {pilar.tag}
                      </span>
                      <span className="text-xs font-bold text-white/75">
                        0{idx + 1}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {activo && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#820AD1] text-[11px] font-bold text-white shadow-sm">
                          <CheckCircle2 size={12} />
                          <span>{pilar.microBadge}</span>
                        </span>
                      )}

                      <h3
                        className={`font-bold leading-snug ${
                          activo ? "text-xl sm:text-2xl" : "text-sm"
                        }`}
                      >
                        {activo ? pilar.titulo : pilar.tituloCorta}
                      </h3>

                      {activo && (
                        <p className="text-xs text-purple-100/90 leading-relaxed max-w-md">
                          {pilar.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {PILARES_SMARTCREDIT[pilarActivo].titulo}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {PILARES_SMARTCREDIT[pilarActivo].descripcion}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const id = PILARES_SMARTCREDIT[pilarActivo].id;
                if (id === "respaldo") {
                  setPoliticaAbierta(true);
                } else if (id === "capacidad") {
                  desplazarseA("simulador");
                } else if (id === "seguimiento") {
                  onGoToLogin();
                } else {
                  iniciarRegistroConContexto();
                }
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#820AD1] hover:underline shrink-0 cursor-pointer"
            >
              <span>{PILARES_SMARTCREDIT[pilarActivo].accion}</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* 6. EDUCACIÓN FINANCIERA SMARTCREDIT (ESTILO BLOG NU.COM.CO) */}
      <section
        id="educacion"
        className="py-16 md:py-20 px-5 md:px-10 bg-[#F8FAFC] border-y border-slate-100"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#820AD1]">
                <BookOpen size={14} />
                <span>Educación Financiera · Banco Andino</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                Toma decisiones informadas sobre tu crédito
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Guías prácticas preparadas por nuestro equipo de riesgo para
              acompañarte antes de aplicar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARTICULOS_EDUCATIVOS.map((art) => (
              <article
                key={art.id}
                onClick={() => setArticuloActivo(art)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/75 hover:border-[#820AD1]/40 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={art.imagen}
                      alt={art.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[#820AD1] text-[10px] font-bold shadow-xs">
                      {art.categoria}
                    </span>
                  </div>

                  <div className="p-6">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {art.lectura}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug group-hover:text-[#820AD1] transition-colors">
                      {art.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {art.resumen}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#820AD1] group-hover:underline">
                    <span>Leer guía rápida</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SECCIÓN DE SEGURIDAD Y PROTECCIÓN 24/7 */}
      <section id="seguridad" className="py-14 md:py-18 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center -mb-7 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#820AD1] text-white flex items-center justify-center shadow-lg">
              <ShieldCheck size={28} strokeWidth={2} />
            </div>
          </div>

          <div className="bg-[#F5F6F8] border border-slate-200/80 rounded-[32px] pt-12 pb-9 px-6 sm:px-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center tracking-tight mb-8">
              Seguridad y protección 24/7 en cada paso
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={onGoToLogin}
                className="bg-white rounded-2xl p-5 text-left border border-slate-200/60 hover:border-[#820AD1]/40 transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#820AD1] transition-colors">
                    Bloqueo preventivo
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Protegemos tu cuenta tras 3 intentos fallidos con
                    recuperación vía correo OTP.
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:text-[#820AD1] shrink-0"
                />
              </button>

              <button
                type="button"
                onClick={() => iniciarRegistroConContexto()}
                className="bg-white rounded-2xl p-5 text-left border border-slate-200/60 hover:border-[#820AD1]/40 transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#820AD1] transition-colors">
                    Validación documental
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Verificación técnica de integridad de archivos y control
                    antifraude SARLAFT.
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:text-[#820AD1] shrink-0"
                />
              </button>

              <button
                type="button"
                onClick={() => setPoliticaAbierta(true)}
                className="bg-white rounded-2xl p-5 text-left border border-slate-200/60 hover:border-[#820AD1]/40 transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#820AD1] transition-colors">
                    Habeas Data protegido
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Cumplimiento de Ley 1581 de 2012 y Ley 1266 de 2008.
                    Consulta la política.
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:text-[#820AD1] shrink-0"
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SOBRE BANCO ANDINO S.A. Y CIFRAS CLAVE */}
      <section id="nosotros" className="py-14 md:py-20 px-5 md:px-10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#820AD1]">
                <Building2 size={15} />
                <span>Quiénes somos</span>
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                Conoce Banco Andino S.A.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Somos una entidad financiera colombiana nacida para simplificar
                el acceso al crédito formal mediante tecnología propia,
                decisiones transparentes y acompañamiento humano cuando más
                importa.
              </p>
              <button
                type="button"
                onClick={() => setPoliticaAbierta(true)}
                className="px-5 py-2.5 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Conocer marco legal y datos
              </button>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-[#F8F5FF] border border-[#E9D5FF] rounded-3xl p-6 flex flex-col justify-between space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#820AD1] text-white flex items-center justify-center">
                  <FileCheck2 size={19} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ¿Por qué elegir SmartCredit?
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Integramos validación documental inmediata, motor automático
                    de riesgo crediticio y firma digital de contrato en un solo
                    ecosistema sin sucursales físicas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => iniciarRegistroConContexto()}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#820AD1] hover:underline cursor-pointer"
                >
                  <span>Iniciar registro gratuito</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="bg-[#F5F6F8] border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <FileSignature size={19} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Transparencia de principio a fin
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Antes de radicar conoces tu cuota estimada, la tasa
                    aplicable y el estado exacto de cada documento exigido, con
                    soporte continuo en nuestro Centro de Ayuda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#820AD1] hover:underline cursor-pointer"
                >
                  <span>Ingresar al portal</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#F5F6F8] rounded-3xl p-7">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#820AD1] tracking-tight">
                +250 mil
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-3 leading-snug">
                colombianos confían en los productos digitales de Banco Andino
                S.A.
              </p>
            </div>

            <div className="bg-[#F5F6F8] rounded-3xl p-7">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#820AD1] tracking-tight">
                &lt; 5 min
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-3 leading-snug">
                tiempo promedio para completar tu radicación digital sin filas
              </p>
            </div>

            <div className="bg-[#F5F6F8] rounded-3xl p-7">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#820AD1] tracking-tight">
                100% digital
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-3 leading-snug">
                desde la simulación de cuota hasta la firma electrónica de tu
                pagaré
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PREGUNTAS FRECUENTES */}
      <section id="preguntas" className="py-16 md:py-20 px-5 md:px-10 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              ¿Tienes más preguntas?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-3 leading-relaxed">
              Resolvemos las dudas más comunes sobre requisitos, estudio de
              crédito y seguridad en SmartCredit.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {PREGUNTAS_FRECUENTES.map((item, idx) => {
              const abierta = faqAbierta === idx;
              return (
                <div
                  key={item.pregunta}
                  className="bg-[#F5F6F8] rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setFaqAbierta(abierta ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.pregunta}
                    </span>
                    <span className="w-7 h-7 rounded-full bg-white text-slate-700 flex items-center justify-center shrink-0">
                      {abierta ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>

                  {abierta && (
                    <div className="px-6 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                      {item.respuesta}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FOOTER OSCURO CORPORATIVO */}
      <footer className="bg-[#111111] text-white pt-16 pb-10 px-5 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/10 text-xs">
            <div className="space-y-3">
              <p className="text-slate-400 font-semibold">Productos</p>
              <ul className="space-y-2.5 font-medium text-slate-200">
                <li>
                  <button
                    type="button"
                    onClick={() => desplazarseA("simulador")}
                    className="hover:text-[#C084FC] transition-colors cursor-pointer"
                  >
                    Crédito de Libre Inversión
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => desplazarseA("simulador")}
                    className="hover:text-[#C084FC] transition-colors cursor-pointer"
                  >
                    Simulador SmartCredit
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onGoToLogin}
                    className="hover:text-[#C084FC] transition-colors cursor-pointer"
                  >
                    Portal del Cliente
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onGoToLogin}
                    className="hover:text-[#C084FC] transition-colors cursor-pointer"
                  >
                    Mesa de Control Analistas
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-slate-400 font-semibold">Transparencia</p>
              <ul className="space-y-2.5 font-medium text-slate-200">
                <li>
                  <button
                    type="button"
                    onClick={() => setPoliticaAbierta(true)}
                    className="hover:text-[#C084FC] transition-colors cursor-pointer"
                  >
                    Política de tratamiento de datos
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setPoliticaAbierta(true)}
                    className="hover:text-[#C084FC] transition-colors cursor-pointer"
                  >
                    Autorización Habeas Data
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => desplazarseA("seguridad")}
                    className="hover:text-[#C084FC] transition-colors cursor-pointer"
                  >
                    Seguridad y prevención SARLAFT
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => desplazarseA("preguntas")}
                    className="hover:text-[#C084FC] transition-colors cursor-pointer"
                  >
                    Defensor del Consumidor Financiero
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-slate-400 font-semibold">Habla con nosotros</p>
              <ul className="space-y-2.5 text-slate-200">
                <li className="flex items-center gap-2">
                  <PhoneCall size={13} className="text-[#C084FC]" />
                  <span>Bogotá: (601) 357 11 02</span>
                </li>
                <li className="flex items-center gap-2">
                  <Smartphone size={13} className="text-[#C084FC]" />
                  <span>Línea Nacional: 01 8000 917 200</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={13} className="text-[#C084FC]" />
                  <span>Atención digital 24/7</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-slate-400 font-semibold">
                Contacto institucional
              </p>
              <ul className="space-y-2.5 text-slate-200">
                <li className="flex items-center gap-2">
                  <Mail size={13} className="text-[#C084FC]" />
                  <span>ayuda@bancoandino.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock size={13} className="text-[#C084FC]" />
                  <span>protecciondatos@bancoandino.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award size={13} className="text-[#C084FC]" />
                  <span>defensor@bancoandino.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white text-[#111111] flex items-center justify-center font-extrabold text-xs">
                BA
              </div>
              <div>
                <p className="text-slate-200 font-semibold">
                  © 2026 Banco Andino S.A. · Todos los derechos reservados.
                </p>
                <p className="mt-0.5">
                  NIT 901.482.310-7 · Carrera 7 # 71-21, Torre B · Bogotá D.C.,
                  Colombia.
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg border border-white/15 text-[10px] font-semibold tracking-wider uppercase text-slate-300">
              Vigilado · Banco Andino S.A. · SmartCredit
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de lectura rápida para Educación Financiera */}
      {articuloActivo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200/80">
            <div className="relative h-44 bg-slate-900">
              <img
                src={articuloActivo.imagen}
                alt={articuloActivo.titulo}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <button
                type="button"
                onClick={() => setArticuloActivo(null)}
                aria-label="Cerrar artículo"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 text-slate-800 flex items-center justify-center hover:bg-white cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#820AD1]">
                  {articuloActivo.categoria}
                </span>
                <h3 className="text-lg font-bold leading-snug mt-1.5">
                  {articuloActivo.titulo}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-3 text-xs text-slate-600 leading-relaxed">
              {articuloActivo.contenido.map((parrafo, idx) => (
                <p key={idx}>{parrafo}</p>
              ))}

              <div className="bg-[#F8F5FF] border border-[#E9D5FF] rounded-2xl p-3.5 text-[11px] text-[#581C87]">
                <strong className="block text-[#820AD1] mb-0.5">
                  Recomendación SmartCredit
                </strong>
                {articuloActivo.consejoClave}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setArticuloActivo(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setArticuloActivo(null);
                    iniciarRegistroConContexto();
                  }}
                  className="px-5 py-2 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Solicitar mi crédito</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {amortizacionAbierta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#820AD1]">
                  Amortización Francesa · Tasa 1.85% M.V.
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Plan de pagos proyectado a {plazoSimulado} meses
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAmortizacionAbierta(false)}
                aria-label="Cerrar plan de pagos"
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-4 bg-[#F8F5FF] border-b border-[#E9D5FF] grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Capital solicitado</span>
                <strong className="text-sm font-extrabold text-slate-900 tabular-nums">
                  {formatoCOP(montoSimulado)}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Total intereses</span>
                <strong className="text-sm font-extrabold text-[#820AD1] tabular-nums">
                  {formatoCOP(totalIntereses)}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Total a pagar</span>
                <strong className="text-sm font-extrabold text-slate-900 tabular-nums">
                  {formatoCOP(totalAPagar)}
                </strong>
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-3 flex-1">
              <table className="w-full text-left border-collapse text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-2.5 pr-3">Mes</th>
                    <th className="py-2.5 px-3">Cuota</th>
                    <th className="py-2.5 px-3">Abono capital</th>
                    <th className="py-2.5 px-3">Interés (1.85%)</th>
                    <th className="py-2.5 pl-3 text-right">Saldo restante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tablaAmortizacion.map((fila) => (
                    <tr key={fila.mes} className="hover:bg-slate-50/80">
                      <td className="py-2 pr-3 font-bold text-slate-700">
                        #{fila.mes}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {formatoCOP(fila.cuota)}
                      </td>
                      <td className="py-2 px-3 text-emerald-700 font-medium">
                        {formatoCOP(fila.abonoCapital)}
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {formatoCOP(fila.interes)}
                      </td>
                      <td className="py-2 pl-3 text-right font-semibold text-slate-800">
                        {formatoCOP(fila.saldoRestante)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
              <span className="text-[11px] text-slate-400">
                Proyección informativa sujeta a aprobación de estudio.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAmortizacionAbierta(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAmortizacionAbierta(false);
                    iniciarRegistroConContexto();
                  }}
                  className="px-5 py-2 rounded-full bg-[#820AD1] hover:bg-[#6D08B0] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Solicitar crédito</span>
                  <ArrowRight size={13} />
                </button>
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
