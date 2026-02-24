import * as z from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

/** Mensaje de error para email inválido (clientes, proveedores, perfil). */
export const EMAIL_INVALID_MESSAGE = "Introduce un correo electrónico válido";

/** Mensaje de error para teléfono inválido. */
export const PHONE_INVALID_MESSAGE =
  "Introduce un teléfono válido (ej. +34 600 000 000)";

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
export const optionalPhoneSchema = z
  .string()
  .refine(
    (v) => (v ?? "").trim() === "" || isValidPhoneNumber((v ?? "").trim()),
    { message: PHONE_INVALID_MESSAGE }
  );
