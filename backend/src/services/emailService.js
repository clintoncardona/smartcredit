import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT) || 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpPort === 465,
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function enviarCorreoRecuperacion({
  correo,
  nombre = "Cliente",
  codigo,
}) {
  const htmlCorporativo = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recuperación de acceso · SmartCredit</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F5F6F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F6F8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#FFFFFF;border-radius:24px;border:1px solid #E2E8F0;overflow:hidden;">
            <tr>
              <td style="background-color:#820AD1;padding:24px 32px;">
                <span style="display:inline-block;background-color:#FFFFFF;color:#820AD1;font-weight:800;font-size:13px;padding:6px 10px;border-radius:10px;letter-spacing:-0.3px;">
                  BA
                </span>
                <span style="color:#FFFFFF;font-weight:700;font-size:15px;margin-left:10px;vertical-align:middle;">
                  Banco Andino · SmartCredit
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#820AD1;">
                  Seguridad de cuenta
                </p>
                <h1 style="margin:0 0 14px 0;font-size:22px;font-weight:700;color:#0F172A;line-height:1.3;">
                  Recuperación y desbloqueo de acceso
                </h1>
                <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#475569;">
                  Hola <strong>${nombre}</strong>, recibimos una solicitud para restablecer tu contraseña y desbloquear tu ingreso en <strong>SmartCredit</strong>.
                </p>
                <p style="margin:0 0 10px 0;font-size:13px;font-weight:600;color:#334155;">
                  Ingresa este código de verificación en la plataforma:
                </p>
                <div style="background-color:#F8F5FF;border:1.5px dashed #C084FC;border-radius:16px;padding:20px;text-align:center;margin:0 0 22px 0;">
                  <span style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:800;letter-spacing:8px;color:#820AD1;">
                    ${codigo}
                  </span>
                  <p style="margin:8px 0 0 0;font-size:11px;color:#64748B;">
                    Este código es válido por <strong>15 minutos</strong> y es de un solo uso.
                  </p>
                </div>
                <div style="background-color:#F8FAFC;border-left:3px solid #820AD1;padding:12px 14px;border-radius:8px;margin-bottom:20px;">
                  <p style="margin:0;font-size:12px;line-height:1.5;color:#475569;">
                    <strong>Aviso de seguridad:</strong> Si no solicitaste este cambio, ignora este mensaje. Ningún funcionario de Banco Andino te pedirá este código por teléfono o chat.
                  </p>
                </div>
                <p style="margin:0;font-size:13px;color:#64748B;">
                  Atentamente,<br />
                  <strong style="color:#0F172A;">Equipo de Seguridad Digital · Banco Andino S.A.</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#F8FAFC;border-top:1px solid #E2E8F0;padding:18px 32px;text-align:center;">
                <p style="margin:0;font-size:11px;color:#94A3B8;line-height:1.5;">
                  © 2026 Banco Andino S.A. · Todos los derechos reservados.<br />
                  Este es un mensaje automático transaccional, por favor no respondas a este correo.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const asunto = `${codigo} es tu código de recuperación · SmartCredit`;

  if (process.env.BREVO_API_KEY) {
    const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Banco Andino - SmartCredit",
          email: process.env.SMTP_USER,
        },
        to: [{ email: correo, name: nombre }],
        subject: asunto,
        htmlContent: htmlCorporativo,
      }),
    });

    if (!resp.ok) {
      const detalle = await resp.text();
      throw new Error(`Brevo API error (${resp.status}): ${detalle}`);
    }
    return;
  }

  await transporter.sendMail({
    from: `"Banco Andino - SmartCredit" <${process.env.SMTP_USER}>`,
    to: correo,
    subject: asunto,
    html: htmlCorporativo,
  });
}
