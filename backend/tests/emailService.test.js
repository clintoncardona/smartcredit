import { afterEach, describe, expect, test, vi } from "vitest";
import { enviarCorreoRecuperacion } from "../src/services/emailService.js";

describe("Servicio de Correo Transaccional (White Box)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.BREVO_API_KEY;
  });

  test("1. Envía el código OTP vía API HTTPS de Brevo cuando BREVO_API_KEY está activa", async () => {
    process.env.BREVO_API_KEY = "xkeysib-test-123";
    process.env.SMTP_USER = "clintoncardona22@gmail.com";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => '{"messageId":"<123@brevo>"}',
    });

    await enviarCorreoRecuperacion({
      correo: "cliente@correo.com",
      nombre: "Camila",
      codigo: "482910",
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(options.headers["api-key"]).toBe("xkeysib-test-123");
    expect(options.body).toContain("482910");
  });

  test("2. Lanza un error descriptivo si Brevo responde con código de fallo HTTP", async () => {
    process.env.BREVO_API_KEY = "xkeysib-invalida";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    await expect(
      enviarCorreoRecuperacion({
        correo: "cliente@correo.com",
        nombre: "Camila",
        codigo: "482910",
      }),
    ).rejects.toThrow(/Brevo API error \(401\)/);
  });
});
