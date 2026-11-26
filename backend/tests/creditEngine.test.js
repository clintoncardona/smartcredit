import { afterEach, describe, expect, test, vi } from "vitest";
import {
  calcularExcedenteYCuota,
  evaluarRiesgoCrediticio,
} from "../src/services/creditEngine.service.js";

describe("Motor de Cálculo y Riesgo Crediticio (White Box)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.BUREAU_API_URL;
    delete process.env.BUREAU_API_KEY;
  });

  test("1. Calcula correctamente excedente neto, cuota fija (1.85% M.V.) y tope del 30%", () => {
    const resultado = calcularExcedenteYCuota({
      ingresosMensuales: 8000000,
      egresosDeclarados: 1500000,
      arriendoHipoteca: 1500000,
      otrasObligaciones: 500000,
      montoSolicitado: 10000000,
      plazoMeses: 24,
    });

    expect(resultado.excedenteNeto).toBe(4500000);
    expect(resultado.cuotaEstimada).toBe(519770);
    expect(resultado.capacidadMaximaCuota).toBe(1350000);
  });

  test("2. Limita la capacidad máxima de cuota a $0 cuando el excedente es negativo", () => {
    const resultado = calcularExcedenteYCuota({
      ingresosMensuales: 2000000,
      egresosDeclarados: 1200000,
      arriendoHipoteca: 800000,
      otrasObligaciones: 300000,
      montoSolicitado: 5000000,
      plazoMeses: 12,
    });

    expect(resultado.excedenteNeto).toBe(-300000);
    expect(resultado.capacidadMaximaCuota).toBe(0);
  });

  test("3. Rechaza automáticamente si el excedente neto mensual es <= $0", async () => {
    const dictamen = await evaluarRiesgoCrediticio({
      cedula: "1037641990",
      ocupacion: "Empleado dependiente",
      ingresosMensuales: 3000000,
      montoSolicitado: 5000000,
      excedenteNeto: 0,
      cuotaEstimada: 467500,
      capacidadMaximaCuota: 0,
    });

    expect(dictamen.estado).toBe("Rechazada");
    expect(dictamen.modalidadDecision).toBe("Automática");
    expect(dictamen.causalRechazo).toMatch(/Excedente neto mensual/i);
  });

  test("4. Rechaza automáticamente si la cuota supera el 30% de capacidad disponible", async () => {
    const dictamen = await evaluarRiesgoCrediticio({
      cedula: "1037641990",
      ocupacion: "Empleado dependiente",
      ingresosMensuales: 4000000,
      montoSolicitado: 12000000,
      excedenteNeto: 1000000,
      cuotaEstimada: 450000,
      capacidadMaximaCuota: 300000,
    });

    expect(dictamen.estado).toBe("Rechazada");
    expect(dictamen.modalidadDecision).toBe("Automática");
    expect(dictamen.causalRechazo).toMatch(/supera el 30%/i);
  });

  test("5. Aprueba automáticamente cuando score >= 700 y cumple liquidez", async () => {
    const dictamen = await evaluarRiesgoCrediticio({
      cedula: "1037641990", // Base 725 + 20 (dependiente) + 15 (ratio<=1.5) + 20 (liq>=0.5) = 780
      ocupacion: "Empleado dependiente",
      ingresosMensuales: 8000000,
      montoSolicitado: 10000000,
      excedenteNeto: 4500000,
      cuotaEstimada: 519770,
      capacidadMaximaCuota: 1350000,
    });

    expect(dictamen.scoreDatacredito).toBe(780);
    expect(dictamen.estado).toBe("Aprobada");
    expect(dictamen.modalidadDecision).toBe("Automática");
    expect(dictamen.causalRechazo).toBeNull();
  });

  test("6. Envía a revisión manual cuando el score está entre 600 y 699", async () => {
    const dictamen = await evaluarRiesgoCrediticio({
      cedula: "1017284550", // Base 625 + 5 (independiente) + 0 + 5 = 635
      ocupacion: "Profesional independiente",
      ingresosMensuales: 5000000,
      montoSolicitado: 12000000,
      excedenteNeto: 1800000,
      cuotaEstimada: 459500,
      capacidadMaximaCuota: 540000,
    });

    expect(dictamen.scoreDatacredito).toBe(635);
    expect(dictamen.estado).toBe("En revisión");
    expect(dictamen.modalidadDecision).toBeNull();
    expect(dictamen.causalRechazo).toBeNull();
  });

  test("7. Rechaza automáticamente cuando el score es inferior a 600", async () => {
    const dictamen = await evaluarRiesgoCrediticio({
      cedula: "1152493810", // Base 525 + 5 (comerciante) + 0 - 20 = 510
      ocupacion: "Comerciante",
      ingresosMensuales: 5000000,
      montoSolicitado: 10000000,
      excedenteNeto: 1400000,
      cuotaEstimada: 316150,
      capacidadMaximaCuota: 420000,
    });

    expect(dictamen.scoreDatacredito).toBe(510);
    expect(dictamen.estado).toBe("Rechazada");
    expect(dictamen.modalidadDecision).toBe("Automática");
    expect(dictamen.causalRechazo).toContain("510");
  });

  test("8. Consulta API externa de central de riesgo cuando BUREAU_API_URL está configurada", async () => {
    process.env.BUREAU_API_URL = "https://bureau.mock.local";
    process.env.BUREAU_API_KEY = "secret_key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ score: 820 }),
    });

    const dictamen = await evaluarRiesgoCrediticio({
      cedula: "1037641900",
      ocupacion: "Pensionado",
      ingresosMensuales: 6000000,
      montoSolicitado: 8000000,
      excedenteNeto: 3500000,
      cuotaEstimada: 415800,
      capacidadMaximaCuota: 1050000,
    });

    expect(dictamen.scoreDatacredito).toBe(820);
    expect(dictamen.estado).toBe("Aprobada");
  });
});
