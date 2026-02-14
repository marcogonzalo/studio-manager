import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_LIGHT_SRC = "/img/veta-light.webp";
const LOGO_DARK_SRC = "/img/veta-dark.webp";

/** Dimensiones intrínsecas del logo (257×189, más ancho que alto). */
const LOGO_WIDTH = 257;
const LOGO_HEIGHT = 189;

export type VetaLogoVariant = "icon" | "full";

export type VetaLogoProps = {
  /** "icon" = solo imagen, "full" = imagen + texto. Por defecto "full". */
  variant?: VetaLogoVariant;
  /** Si se indica, tiene prioridad sobre variant para mostrar/ocultar el texto. */
  showWordmark?: boolean;
  className?: string;
  height?: number;
  width?: number;
};

/** Logo para modo claro (logo oscuro). Oculto en tema dark (Tailwind dark:). */
function LogoLight({
  width,
  height,
  className,
}: {
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <Image
      src={LOGO_LIGHT_SRC}
      alt=""
      role="presentation"
      width={width}
      height={height}
      className={cn("h-auto w-auto flex-shrink-0 dark:hidden", className)}
      priority
    />
  );
}

/** Logo para modo oscuro (logo claro). Oculto en tema light (Tailwind dark:). */
function LogoDark({
  width,
  height,
  className,
}: {
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <Image
      src={LOGO_DARK_SRC}
      alt=""
      role="presentation"
      width={width}
      height={height}
      className={cn("hidden h-auto w-auto flex-shrink-0 dark:block", className)}
      priority
    />
  );
}

/**
 * Logo de Veta. Alterna entre solo imagen (variant="icon") o imagen + texto (variant="full").
 * Modo claro/oscuro detectado automáticamente vía Tailwind (clase dark en el DOM, p. ej. next-themes).
 */
export function VetaLogo({
  variant = "full",
  showWordmark,
  className,
  height = 28,
  width,
}: VetaLogoProps) {
  const showText =
    showWordmark !== undefined ? showWordmark : variant === "full";

  const aspectRatio = LOGO_WIDTH / LOGO_HEIGHT;
  const containerWidth = width ?? Math.round((height ?? 28) * aspectRatio);
  const containerHeight =
    height ?? (width != null ? Math.round(width / aspectRatio) : 28);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-0 text-[0px]",
        className
      )}
    >
      <span
        className="relative inline-flex flex-shrink-0 items-center justify-center"
        style={{ width: containerWidth, height: containerHeight }}
      >
        <LogoLight
          width={containerWidth}
          height={containerHeight}
          className="absolute inset-0 h-full w-full object-contain"
        />
        <LogoDark
          width={containerWidth}
          height={containerHeight}
          className="absolute inset-0 h-full w-full object-contain dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
        />
      </span>
      {showText && (
        <span
          className="text-foreground text-left align-middle text-base font-light tracking-wide"
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "16px",
            fontWeight: "300",
            lineHeight: "20px",
          }}
        >
          Veta
        </span>
      )}
    </div>
  );
}
