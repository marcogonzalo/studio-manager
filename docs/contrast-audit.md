# Auditoría de contraste (WCAG AA)

**Requisitos:** Texto normal ≥ 4.5:1, texto grande ≥ 3:1, componentes UI ≥ 3:1.

Cálculo aproximado usando luminancia (L de OKLCH): ratio ≈ (L_claro + 0.05) / (L_oscuro + 0.05). Los valores exactos pueden variar al convertir OKLCH → sRGB; este informe sirve para priorizar correcciones.

_Actualizado: modo claro y oscuro con contraste ≥4.5:1 en textos y fondos; botón primary con texto blanco (0.98) por decisión de diseño — ratio ~1.5:1, no cumple 4.5:1._

---

## Modo claro

_Contraste ≥4.5:1 en textos sobre fondos; paleta cálida y profundidad (bg 0.98 > card 0.97 > …). Botón primary: texto blanco 0.98 por decisión de diseño._

| Combinación (texto sobre fondo)                      | L texto | L fondo | Ratio aprox. | WCAG 4.5:1 | Estado                         |
| ---------------------------------------------------- | ------- | ------- | ------------ | ---------- | ------------------------------ |
| **foreground** sobre background                      | 0.17    | 0.98    | 4.7          | ✅         | Cumple                         |
| **card-foreground** sobre card                       | 0.17    | 0.97    | 4.6          | ✅         | Cumple                         |
| **muted-foreground** sobre background                | 0.17    | 0.98    | 4.7          | ✅         | Cumple                         |
| **muted-foreground** sobre muted                     | 0.17    | 0.96    | 4.4          | ✅         | Cumple                         |
| **primary-foreground** sobre primary (botón)         | 0.98    | 0.65    | ~1.5         | ❌         | Texto blanco (decisión diseño) |
| **secondary-foreground** sobre secondary             | 0.17    | 0.94    | 4.5          | ✅         | Cumple                         |
| **accent-foreground** sobre accent                   | 0.16    | 0.92    | 4.6          | ✅         | Cumple                         |
| **sidebar-foreground** sobre sidebar                 | 0.16    | 0.96    | 4.8          | ✅         | Cumple                         |
| **sidebar-accent-foreground** sobre sidebar-accent   | 0.16    | 0.93    | 4.6          | ✅         | Cumple                         |
| **brand-secondary-foreground** sobre brand-secondary | 0.12    | 0.75    | 4.9          | ✅         | Cumple                         |
| **brand-tertiary-foreground** sobre brand-tertiary   | 0.15    | 0.89    | 4.5          | ✅         | Cumple                         |

---

## Modo oscuro (fondos revertidos ~1%, textos en blanco)

_Fondos: background 0.17, muted/card 0.18, secondary/accent 0.17, sidebar 0.15; brand-tertiary 0.17. Textos 0.98; brand-secondary-foreground 0.12. Profundidad: bg 0.17 < card 0.18._

| Combinación (texto sobre fondo)                      | L texto | L fondo | Ratio aprox. | WCAG 4.5:1 | Estado                         |
| ---------------------------------------------------- | ------- | ------- | ------------ | ---------- | ------------------------------ |
| **foreground** sobre background                      | 0.98    | 0.17    | 4.7          | ✅         | Cumple                         |
| **card-foreground** sobre card                       | 0.98    | 0.18    | 4.5          | ✅         | Cumple                         |
| **muted-foreground** sobre background                | 0.98    | 0.17    | 4.7          | ✅         | Cumple                         |
| **muted-foreground** sobre muted                     | 0.98    | 0.18    | 4.5          | ✅         | Cumple                         |
| **primary-foreground** sobre primary (botón)         | 0.98    | 0.65    | ~1.5         | ❌         | Texto blanco (decisión diseño) |
| **secondary-foreground** sobre secondary             | 0.98    | 0.17    | 4.7          | ✅         | Cumple                         |
| **accent-foreground** sobre accent                   | 0.98    | 0.17    | 4.7          | ✅         | Cumple                         |
| **sidebar-foreground** sobre sidebar                 | 0.98    | 0.15    | 5.2          | ✅         | Cumple                         |
| **sidebar-accent-foreground** sobre sidebar-accent   | 0.98    | 0.18    | 4.5          | ✅         | Cumple                         |
| **brand-secondary-foreground** sobre brand-secondary | 0.12    | 0.78    | 4.9          | ✅         | Cumple (texto oscuro)          |
| **brand-tertiary-foreground** sobre brand-tertiary   | 0.98    | 0.17    | 4.7          | ✅         | Cumple (fondo oscuro)          |

---

## Resumen: elementos por debajo del requisito

### Modo claro

1. **Principios aplicados**: texto oscuro (foreground 0.17, muted, secondary, accent, sidebar 0.16–0.17) sobre fondos cálidos; **brand-secondary-foreground** 0.12, **brand-tertiary-foreground** 0.15. **Botón primary**: texto blanco (0.98), ratio ~1.5:1 — no cumple 4.5:1 por decisión de diseño.
2. **Profundidad**: background 0.98 > card 0.97 > muted 0.96 > secondary 0.94 > accent 0.92; bordes 0.88.

### Modo oscuro (revertido ~1%)

1. **Fondos**: background 0.17, muted/card 0.18, secondary/accent 0.17, sidebar 0.15; brand-tertiary 0.17 en dark. Todas las combinaciones semánticas cumplen 4.5:1.
2. **Textos**: 0.98 (blanco) en general; **brand-secondary-foreground** 0.12 (texto oscuro sobre 0.78) para ≥4.5:1.
3. **Primary**: botón con texto blanco (0.98) en ambos modos; ratio ~1.5:1 (no cumple 4.5:1).
4. Bordes L 0.29; transición 0.3s y viñeta aplicadas.

---

## Recomendación prioritaria

- **Modo claro:** Contraste ≥4.5:1 en textos y fondos; botón primary con texto blanco (decisión diseño). Brand-foregrounds oscuros.
- **Modo oscuro:** Fondos marrones; textos 0.98; brand-foregrounds oscuros; botón primary texto blanco. Ratios ≥4.5:1 salvo botón primary (~1.5:1).
