# Aspectos de ciberseguridad pendientes

Lista de aspectos identificados en la revisión OWASP que siguen pendientes de implementación o mejora. Referencia: `OWASP_SECURITY_REVIEW.md`.

---

## Críticos

| #   | Aspecto                              | Descripción                                                                                                                                                                                                            | Referencia OWASP      |
| --- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 1   | **Logging y auditoría de seguridad** | Sistema de logging estructurado para eventos de seguridad (accesos denegados, eliminaciones, cambios sensibles) y tabla de auditoría (p. ej. `security_audit_log`). Pendiente de implementación en una issue dedicada. | A01, A05, Prioridad 1 |

---

## Medios

| #   | Aspecto                                  | Descripción                                                                                                                                                                                      | Referencia OWASP   |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| 2   | **Rate limiting**                        | Limitar peticiones por IP/usuario en endpoints API críticos (auth, upload, account/delete) para mitigar abuso y fuerza bruta.                                                                    | A04, Prioridad 3   |
| 3   | **Restricción de hostnames en imágenes** | En `next.config.ts` (images.remotePatterns), restringir `hostname: "**"` a dominios concretos (p. ej. Supabase Storage, B2) si la optimización de imágenes se usa con URLs de usuario.           | A05, Prioridad 2   |
| 4   | **Dependencias vulnerables**             | Revisar y actualizar dependencias con `npm audit`; aplicar `npm audit fix` donde sea seguro; para las que no tengan parche, valorar alternativas o mitigaciones. Configurar Dependabot/Renovate. | A06, Prioridad 2/3 |
| 5   | **Monitoreo de eventos de seguridad**    | Integrar logs de seguridad con un sistema de monitoreo/alertas (cuando exista el sistema de logging).                                                                                            | A05, Prioridad 2   |

---

## Bajos

| #   | Aspecto                                        | Descripción                                                                                                                                                                   | Referencia OWASP |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 6   | **Sanitización de HTML**                       | Revisar uso de `dangerouslySetInnerHTML` (p. ej. en `json-ld.tsx`); usar sanitización (DOMPurify o similar) o alternativas que eviten XSS si el contenido puede ser dinámico. | A03              |
| 7   | **Verificación de integridad de dependencias** | Usar `npm ci` en CI y documentar; valorar verificación de checksums/ lockfile en el pipeline.                                                                                 | A08, Prioridad 3 |
| 8   | **Documentación CI/CD**                        | Documentar proceso de despliegue, pruebas de seguridad en pipeline y variables de entorno.                                                                                    | A08, Prioridad 3 |
| 9   | **Configuración CORS explícita**               | Definir explícitamente orígenes permitidos si se exponen APIs a otros orígenes (actualmente la app es same-origin).                                                           | A05              |

---

## Resumen

- **Críticos:** 1
- **Medios:** 4
- **Bajos:** 4

**Ya implementado en esta rama:** headers de seguridad HTTP (incl. CSP con `blob:` para vistas previas), validación de ownership en endpoints de upload y DELETE de documentos/imágenes, y flujo de producto que evita imágenes huérfanas (subida condicionada a la existencia del producto).
