---
name: veta-design-md
description: Generate and maintain DESIGN.md for the Veta product — a structured design system document with YAML tokens (colors, typography, spacing, components) and markdown rationale following the google-labs-code/design.md spec. Use when creating DESIGN.md from scratch, updating it after palette or typography changes, documenting visual identity, or when another skill references the design system. Also trigger when the user says "update the design doc", "create design guidelines", "document the design system", "DESIGN.md", or any task involving brand/visual identity documentation for Veta — even if they don't say "DESIGN.md" explicitly.
---

# Veta – DESIGN.md Generation & Maintenance

DESIGN.md is Veta's living design system spec. It combines machine-readable YAML tokens with human-readable prose that explains _why_ those decisions exist. It is the single source of truth for visual identity — agents and developers read it instead of reverse-engineering `globals.css`.

Official spec: <https://github.com/google-labs-code/design.md>

## File location

Always `DESIGN.md` at the project root.

---

## Workflow

### 1. Read the source files

Before writing anything, read these files to extract current values:

- **`src/styles/globals.css`** — all CSS variables (`:root` for light mode, `@variant dark` for dark mode), radius scale, brand tokens, utility classes
- **`src/app/layout.tsx`** — the `next/font` import to confirm the active typeface and weights
- **`memory-bank/productContext.md`** — brand name, persona, copy rationale

These files are the source of truth. Never guess or use remembered values.

---

### 2. Extract design tokens

From `globals.css`, capture:

| Group             | Variables to extract                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| Surfaces          | `--background`, `--foreground`, `--card`, `--card-foreground`, `--muted`, `--muted-foreground`, `--popover`     |
| Brand interaction | `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--accent`, `--accent-foreground` |
| Brand accents     | `--brand-secondary`, `--brand-secondary-foreground`, `--brand-tertiary`, `--brand-tertiary-foreground`          |
| Feedback          | `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`                                    |
| Radius            | `--radius` (base), `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`                                   |
| Spacing           | Infer from the base unit — Veta uses an 8px grid                                                                |

Extract both light (`:root`) and dark (`@variant dark`) values for each token.

From `layout.tsx`, capture:

- Font family name and `variable` CSS custom property
- Weights loaded (the `weight` array in the font config)

---

### 3. Convert oklch → hex

The DESIGN.md spec requires hex (`#RRGGBB` in sRGB). Veta uses oklch internally. Convert each token programmatically:

```bash
node -e "
const oklchToHex = (l, c, h) => {
  // Use CSS to convert — requires a browser or a color library
  // Alternatively: https://oklch.com/ (enter L C H, copy sRGB hex)
};
"
```

For each CSS variable value like `oklch(0.65 0.08 140)`, parse out `L C H` and convert. If a color library is not available in the current environment, use <https://oklch.com/> and document the conversion.

Record the mapping: `--primary: oklch(0.65 0.08 140)` → `primary: "#XXXXXX"`.

---

### 4. Write DESIGN.md

#### YAML frontmatter

Use this schema — populate all values from the tokens extracted in steps 2–3:

```yaml
---
version: alpha
name: Veta
description: <one-line product description from memory-bank/productContext.md>
colors:
  # Light mode (normative values)
  primary: "<hex>"
  primary-foreground: "<hex>"
  secondary: "<hex>"
  secondary-foreground: "<hex>"
  accent: "<hex>"
  accent-foreground: "<hex>"
  background: "<hex>"
  foreground: "<hex>"
  muted: "<hex>"
  muted-foreground: "<hex>"
  card: "<hex>"
  card-foreground: "<hex>"
  border: "<hex>"
  destructive: "<hex>"
  destructive-foreground: "<hex>"
  brand-golden: "<hex>" # --brand-secondary
  brand-golden-foreground: "<hex>"
  brand-cream: "<hex>" # --brand-tertiary
  brand-cream-foreground: "<hex>"
  # Dark mode variants (for component contrast reference)
  background-dark: "<hex>"
  foreground-dark: "<hex>"
  card-dark: "<hex>"
  border-dark: "<hex>"
typography:
  # Populate from next/font config — family name and weights loaded
  display:
    fontFamily: <family>
    fontSize: 3.75rem
    fontWeight: <heaviest loaded weight>
    lineHeight: 1.1
    letterSpacing: -0.03em
  h1:
    fontFamily: <family>
    fontSize: 3rem
    fontWeight: <heading weight>
    lineHeight: 1.1
    letterSpacing: -0.02em
  h2:
    fontFamily: <family>
    fontSize: 2.25rem
    fontWeight: <heading weight>
    lineHeight: 1.2
    letterSpacing: -0.01em
  h3:
    fontFamily: <family>
    fontSize: 1.5rem
    fontWeight: <heading weight>
    lineHeight: 1.3
  body-lg:
    fontFamily: <family>
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.7
  body-md:
    fontFamily: <family>
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: <family>
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: <family>
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1
  label-sm:
    fontFamily: <family>
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.05em
rounded:
  # Convert --radius values from rem to px (1rem = 16px)
  sm: "<px>" # --radius-sm
  md: "<px>" # --radius-md
  lg: "<px>" # --radius-lg (base --radius)
  xl: "<px>" # --radius-xl
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 64px
  gutter: 24px
  margin: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "<primary darkened ~10%>"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: 24px
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  badge-default:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.full}"
    padding: 4px
  badge-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: 4px
---
```

