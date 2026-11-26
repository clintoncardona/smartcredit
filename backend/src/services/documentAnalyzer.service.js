import fs from "fs/promises";

export async function analizarContenidoDocumento(
  filePath,
  mimetype,
  originalName,
) {
  const buffer = await fs.readFile(filePath);

  if (buffer.length < 100) {
    await fs.unlink(filePath).catch(() => {});
    throw new Error(`El archivo "${originalName}" está vacío o dañado.`);
  }

  // 1. Validación estructural de PDF
  if (mimetype === "application/pdf") {
    const header = buffer.subarray(0, 5).toString("ascii");
    if (header !== "%PDF-") {
      await fs.unlink(filePath).catch(() => {});
      throw new Error(
        `El archivo "${originalName}" no tiene una estructura PDF válida.`,
      );
    }

    const contenidoTexto = buffer.toString("latin1");
    const tieneCierreEOF = contenidoTexto.includes("%%EOF");
    const tieneObjetos = /\d+\s+0\s+obj/.test(contenidoTexto);
    const tieneFlujoContenido =
      contenidoTexto.includes("/Type /Page") ||
      contenidoTexto.includes("stream");

    if (!tieneCierreEOF || !tieneObjetos || !tieneFlujoContenido) {
      await fs.unlink(filePath).catch(() => {});
      throw new Error(
        `El documento "${originalName}" está incompleto o no contiene páginas legibles.`,
      );
    }

    const paginasMatch = contenidoTexto.match(/\/Type\s*\/Page[^s]/g);
    const paginasEstimadas = paginasMatch ? paginasMatch.length : 1;

    return {
      integro: true,
      resumenVerificacion: `PDF verificado · ${paginasEstimadas} pág. · Estructura íntegra`,
    };
  }

  // 2. Validación estructural de JPEG / JPG
  if (mimetype === "image/jpeg" || mimetype === "image/jpg") {
    const soiValid =
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const eoiValid =
      buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;

    if (!soiValid || !eoiValid) {
      await fs.unlink(filePath).catch(() => {});
      throw new Error(
        `La imagen "${originalName}" está corrupta o no corresponde a un JPG válido.`,
      );
    }

    return {
      integro: true,
      resumenVerificacion:
        "Imagen JPG verificada · Legibilidad y cabecera íntegras",
    };
  }

  await fs.unlink(filePath).catch(() => {});
  throw new Error("Solo se admiten documentos en formato PDF o JPG.");
}
