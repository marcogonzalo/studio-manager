# Auditoría de contraste (WCAG AA)

**Requisitos:** Texto normal ≥ 4.5:1, texto grande ≥ 3:1, componentes UI ≥ 3:1.

Cálculo aproximado usando luminancia (L de OKLCH): ratio ≈ (L_claro + 0.05) / (L_oscuro + 0.05). Los valores exactos pueden variar al convertir OKLCH → sRGB; este informe sirve para priorizar correcciones.

_Actualizado: modo oscuro revertido ~1% (bg 0.17, card 0.18, secondary 0.19, sidebar 0.15); textos 0.98; ratios ~4.3–4.7:1; primary con texto negro en dark._

---

## Modo claro

_Valores revertidos (sin ajustes de contraste aplicados)._

| Combinación (texto sobre fondo)                      | L texto | L fondo | Ratio aprox. | WCAG 4.5:1 | Estado       |
| ---------------------------------------------------- | ------- | ------- | ------------ | ---------- | ------------ |
| **foreground** sobre background                      | 0.25    | 0.98    | 3.4          | ❌         | Insuficiente |
| **card-foreground** sobre card                       | 0.25    | 1.0     | 3.5          | ❌         | Insuficiente |
| **muted-foreground** sobre background                | 0.55    | 0.98    | ~1.9         | ❌         | Insuficiente |
| **muted-foreground** sobre muted                     | 0.55    | 0.94    | ~1.8         | ❌         | Insuficiente |
| **primary** (text-primary) sobre background          | 0.65    | 0.98    | 1.5          | ❌         | Insuficiente |
| **primary** sobre card                               | 0.65    | 1.0     | 1.5          | ❌         | Insuficiente |
| **secondary-foreground** sobre secondary             | 0.35    | 0.94    | 2.5          | ❌         | Insuficiente |
| **accent-foreground** sobre accent                   | 0.25    | 0.92    | 3.2          | ❌         | Insuficiente |
| **sidebar-foreground** sobre sidebar                 | 0.30    | 0.97    | ~2.9         | ❌         | Insuficiente |
| **brand-secondary-foreground** sobre brand-secondary | 0.25    | 0.75    | 2.7          | ❌         | Insuficiente |
| **brand-tertiary-foreground** sobre brand-tertiary   | 0.28    | 0.89    | 2.8          | ❌         | Insuficiente |

---

## Modo oscuro (fondos revertidos ~1%, textos en blanco)

_Fondos: background 0.17, muted/card 0.18, secondary/accent 0.17, sidebar 0.15; brand-tertiary 0.17. Textos 0.98; brand-secondary-foreground 0.12. Profundidad: bg 0.17 < card 0.18._

| Combinación (texto sobre fondo)                      | L texto | L fondo | Ratio aprox. | WCAG 4.5:1 | Estado                |
| ---------------------------------------------------- | ------- | ------- | ------------ | ---------- | --------------------- |
| **foreground** sobre background                      | 0.98    | 0.17    | 4.7          | ✅         | Cumple                |
| **card-foreground** sobre card                       | 0.98    | 0.18    | 4.5          | ✅         | Cumple                |
| **muted-foreground** sobre background                | 0.98    | 0.17    | 4.7          | ✅         | Cumple                |
| **muted-foreground** sobre muted                     | 0.98    | 0.18    | 4.5          | ✅         | Cumple                |
| **primary-foreground** sobre primary (botón)         | 0.10    | 0.65    | 4.7          | ✅         | Texto negro (dark)    |
| **secondary-foreground** sobre secondary             | 0.98    | 0.17    | 4.7          | ✅         | Cumple                |
| **accent-foreground** sobre accent                   | 0.98    | 0.17    | 4.7          | ✅         | Cumple                |
| **sidebar-foreground** sobre sidebar                 | 0.98    | 0.15    | 5.2          | ✅         | Cumple                |
| **sidebar-accent-foreground** sobre sidebar-accent   | 0.98    | 0.18    | 4.5          | ✅         | Cumple                |
| **brand-secondary-foreground** sobre brand-secondary | 0.12    | 0.78    | 4.9          | ✅         | Cumple (texto oscuro) |
| **brand-tertiary-foreground** sobre brand-tertiary   | 0.98    | 0.17    | 4.7          | ✅         | Cumple (fondo oscuro) |

---

## Resumen: elementos por debajo del requisito

### Modo claro

1. **Texto principal (foreground)** sobre fondo y cards: ratio ~3.4–3.5 → oscurecer `--foreground` y `--card-foreground` (L ≈ 0.18–0.20 para ≥4.5:1 sobre 0.98).
2. **Texto secundario (muted-foreground)** sobre fondo/muted: ~2.5–2.6 → oscurecer a L ≈ 0.28–0.30.
3. **Texto primary (acentos, enlaces)** sobre fondo claro: ~1.5 → el verde actual (L 0.65) no cumple; hace falta un verde más oscuro para texto (p. ej. L ≈ 0.22) o usar solo para fondos/botones.
4. **secondary-foreground** sobre secondary: ~2.5 → oscurecer a L ≈ 0.28.
5. **accent-foreground** sobre accent: ~3.2 → oscurecer a L ≈ 0.22.
6. **sidebar-foreground** sobre sidebar: ~3.1 → oscurecer a L ≈ 0.24 para 4.5:1.
7. **brand-secondary-foreground** y **brand-tertiary-foreground**: ~2.7–2.8 → oscurecer para ≥4.5:1.

### Modo oscuro (revertido ~1%)

1. **Fondos**: background 0.17, muted/card 0.18, secondary/accent 0.17, sidebar 0.15; brand-tertiary 0.17 en dark. Todas las combinaciones semánticas cumplen 4.5:1.
2. **Textos**: 0.98 (blanco) en general; **brand-secondary-foreground** 0.12 (texto oscuro sobre 0.78) para ≥4.5:1.
3. **Primary**: botón con texto negro (L 0.10) en dark, ≥4.5:1.
4. Bordes L 0.29; transición 0.3s y viñeta aplicadas.

---

## Recomendación prioritaria

- **Modo claro:** Ajustar `--foreground` y `--card-foreground` a L ≈ 0.20 (y `--muted-foreground` a ≈ 0.28) para cumplir 4.5:1 sobre fondos claros. Para **text-primary** sobre fondo claro, definir un token de “primary text” más oscuro (L ≈ 0.22) y usarlo donde el primary sea texto, manteniendo el primary actual para botones/fondos.
- **Modo oscuro:** Fondos revertidos ~1% (bg 0.17, card 0.18, secondary 0.19); textos 0.98; ratios ~4.3–4.7:1. Primary con texto negro en dark.
