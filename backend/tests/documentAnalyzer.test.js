import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, describe, expect, test } from "vitest";
import { analizarContenidoDocumento } from "../src/services/documentAnalyzer.service.js";

const archivosTemporales = [];

async function crearArchivoTemporal(nombre, buffer) {
  const ruta = path.join(
    os.tmpdir(),
    `smartcredit-test-${Date.now()}-${nombre}`,
  );
  await fs.writeFile(ruta, buffer);
  archivosTemporales.push(ruta);
  return ruta;
}

describe("Analizador Estructural de Documentos (White Box)", () => {
  afterEach(async () => {
    while (archivosTemporales.length > 0) {
      const ruta = archivosTemporales.pop();
      await fs.unlink(ruta).catch(() => {});
    }
  });

  test("1. Rechaza archivos vacíos o menores a 100 bytes", async () => {
    const ruta = await crearArchivoTemporal(
      "vacio.pdf",
      Buffer.from("%PDF-1.4 corto"),
    );

    await expect(
      analizarContenidoDocumento(ruta, "application/pdf", "vacio.pdf"),
    ).rejects.toThrow(/vacío o dañado/i);
  });

  test("2. Rechaza un archivo renombrado a .pdf que no tiene cabecera %PDF-", async () => {
    const contenidoFalso = Buffer.from("MZ_EJECUTABLE_FALSO_".repeat(10));
    const ruta = await crearArchivoTemporal("falso.pdf", contenidoFalso);

    await expect(
      analizarContenidoDocumento(ruta, "application/pdf", "falso.pdf"),
    ).rejects.toThrow(/no tiene una estructura PDF válida/i);
  });

  test("3. Rechaza un PDF truncado que carece de objetos o cierre %%EOF", async () => {
    const pdfIncompleto = Buffer.from("%PDF-1.7\n" + "A".repeat(150));
    const ruta = await crearArchivoTemporal("truncado.pdf", pdfIncompleto);

    await expect(
      analizarContenidoDocumento(ruta, "application/pdf", "truncado.pdf"),
    ).rejects.toThrow(/incompleto o no contiene páginas legibles/i);
  });

  test("4. Aprueba un PDF íntegro con cabecera, objetos, página y cierre %%EOF", async () => {
    const pdfValido = Buffer.from(
      "%PDF-1.7\n1 0 obj\n<< /Type /Page /MediaBox [0 0 612 792] >>\nendobj\n" +
        " ".repeat(80) +
        "\n%%EOF",
    );
    const ruta = await crearArchivoTemporal("desprendible.pdf", pdfValido);

    const resultado = await analizarContenidoDocumento(
      ruta,
      "application/pdf",
      "desprendible.pdf",
    );

    expect(resultado.integro).toBe(true);
    expect(resultado.resumenVerificacion).toContain("PDF verificado · 1 pág.");
  });

  test("5. Rechaza una imagen JPG corrupta sin marcadores SOI (FF D8 FF) y EOI (FF D9)", async () => {
    const jpgCorrupto = Buffer.alloc(150, 0x11);
    const ruta = await crearArchivoTemporal("cedula_rota.jpg", jpgCorrupto);

    await expect(
      analizarContenidoDocumento(ruta, "image/jpeg", "cedula_rota.jpg"),
    ).rejects.toThrow(/corrupta o no corresponde a un JPG válido/i);
  });

  test("6. Aprueba una imagen JPG válida con cabecera SOI y cierre EOI íntegros", async () => {
    const cuerpo = Buffer.alloc(140, 0x20);
    const jpgValido = Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      cuerpo,
      Buffer.from([0xff, 0xd9]),
    ]);
    const ruta = await crearArchivoTemporal("cedula_ok.jpg", jpgValido);

    const resultado = await analizarContenidoDocumento(
      ruta,
      "image/jpeg",
      "cedula_ok.jpg",
    );

    expect(resultado.integro).toBe(true);
    expect(resultado.resumenVerificacion).toContain("Imagen JPG verificada");
  });

  test("7. Rechaza formatos MIME no permitidos por política de seguridad", async () => {
    const buffer = Buffer.alloc(150, 0x41);
    const ruta = await crearArchivoTemporal("script.png", buffer);

    await expect(
      analizarContenidoDocumento(ruta, "image/png", "script.png"),
    ).rejects.toThrow(/Solo se admiten documentos en formato PDF o JPG/i);
  });
});
