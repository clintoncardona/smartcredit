// src/types/credit.ts

export interface DatosPersonales {
    cedula: string;
    nombres: string;
    apellidos: string;
    celular: string;
    correo: string;
    direccion: string;
    ciudad: string;
    ocupacion: string;
  }
  
  export interface DatosFinancieros {
    ingresosMensuales: number;
    egresosDeclarados: number;
    arriendoHipoteca: number;
    otrasObligaciones: number;
    montoSolicitado: number;
    plazoMeses: 12 | 24 | 36 | 48;
  }
  
export interface DocumentoSoporte {
  id: string;
  nombre: string;
  tamano: string;
  tipo: 'PDF' | 'JPG';
  validado: boolean;
  diagnostico?: string;
  previewUrl?: string;
  rutaArchivo?: string;
}
  
  export interface SolicitudCreditoData {
    radicado: string;
    estado: 'En preparación' | 'Lista para confirmar' | 'En revisión' | 'Aprobada' | 'Rechazada';
    personales: DatosPersonales;
    financieros: DatosFinancieros;
    soportes: DocumentoSoporte[];
  }
  
  // Función auxiliar para formatear números a Pesos Colombianos ($15.000.000)
  export const formatCOP = (valor: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  };