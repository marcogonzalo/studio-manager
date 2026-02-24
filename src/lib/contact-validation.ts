import * as z from "zod";
import { getExampleNumber, type Examples } from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import {
  formatPhoneNumberIntl,
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input";

/** Mensaje de error para email inválido (clientes, proveedores, perfil). */
export const EMAIL_INVALID_MESSAGE = "Introduce un correo electrónico válido";

/** Mensaje cuando no se puede inferir el país. */
const PHONE_INVALID_MESSAGE_NO_COUNTRY =
  "Introduce un teléfono válido para el país seleccionado";

/** Devuelve el mensaje de error de teléfono, con ejemplo por país cuando se puede inferir. */
function getPhoneInvalidMessage(value: string): string {
  const trimmed = (value ?? "").trim();
  const country = parsePhoneNumber(trimmed)?.country;
  if (!country) return PHONE_INVALID_MESSAGE_NO_COUNTRY;
  const example = getExampleNumber(country, examples as Examples);
  if (!example?.number) return PHONE_INVALID_MESSAGE_NO_COUNTRY;
  const formatted = formatPhoneNumberIntl(example.number);
  return `Introduce un teléfono válido (ej. ${formatted})`;
}

/** Mensaje de error para teléfono inválido (genérico; el mensaje real puede incluir ejemplo por país). */
export const PHONE_INVALID_MESSAGE = PHONE_INVALID_MESSAGE_NO_COUNTRY;

/**
 * Schema Zod para email opcional (vacío o formato válido).
 */
export const optionalEmailSchema = z.union([
  z.literal(""),
  z.string().refine(
    (v) =>
      (v ?? "").trim() === "" ||
      z
        .string()
        .email()
        .safeParse((v ?? "").trim()).success,
    { message: EMAIL_INVALID_MESSAGE }
  ),
]);

/**
 * Schema Zod para teléfono opcional (vacío o E.164 válido vía libphonenumber).
 */
export const optionalPhoneSchema = z.string().superRefine((val, ctx) => {
  const trimmed = (val ?? "").trim();
  if (trimmed === "" || isValidPhoneNumber(trimmed)) return;
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: getPhoneInvalidMessage(val ?? ""),
  });
});
