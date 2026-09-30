# Theme System

Both of my apps [budget-overview](https://github.com/mgrimace/budget-overview/) and [energy-todo](https://github.com/mgrimace/energy-todo) now share a unified theme format. Theme definition files are shared between apps; only token mapping layers differ per application.

Theme files are portable between apps; per-app token mappings live in each app's `themeManager.ts`.

---

## Adding a New Theme

1. Create `src/themes/nameTheme.ts` implementing the `Theme` type below.
2. Copy the file into both apps' `src/themes/`.
3. Register in `src/themes/index.ts`:

```ts
import { nameTheme } from './nameTheme'

export const themes = [
  ...,
  nameTheme,
]

export { ..., nameTheme }
```

## Unified Palette Tokens

Every theme must define all tokens below in both `light` and `dark` palettes.

```ts
{
  // Surfaces
  canvas: string        // page background
  surface: string       // elevated surfaces, cards
  surfaceAlt: string    // secondary surface, form fields
  hover: string         // interactive hover surface

  // Text
  text: string
  textMuted: string
  textInverse: string   // text on accent-coloured backgrounds

  // Borders
  border: string
  borderStrong: string

  // Accent / Interactive
  accent: string
  accentHover: string   // darker accent for hover/active states
  accentSubtle: string  // soft tinted background for selected/active states
  focus: string         // focus ring colour

  // Semantic
  positive: string      // income, success (budget) / low energy (todo)
  warning: string       // caution, amber — between positive and negative
  negative: string      // expense, danger

  // Energy levels — todo only, ignored by budget
  energyLowBg: string
  energyLowAccent: string
  energyLowText: string
  energyMediumBg: string
  energyMediumAccent: string
  energyMediumText: string
  energyHighBg: string
  energyHighAccent: string
  energyHighText: string
}
```
> [!NOTE]
> Extra tokens in the palette are safely ignored by apps that don't use them.

## Per-App Defaults

- budget-overview: `budgetDefaultTheme.ts` (first in `themes` array)
- energy-todo: `defaultTheme.ts` (first in `themes` array)

## Per-app mapping

- **Budget** maps: `canvas`, `surface`, `textInverse`, `text`, `textMuted`, `border`, `accent`, `accentHover`, `accentSubtle`, `positive`, `negative`
- **Todo** maps: `canvas`, `surface`, `surfaceAlt`, `hover`, `text`, `textMuted`, `border`, `borderStrong`, `accent`, `accentHover`, `focus`, `negative`, and all `energy*` tokens

## Accessibility & WCAG

- Normal text: **4.5:1** minimum contrast
- Interactive elements / borders / focus: **3:1** minimum contrast
> [!NOTE] 
> Some decorative-only elements intentionally use reduced opacity or contrast and are reviewed as WCAG exceptions.

### `warning` token audit

Every theme's `warning` colour was sourced from that theme's reference file in `dev-resources/` (an explicit `editorWarning`/"Warning Messages" token where the reference defines one, otherwise the theme's yellow/amber/gold accent swatch), then checked against `canvas` and `surface`:

- All `warning` values meet **4.5:1 against `canvas`**.
- All `warning` values meet at least **3:1 against `surface`**; a few (Catppuccin, Everforest, Flexoki, Gruvbox, Kanagawa/Kanagawa Wave, Nord, Rosé Pine, Solarized, Tokyo Night — light mode) fall just under 4.5:1 on the darker `surface` tone. These are treated as reviewed WCAG exceptions: `surface` is an elevated/secondary background, not the primary text canvas, and the 3:1 non-text threshold still holds.
- Where a reference palette's stock yellow/amber was too low-contrast for light mode to hit even 3:1 (e.g. Nord, Rosé Pine, Gruvbox, Catppuccin Latte, Solarized), a darker tint of the same hue was hand-tuned to reach 4.5:1 against `canvas`, following the existing convention used for `energy*Accent` tokens in those themes.
- `scienceTheme` has no reference file; its `warning` amber was authored to match its existing muted, desaturated palette and independently verified at 4.5:1+.
- `defaultTheme` (Moondust) only defines an explicit warning colour for its light palette; the dark value was derived by brightening the same hue to the contrast level used by its other dark-mode semantic tokens.

## Surface hierarchy

Dark and light modes: `canvas → surface → surfaceAlt → hover`

`surface` should sit perceptually between `canvas` and `surfaceAlt`.

## New theme checklist

1. Implement both `light` and `dark` palettes from the `Theme` interface.
2. Ensure `surface` sits between `canvas` and `surfaceAlt`.
3. Run contrast audit (4.5:1 / 3:1 thresholds).
4. Verify focus states and reduced-motion behavior.
5. Compare `energyLow/Medium/High` accents for balanced weight.
6. Add the theme to `themeManager.ts`