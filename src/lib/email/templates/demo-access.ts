/**
 * Plantilla de correo para el enlace de acceso a la demo (misma línea visual que
 * supabase/templates/magic_link.html: marca Veta, fondo #f5f3ef, botón #759b6d).
 */

function escapeHtml(link: string): string {
  return link
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getDemoAccessEmailHtml(actionLink: string): string {
  const safeLink = escapeHtml(actionLink);
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tu enlace para probar la demo de Veta</title>
    <style>
      body {
        font-family:
          "Montserrat",
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f5f3ef;
        color: #2d2a26;
      }
      .wrapper {
        max-width: 560px;
        margin: 0 auto;
        padding: 32px 20px;
      }
      .card {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(45, 42, 38, 0.06);
        padding: 32px 28px;
      }
      .brand {
        font-size: 22px;
        font-weight: 700;
        color: #759b6d;
        letter-spacing: -0.02em;
        margin-bottom: 24px;
      }
      h1 {
        font-size: 20px;
        font-weight: 600;
        color: #2d2a26;
        margin: 0 0 16px 0;
      }
      p {
        font-size: 15px;
        color: #4a4642;
        margin: 0 0 16px 0;
      }
      .button {
        display: inline-block;
        background-color: #759b6d;
        color: #ffffff !important;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 15px;
        margin: 20px 0;
      }
      .link-fallback {
        font-size: 13px;
        color: #6b6560;
        word-break: break-all;
        margin-top: 16px;
      }
      .footer {
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px solid #e8e6e2;
        font-size: 13px;
        color: #6b6560;
        text-align: center;
      }
      .footer a {
        color: #759b6d;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="brand">Veta</div>
        <h1>Prueba la demo de Veta</h1>
        <p>
          Has solicitado acceder a la demo. Usa el siguiente enlace para entrar;
          es válido durante un tiempo limitado:
        </p>
        <p>
          <a href="${safeLink}" class="button" style="color: #ffffff !important;">Acceder a la demo de Veta</a>
        </p>
        <p class="link-fallback">
          Si el botón no funciona, copia y pega este enlace:<br /><a
            href="${safeLink}"
            >${safeLink}</a
          >
        </p>
        <p style="font-size: 13px; color: #6b6560">
          Si no has solicitado este enlace, puedes ignorar este correo.
        </p>
        <div class="footer">
          <a href="https://www.veta.pro">Veta</a> — Gestión de proyectos de diseño
          interior.
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export function getDemoAccessEmailText(actionLink: string): string {
  return `Hola,

Has solicitado acceder a la demo de Veta. Usa este enlace para entrar (válido durante un tiempo limitado):

${actionLink}

Si no has solicitado este enlace, puedes ignorar este correo.

— Equipo Veta`;
}
