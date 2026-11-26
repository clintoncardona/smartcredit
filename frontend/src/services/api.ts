const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "smartcredit_token";
const USER_KEY = "smartcredit_usuario";

export interface AuthUser {
  id: number;
  correo: string;
  rol: "cliente" | "analista";
  codigoEmpleado?: string | null;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveSession(token: string, usuario: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

let peticionesLentasActivas = 0;
type SlowNetworkListener = (lento: boolean) => void;
const slowListeners = new Set<SlowNetworkListener>();

export function subscribeSlowNetwork(
  listener: SlowNetworkListener,
): () => void {
  slowListeners.add(listener);
  return () => {
    slowListeners.delete(listener);
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  let marcadaComoLenta = false;
  const timerLento = window.setTimeout(() => {
    marcadaComoLenta = true;
    peticionesLentasActivas += 1;
    if (peticionesLentasActivas === 1) {
      slowListeners.forEach((fn) => fn(true));
    }
  }, 3000);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        data.mensaje || "Error en la comunicación con el servidor.",
      ) as Error & {
        status?: number;
        bloqueado?: boolean;
        intentosFallidos?: number;
      };
      error.status = response.status;
      error.bloqueado = data.bloqueado;
      error.intentosFallidos = data.intentosFallidos;
      throw error;
    }

    return data as T;
  } finally {
    window.clearTimeout(timerLento);
    if (marcadaComoLenta) {
      peticionesLentasActivas = Math.max(0, peticionesLentasActivas - 1);
      if (peticionesLentasActivas === 0) {
        slowListeners.forEach((fn) => fn(false));
      }
    }
  }
}

/* async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.mensaje || "Error en la comunicación con el servidor.",
    ) as Error & {
      status?: number;
      bloqueado?: boolean;
      intentosFallidos?: number;
    };
    error.status = response.status;
    error.bloqueado = data.bloqueado;
    error.intentosFallidos = data.intentosFallidos;
    throw error;
  }

  return data as T;
} */

// 1. AUTENTICACIÓN (Vistas 1A y 1B)
export const authApi = {
  login: (correo: string, password: string) =>
    request<{
      mensaje: string;
      token: string;
      usuario: AuthUser;
      cliente: Record<string, unknown> | null;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, password }),
    }),

  register: (payload: {
    correo: string;
    password: string;
    cedula: string;
    nombres: string;
    apellidos: string;
    celular: string;
    direccion?: string;
    ciudad?: string;
    ocupacion?: string;
  }) =>
    request<{
      mensaje: string;
      token: string;
      usuario: AuthUser;
      cliente: Record<string, unknown>;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  solicitarRecuperacion: (correo: string) =>
    request<{ mensaje: string }>("/auth/solicitar-recuperacion", {
      method: "POST",
      body: JSON.stringify({ correo }),
    }),

  restablecerPassword: (payload: {
    correo: string;
    codigo: string;
    nuevaPassword: string;
  }) =>
    request<{ mensaje: string }>("/auth/restablecer-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// 2. FLUJO DEL CLIENTE Y PORTAL (Vistas 2A, 2B, 2C, 2D y 4)
export const solicitudApi = {
  obtenerMiSolicitud: () =>
    request<{
      cliente: Record<string, unknown>;
      solicitud: Record<string, unknown> | null;
      soportes: Array<Record<string, unknown>>;
      historial: Array<Record<string, unknown>>;
      contrato: Record<string, unknown> | null;
    }>("/solicitudes/mi-solicitud"),

  guardarBorrador: (payload: {
    personales: Record<string, unknown>;
    financieros: Record<string, unknown>;
  }) =>
    request<{
      mensaje: string;
      solicitud: Record<string, unknown>;
      calculo: {
        excedenteNeto: number;
        cuotaEstimada: number;
        capacidadMaximaCuota: number;
      };
    }>("/solicitudes/borrador", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  subirSoporte: (radicado: string, file: File) => {
    const formData = new FormData();
    formData.append("archivo", file);
    return request<{
      mensaje: string;
      soporte: Record<string, unknown>;
    }>(`/solicitudes/${radicado}/soportes`, {
      method: "POST",
      body: formData,
    });
  },

  radicarSolicitud: (radicado: string) =>
    request<{
      mensaje: string;
      solicitud: Record<string, unknown>;
      contrato: Record<string, unknown> | null;
    }>(`/solicitudes/${radicado}/radicar`, {
      method: "POST",
    }),

  firmarContrato: (radicado: string, firmaBase64?: string) =>
    request<{ mensaje: string; contrato: Record<string, unknown> }>(
      `/solicitudes/${radicado}/firmar`,
      {
        method: "POST",
        body: JSON.stringify({ firmaBase64 }),
      },
    ),
};

// 3. MESA DE CONTROL ANALISTA (Vistas 3A - 3E)
export const analystApi = {
  obtenerResumen: () =>
    request<{
      kpis: {
        total: number;
        pendientes: number;
        aprobadas: number;
        rechazadas: number;
        volumen_aprobado: string;
        score_promedio: number;
      };
      distribucionPlazos: Array<{
        plazo_meses: number;
        cantidad: number;
        ticket_promedio: string;
      }>;
    }>("/analista/resumen"),

  listarSolicitudes: (estado?: string) => {
    const query = estado ? `?estado=${encodeURIComponent(estado)}` : "";
    return request<{
      solicitudes: Array<Record<string, unknown>>;
    }>(`/analista/solicitudes${query}`);
  },

  emitirDictamen: (
    radicado: string,
    decision: "Aprobada" | "Rechazada",
    observacion: string,
  ) =>
    request<{
      mensaje: string;
      solicitud: Record<string, unknown>;
      contrato: Record<string, unknown> | null;
    }>(`/analista/solicitudes/${radicado}/dictamen`, {
      method: "PATCH",
      body: JSON.stringify({ decision, observacion }),
    }),
};
