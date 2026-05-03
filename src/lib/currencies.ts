/** Monedas soportadas: código ISO → etiqueta mostrada */
export const CURRENCIES: Record<string, string> = {
  EUR: "EUR - €",
  USD: "USD - $",
  GBP: "GBP - £",
  CHF: "CHF - Fr",
  MXN: "MXN - $",
  BRL: "BRL - R$",
  ARS: "ARS - $",
  COP: "COP - $",
  CLP: "CLP - $",
} as const;
