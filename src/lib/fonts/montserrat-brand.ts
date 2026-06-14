import { Montserrat } from "next/font/google";

/** Logo wordmark only (font-light / 300). Scoped via layout wrappers — not root layout. */
export const montserratBrand = Montserrat({
  subsets: ["latin"],
  weight: ["300"],
  variable: "--font-montserrat",
  display: "swap",
  adjustFontFallback: true,
});
