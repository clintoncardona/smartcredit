import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalystRoute } from "./components/ui/AnalystLayout";
import { AnalystAnalyticsView } from "./pages/AnalystAnalyticsView";
import { AnalystApprovedView } from "./pages/AnalystApprovedView";
import { AnalystGeneralView } from "./pages/AnalystGeneralView";
import { AnalystRejectedView } from "./pages/AnalystRejectedView";
import { AnalystReviewView } from "./pages/AnalystReviewView";
import { ClientPortalView } from "./pages/ClientPortalView";
import { ConfirmationView } from "./pages/ConfirmationView";
import { DocumentsView } from "./pages/DocumentsView";
import { FinancialInfoView } from "./pages/FinancialInfoView";
import { LandingView } from "./pages/LandingView";
import { LoginView } from "./pages/LoginView";
import { PersonalDataView } from "./pages/PersonalDataView";
import { RegisterView } from "./pages/RegisterView";
import {
  clearSession,
  getToken,
  solicitudApi,
  type AuthUser,
} from "./services/api";
import type {
  DatosFinancieros,
  DatosPersonales,
  SolicitudCreditoData,
} from "./types/credit";

type AppRoute =
  | "0-inicio"
  | "1A-login"
  | "1B-registro"
  | "2A-datos-personales"
  | "2B-info-financiera"
  | "2C-soportes"
  | "2D-confirmacion"
  | "4-portal-cliente"
  | AnalystRoute;

const ROUTE_TO_PATH: Record<AppRoute, string> = {
  "0-inicio": "/",
  "1A-login": "/login",
  "1B-registro": "/registro",
  "2A-datos-personales": "/solicitud/datos-personales",
  "2B-info-financiera": "/solicitud/info-financiera",
  "2C-soportes": "/solicitud/soportes",
  "2D-confirmacion": "/solicitud/confirmacion",
  "4-portal-cliente": "/portal",
  "3A-analista-general": "/mesa-control/general",
  "3B-en-revision": "/mesa-control/revision",
  "3C-aprobadas": "/mesa-control/aprobadas",
  "3D-rechazadas": "/mesa-control/rechazadas",
  "3E-analitica": "/mesa-control/analitica",
};

const PATH_TO_ROUTE: Record<string, AppRoute> = Object.fromEntries(
  Object.entries(ROUTE_TO_PATH).map(([route, path]) => [
    path,
    route as AppRoute,
  ]),
);

const PUBLIC_ROUTES: AppRoute[] = ["0-inicio", "1A-login", "1B-registro"];

const CLIENT_ROUTES: AppRoute[] = [
  "2A-datos-personales",
  "2B-info-financiera",
  "2C-soportes",
  "2D-confirmacion",
  "4-portal-cliente",
];

const ANALYST_ROUTES: AppRoute[] = [
  "3A-analista-general",
  "3B-en-revision",
  "3C-aprobadas",
  "3D-rechazadas",
  "3E-analitica",
];

const SOLICITUD_VACIA: SolicitudCreditoData = {
  radicado: "",
  estado: "En preparación",
  personales: {
    cedula: "",
    nombres: "",
    apellidos: "",
    celular: "",
    correo: "",
    direccion: "",
    ciudad: "",
    ocupacion: "",
  },
  financieros: {
    ingresosMensuales: 0,
    egresosDeclarados: 0,
    arriendoHipoteca: 0,
    otrasObligaciones: 0,
    montoSolicitado: 0,
    plazoMeses: 36,
  },
  soportes: [],
};

function mapearDatosCliente(
  correo: string,
  clienteData: Record<string, unknown>,
  prev: DatosPersonales,
): DatosPersonales {
  const direccionRaw = String(clienteData.direccion ?? "");
  return {
    ...prev,
    correo,
    cedula: String(clienteData.cedula ?? ""),
    nombres: String(clienteData.nombres ?? ""),
    apellidos: String(clienteData.apellidos ?? ""),
    celular: String(clienteData.celular ?? ""),
    direccion: direccionRaw === "Por definir" ? "" : direccionRaw,
    ciudad: String(clienteData.ciudad ?? ""),
    ocupacion: String(clienteData.ocupacion ?? ""),
  };
}