#### Prose sections

Write each section in this order (omit only if truly not applicable):

**## Overview**  
Describe Veta's aesthetic in 2–3 paragraphs: warm earth tones and sage green evoke the tactile world of interior design; professional without being corporate; both light and dark modes are first-class (dark uses warm browns, not cold grays). Reference the persona from `memory-bank/productContext.md`.

**## Colors**  
For each color token, explain its semantic role — what it communicates, where it appears, and why. Example structure:

- Primary (Soft Sage): brand action color — buttons, links, active states, focus rings. Chosen to resonate with the natural palette interior designers work with.
- Brand Golden: secondary brand accent — logo, premium badges, decorative highlights. Not used for interactive elements.
- Dark mode rationale: warm chocolate browns maintain brand warmth on dark screens rather than using generic grays.

**## Typography**  
Document the typeface loaded in `layout.tsx`, the full scale (display → label-sm), and the reasoning — why that family suits interior design professionals (elegance, legibility, brand fit). Note the logo variant (weight 300) and its role.

**## Layout**  
8px base grid. Max-width container at 1200px. Responsive mobile-first. App area: sidebar + content layout. Marketing pages: centered columns with generous whitespace. Card-based grouping for project/client data.

**## Elevation & Depth**  
Tonal elevation — no heavy drop shadows. Light mode: warm layered backgrounds (background → card → muted → secondary, each step subtly different). Dark mode: inverted light shadows (see `.dark .shadow-*` utilities in `globals.css`). Sidebar sits at a slightly deeper background level.

**## Shapes**  
Consistent radius derived from `--radius` base (currently `0.75rem`). All interactive elements and containers use the `--radius-*` scale. Pills/avatars/badges use `rounded.full`. No sharp 0px corners anywhere in the product.

**## Components**  
Describe the primary component atoms: button variants (primary/secondary/ghost/destructive), card (project card, client card, budget card), input, badge, sidebar item, dialog. Reference the component tokens defined in the YAML.

**## Do's and Don'ts**

```markdown
## Do's and Don'ts

### Do

- Use `primary` exclusively for the highest-priority action per screen
- Maintain WCAG AA contrast (4.5:1) for all text on backgrounds
- Always provide both light and dark variants when adding new surfaces
- Use tonal layering for elevation (background → card → muted → secondary)
- Apply `rounded.lg` to cards and dialogs; `rounded.md` to buttons and inputs

### Don't

- Don't use raw oklch values as color tokens in YAML — always convert to hex
- Don't use more than two font weights on a single screen
- Don't hard-code surface colors; use semantic tokens (`bg-card`, `bg-muted`)
- Don't mix sharp (0px) and rounded corners in the same view
- Don't use `brand-golden` for interactive elements — reserve for decorative/premium contexts
```

---

### 5. Validate

```bash
npx @google/design.md lint DESIGN.md
```

Fix all `error` severity findings before committing. For warnings:

| Warning              | Action                                                       |
| -------------------- | ------------------------------------------------------------ |
| `contrast-ratio`     | Adjust token or document the exception in Do's and Don'ts    |
| `broken-ref`         | Fix the `{path.to.token}` reference path                     |
| `missing-typography` | Ensure typography tokens are present when colors are defined |
| `orphaned-tokens`    | Reference the token in a component or remove it              |

---

## Maintaining DESIGN.md

When `globals.css` changes:

1. Read the updated variables and identify what changed.
2. Re-derive hex values for the changed tokens.
3. Update the YAML frontmatter values.
4. Update the prose if the visual intent changed (new accent role, palette shift, etc.).
5. Run lint and fix findings.
6. Commit as `docs: update DESIGN.md — <what changed>` in the same PR as the CSS change.

**The DESIGN.md and `globals.css` must never drift apart.**

---

## Key constraints

- **Hex only** in YAML color values — the spec rejects oklch, hsl, rgb.
- **Light mode tokens are normative**; dark mode is in prose and `-dark` suffixed tokens only where needed for component contrast checks.
- **Single typeface** — whatever `next/font` loads in `layout.tsx` is the only font family.
- **Radius in px** — convert rem values from `globals.css` (`1rem = 16px`).
- DESIGN.md is a **living document** — update it in the same commit as any design system change.
