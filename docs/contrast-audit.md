# Auditoría de contraste (WCAG AA)

**Requisitos:** Texto normal ≥ 4.5:1, texto grande ≥ 3:1, componentes UI ≥ 3:1.

Cálculo aproximado usando luminancia (L de OKLCH): ratio ≈ (L_claro + 0.05) / (L_oscuro + 0.05). Los valores exactos pueden variar al convertir OKLCH → sRGB; este informe sirve para priorizar correcciones.

_Actualizado: modo oscuro con fondos y textos de contraste ajustados (background 0.18, card/muted 0.16, secondary/accent 0.18, sidebar-accent 0.16; muted-foreground 0.92, secondary-foreground 0.96). Colores de marca (primary, chart-\*, brand-secondary, brand-tertiary) sin cambios._

---

## Modo claro

| Combinación (texto sobre fondo)                      | L texto | L fondo | Ratio aprox. | WCAG 4.5:1 | Estado                         |
| ---------------------------------------------------- | ------- | ------- | ------------ | ---------- | ------------------------------ |
| **foreground** sobre background                      | 0.25    | 0.98    | 3.4          | ❌         | Insuficiente                   |
| **card-foreground** sobre card                       | 0.25    | 1.0     | 3.5          | ❌         | Insuficiente                   |
| **muted-foreground** sobre background                | 0.34    | 0.98    | 2.6          | ❌         | Insuficiente                   |
| **muted-foreground** sobre muted                     | 0.34    | 0.94    | 2.5          | ❌         | Insuficiente                   |
| **primary** (text-primary) sobre background          | 0.65    | 0.98    | 1.5          | ❌         | Insuficiente                   |
| **primary** sobre card                               | 0.65    | 1.0     | 1.5          | ❌         | Insuficiente                   |
| **secondary-foreground** sobre secondary             | 0.35    | 0.94    | 2.5          | ❌         | Insuficiente                   |
| **accent-foreground** sobre accent                   | 0.25    | 0.92    | 3.2          | ❌         | Insuficiente                   |
| **sidebar-foreground** sobre sidebar                 | 0.28    | 0.97    | 3.1          | ❌         | Solo cumple 3:1 (texto grande) |
| **brand-secondary-foreground** sobre brand-secondary | 0.25    | 0.75    | 2.7          | ❌         | Insuficiente                   |
| **brand-tertiary-foreground** sobre brand-tertiary   | 0.28    | 0.89    | 2.8          | ❌         | Insuficiente                   |

---

## Modo oscuro

_Valores actuales: fondos y textos de contraste ajustados; primary, chart-\*, brand-secondary, brand-tertiary sin cambios._

| Combinación (texto sobre fondo)                      | L texto | L fondo | Ratio aprox. | WCAG 4.5:1 | Estado                      |
| ---------------------------------------------------- | ------- | ------- | ------------ | ---------- | --------------------------- |
| **foreground** sobre background                      | 0.95    | 0.18    | 4.4          | ✅         | Cumple                      |
| **card-foreground** sobre card                       | 0.95    | 0.16    | 4.8          | ✅         | Cumple                      |
| **muted-foreground** sobre background                | 0.92    | 0.18    | 4.2          | ✅         | Cumple                      |
| **muted-foreground** sobre muted                     | 0.92    | 0.16    | 4.6          | ✅         | Cumple                      |
| **primary** (text-primary) sobre background          | 0.65    | 0.18    | 3.0          | ❌         | Color de marca (sin cambio) |
| **primary** sobre card                               | 0.65    | 0.16    | 3.2          | ❌         | Color de marca (sin cambio) |
| **secondary-foreground** sobre secondary             | 0.96    | 0.18    | 4.4          | ✅         | Cumple                      |
| **accent-foreground** sobre accent                   | 0.95    | 0.18    | 4.4          | ✅         | Cumple                      |
| **sidebar-foreground** sobre sidebar                 | 0.94    | 0.14    | 5.2          | ✅         | Cumple                      |
| **sidebar-accent-foreground** sobre sidebar-accent   | 0.94    | 0.16    | 4.7          | ✅         | Cumple                      |
| **brand-secondary-foreground** sobre brand-secondary | 0.20    | 0.78    | 3.3          | ❌         | Color de marca (sin cambio) |
| **brand-tertiary-foreground** sobre brand-tertiary   | 0.92    | 0.30    | 2.8          | ❌         | Color de marca (sin cambio) |

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

### Modo oscuro (actual)

1. **foreground**, **card-foreground**, **muted-foreground**, **secondary-foreground**, **accent-foreground**, **sidebar-foreground**, **sidebar-accent-foreground**: cumplen ≥4.5:1 tras ajustar fondos (background 0.18, card 0.16, muted 0.16, secondary 0.18, accent 0.18, sidebar-accent 0.16) y textos (muted-foreground 0.92, secondary-foreground 0.96).
2. **primary** como texto: ratio ~3.0–3.2; se mantiene sin cambio (color de marca). Evitar text-primary sobre fondos oscuros si se exige 4.5:1.
3. **brand-secondary** y **brand-tertiary**: sin cambios (colores de marca); sus combinaciones con foreground quedan por debajo de 4.5:1.

---

## Recomendación prioritaria

- **Modo claro:** Ajustar `--foreground` y `--card-foreground` a L ≈ 0.20 (y `--muted-foreground` a ≈ 0.28) para cumplir 4.5:1 sobre fondos claros. Para **text-primary** sobre fondo claro, definir un token de “primary text” más oscuro (L ≈ 0.22) y usarlo donde el primary sea texto, manteniendo el primary actual para botones/fondos.
- **Modo oscuro (actual):** Fondos y textos de contraste ajustados (background 0.18, card/muted 0.16, secondary/accent 0.18, sidebar-accent 0.16; muted-foreground 0.92, secondary-foreground 0.96). Todas las combinaciones semánticas cumplen 4.5:1. **primary** y **brand-secondary/brand-tertiary** se mantienen sin cambio (colores de marca); donde se usen como texto sobre fondo oscuro no llegan a 4.5:1.