export function App() {
  /* const [vistaActual, setVistaActual] = useState<AppRoute>("0-inicio"); */
  const [vistaActual, setVistaActual] = useState<AppRoute>(
    () => PATH_TO_ROUTE[window.location.pathname] ?? "0-inicio",
  );
  const [, setUsuarioAuth] = useState<AuthUser | null>(null);
  const usuarioAuthRef = useRef<AuthUser | null>(null);
  /* const [verificandoSesion, setVerificandoSesion] = useState(true); */
  const [verificandoSesion, setVerificandoSesion] = useState(
    () =>
      Boolean(getToken()) &&
      !PUBLIC_ROUTES.includes(
        PATH_TO_ROUTE[window.location.pathname] ?? "0-inicio",
      ),
  );
  const [solicitud, setSolicitud] =
    useState<SolicitudCreditoData>(SOLICITUD_VACIA);

  const actualizarUsuario = useCallback((user: AuthUser | null) => {
    usuarioAuthRef.current = user;
    setUsuarioAuth(user);
  }, []);

  const navegarSeguro = useCallback(
    (destino: AppRoute, usuarioExplicito?: AuthUser | null) => {
      const usuarioActivo =
        usuarioExplicito !== undefined
          ? usuarioExplicito
          : usuarioAuthRef.current;

      let rutaPermitida: AppRoute = destino;

      if (!usuarioActivo) {
        if (!PUBLIC_ROUTES.includes(destino)) {
          rutaPermitida = "1A-login";
        }
      } else if (usuarioActivo.rol === "cliente") {
        if (!CLIENT_ROUTES.includes(destino)) {
          rutaPermitida = "2A-datos-personales";
        }
      } else if (usuarioActivo.rol === "analista") {
        if (!ANALYST_ROUTES.includes(destino)) {
          rutaPermitida = "3A-analista-general";
        }
      }

      setVistaActual(rutaPermitida);
      const targetPath = ROUTE_TO_PATH[rutaPermitida];
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
    },
    [],
  );

  // Solo valida la sesión existente una única vez al abrir o recargar la página
  useEffect(() => {
    const validarSesionInicial = async () => {
      const token = getToken();
      const rutaUrl = PATH_TO_ROUTE[window.location.pathname] ?? "0-inicio";

      if (!token) {
        actualizarUsuario(null);
        navegarSeguro(
          PUBLIC_ROUTES.includes(rutaUrl) ? rutaUrl : "1A-login",
          null,
        );
        setVerificandoSesion(false);
        return;
      }

      try {
        const API_URL =
          import.meta.env.VITE_API_URL || "http://localhost:4000/api";
        const resp = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) throw new Error("Sesión inválida");

        const data = await resp.json();
        const user: AuthUser = data.usuario;
        actualizarUsuario(user);

        if (user.rol === "cliente" && data.cliente) {
          setSolicitud((prev) => ({
            ...prev,
            personales: mapearDatosCliente(
              user.correo,
              data.cliente,
              prev.personales,
            ),
          }));
        }

        navegarSeguro(rutaUrl, user);
      } catch {
        clearSession();
        actualizarUsuario(null);
        navegarSeguro(
          PUBLIC_ROUTES.includes(rutaUrl) ? rutaUrl : "1A-login",
          null,
        );
      } finally {
        setVerificandoSesion(false);
      }
    };

    validarSesionInicial();
  }, [actualizarUsuario, navegarSeguro]);

  useEffect(() => {
    const onPopState = () => {
      const destino = PATH_TO_ROUTE[window.location.pathname] ?? "0-inicio";
      navegarSeguro(destino);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [navegarSeguro]);

  const handleLogout = () => {
    clearSession();
    actualizarUsuario(null);
    setSolicitud(SOLICITUD_VACIA);
    navegarSeguro("0-inicio", null);
  };

  const handleLoginSuccess = async (
    rol: "cliente" | "analista",
    correo: string,
    clienteData?: Record<string, unknown> | null,
  ) => {
    const user: AuthUser = { id: 0, correo, rol };
    actualizarUsuario(user);

    if (rol === "analista") {
      navegarSeguro("3A-analista-general", user);
      return;
    }

    if (clienteData) {
      setSolicitud((prev) => ({
        ...prev,
        personales: mapearDatosCliente(correo, clienteData, prev.personales),
      }));
    }

    try {
      const miSol = await solicitudApi.obtenerMiSolicitud();
      if (miSol.solicitud) {
        const s = miSol.solicitud;
        const estadoDb = String(s.estado) as SolicitudCreditoData["estado"];
        setSolicitud((prev) => ({
          ...prev,
          radicado: String(s.radicado),
          estado: estadoDb,
          financieros: {
            ingresosMensuales: Number(s.ingresos_mensuales),
            egresosDeclarados: Number(s.egresos_declarados),
            arriendoHipoteca: Number(s.arriendo_hipoteca),
            otrasObligaciones: Number(s.otras_obligaciones),
            montoSolicitado: Number(s.monto_solicitado),
            plazoMeses: Number(s.plazo_meses) as DatosFinancieros["plazoMeses"],
          },
        }));

        if (estadoDb !== "En preparación") {
          navegarSeguro("4-portal-cliente", user);
          return;
        }
      }
    } catch {
      // Usuario nuevo sin solicitudes previas
    }

    navegarSeguro("2A-datos-personales", user);
  };

  /* if (verificandoSesion) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center text-xs text-slate-500">
        Verificando credenciales de acceso...
      </div>
    );
  } */
  if (verificandoSesion) {
    return null;
  }

  const nombreCompleto =
    `${solicitud.personales.nombres} ${solicitud.personales.apellidos}`.trim();

  return (
    <div className="min-h-screen">
      {vistaActual === "0-inicio" && (
        <LandingView
          onGoToLogin={() => navegarSeguro("1A-login", null)}
          onGoToRegister={(simulacion) => {
            if (simulacion) {
              setSolicitud((prev) => ({
                ...prev,
                personales: {
                  ...prev.personales,
                  correo: simulacion.correo ?? prev.personales.correo,
                },
                financieros: {
                  ...prev.financieros,
                  montoSolicitado: simulacion.monto,
                  plazoMeses:
                    simulacion.plazo as DatosFinancieros["plazoMeses"],
                },
              }));
            }
            navegarSeguro("1B-registro", null);
          }}
        />
      )}

      {vistaActual === "1A-login" && (
        <LoginView
          onGoHome={() => navegarSeguro("0-inicio", null)}
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={() => navegarSeguro("1B-registro", null)}
        />
      )}

      {vistaActual === "1B-registro" && (
        <RegisterView
          correoInicial={solicitud.personales.correo}
          onGoHome={() => navegarSeguro("0-inicio", null)}
          onGoToLogin={() => navegarSeguro("1A-login", null)}
          onRegisterSuccess={(datosRegistro) => {
            const nuevoCliente: AuthUser = {
              id: 0,
              correo: datosRegistro.correo || "",
              rol: "cliente",
            };
            actualizarUsuario(nuevoCliente);
            setSolicitud((prev) => ({
              ...prev,
              personales: {
                ...prev.personales,
                ...datosRegistro,
              },
            }));
            navegarSeguro("2A-datos-personales", nuevoCliente);
          }}
        />
      )}

      {vistaActual === "2A-datos-personales" && (
        <PersonalDataView
          initialData={solicitud.personales}
          montoSolicitado={solicitud.financieros.montoSolicitado}
          plazoMeses={solicitud.financieros.plazoMeses}
          onBackToStart={handleLogout}
          onNext={(datosActualizados) => {
            setSolicitud((prev) => ({
              ...prev,
              personales: datosActualizados,
            }));
            navegarSeguro("2B-info-financiera");
          }}
        />
      )}

      {vistaActual === "2B-info-financiera" && (
        <FinancialInfoView
          initialData={solicitud.financieros}
          userName={nombreCompleto}
          onBack={() => navegarSeguro("2A-datos-personales")}
          onNext={async (datosFinancierosActualizados) => {
            const res = await solicitudApi.guardarBorrador({
              personales: solicitud.personales as unknown as Record<
                string,
                unknown
              >,
              financieros: datosFinancierosActualizados as unknown as Record<
                string,
                unknown
              >,
            });
            setSolicitud((prev) => ({
              ...prev,
              radicado: String(res.solicitud.radicado),
              financieros: datosFinancierosActualizados,
            }));
            navegarSeguro("2C-soportes");
          }}
        />
      )}

      {vistaActual === "2C-soportes" && (
        <DocumentsView
          radicado={solicitud.radicado}
          initialDocuments={solicitud.soportes}
          financieros={solicitud.financieros}
          userName={nombreCompleto}
          onBack={() => navegarSeguro("2B-info-financiera")}
          onNext={(documentosValidados) => {
            setSolicitud((prev) => ({
              ...prev,
              estado: "Lista para confirmar",
              soportes: documentosValidados,
            }));
            navegarSeguro("2D-confirmacion");
          }}
        />
      )}

      {vistaActual === "2D-confirmacion" && (
        <ConfirmationView
          solicitud={solicitud}
          onBack={() => navegarSeguro("2C-soportes")}
          onEditStep={(rutaPaso) => navegarSeguro(rutaPaso)}
          onConfirmRadicacion={async () => {
            const res = await solicitudApi.radicarSolicitud(solicitud.radicado);
            setSolicitud((prev) => ({
              ...prev,
              estado: String(
                res.solicitud.estado,
              ) as SolicitudCreditoData["estado"],
            }));
            navegarSeguro("4-portal-cliente");
          }}
        />
      )}

      {vistaActual === "4-portal-cliente" && (
        <ClientPortalView
          solicitud={solicitud}
          onLogout={handleLogout}
          onStartNewApplication={() => {
            setSolicitud((prev) => ({
              ...prev,
              radicado: "",
              estado: "En preparación",
              financieros: SOLICITUD_VACIA.financieros,
              soportes: [],
            }));
            navegarSeguro("2A-datos-personales");
          }}
        />
      )}

      {vistaActual === "3A-analista-general" && (
        <AnalystGeneralView
          onNavigate={navegarSeguro}
          onLogout={handleLogout}
        />
      )}

      {vistaActual === "3B-en-revision" && (
        <AnalystReviewView onNavigate={navegarSeguro} onLogout={handleLogout} />
      )}

      {vistaActual === "3C-aprobadas" && (
        <AnalystApprovedView
          onNavigate={navegarSeguro}
          onLogout={handleLogout}
        />
      )}

      {vistaActual === "3D-rechazadas" && (
        <AnalystRejectedView
          onNavigate={navegarSeguro}
          onLogout={handleLogout}
        />
      )}

      {vistaActual === "3E-analitica" && (
        <AnalystAnalyticsView
          onNavigate={navegarSeguro}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
