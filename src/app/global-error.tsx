"use client";

/**
 * Captura errores en el root layout. Incluye <html> y <body> propios
 * porque reemplaza todo el layout. Estilos autocontenidos (sin depender del layout).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const primary = "oklch(0.65 0.08 140)";
  const primaryForeground = "oklch(0.98 0.01 100)";
  const muted = "oklch(0.55 0.02 140)";
  const border = "oklch(0.88 0.02 140)";

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error | Veta</title>
        <style>{`
          * { box-sizing: border-box; }
          body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
          .g-error-root {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            background: linear-gradient(to bottom right, oklch(0.97 0.02 140), oklch(0.99 0.005 100), oklch(0.97 0.02 140));
            position: relative;
          }
          .g-error-root::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 0;
            opacity: 0.1;
            background-image:
              linear-gradient(to right, ${primary} 1px, transparent 1px),
              linear-gradient(to bottom, ${primary} 1px, transparent 1px);
            background-size: 20px 20px;
            pointer-events: none;
          }
          .g-error-card {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 32rem;
            background: oklch(1 0 0);
            border: 2px dashed ${border};
            border-radius: 0.5rem;
            padding: 2rem;
            text-align: center;
          }
          .g-error-card h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.5rem; color: oklch(0.2 0.02 140); }
          .g-error-card p { color: ${muted}; margin: 0.5rem 0; font-size: 0.9375rem; }
          .g-error-actions { margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; }
          .g-error-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1.25rem;
            font-size: 1rem;
            font-weight: 500;
            border-radius: 0.375rem;
            cursor: pointer;
            border: none;
            text-decoration: none;
          }
          .g-error-btn-primary { background: ${primary}; color: ${primaryForeground}; }
          .g-error-btn-primary:hover { filter: brightness(0.95); }
          .g-error-link { background: transparent; color: ${primary}; }
          .g-error-link:hover { text-decoration: underline; }
        `}</style>
      </head>
      <body>
        <div className="g-error-root">
          <div className="g-error-card">
            <h1>Algo ha fallado</h1>
            <p>
              Ha ocurrido un error en la aplicación. Puedes reintentar o volver
              al inicio.
            </p>
            {error.digest && (
              <p
                style={{
                  marginTop: "0.25rem",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                }}
                title="Código de error"
              >
                (código {error.digest})
              </p>
            )}
            {error?.message && (
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                {error.message}
              </p>
            )}
            <div className="g-error-actions">
              <button
                type="button"
                className="g-error-btn g-error-btn-primary"
                onClick={() => reset()}
              >
                Reintentar
              </button>
              <a href="/" className="g-error-btn g-error-link">
                Ir al inicio
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
