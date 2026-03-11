import type { ThemeDefinition, ThemeMode } from './types'

const tokenToCssVarMap: Record<string, string[]> = {
  bg: ['--color-bg'],
  surface: ['--color-surface-muted', '--color-entry-card-bg'],
  surfaceAlt: ['--color-item-cards-bg', '--color-field-bg'],
  hover: ['--surface-hover'],
  text: ['--color-text'],
  textMuted: ['--color-text-muted'],
  accent: ['--color-accent'],
  accentStrong: ['--color-accent-strong'],
  accentOn: ['--color-accent-on'],
  focus: ['--color-focus-ring'],
  border: ['--color-border', '--color-divider-thread'],
  borderStrong: ['--color-border-strong'],
  success: ['--theme-success'],
  warning: ['--theme-warning'],
  danger: ['--color-danger-text'],
  dangerSoft: ['--color-danger-soft'],
  toggleTrack: ['--color-toggle-track'],
  energyLowBg: ['--energy-low-bg'],
  energyLowBorder: ['--energy-low-border'],
  energyLowText: ['--energy-low-text'],
  energyMediumBg: ['--energy-medium-bg'],
  energyMediumBorder: ['--energy-medium-border'],
  energyMediumText: ['--energy-medium-text'],
  energyHighBg: ['--energy-high-bg'],
  energyHighBorder: ['--energy-high-border'],
  energyHighText: ['--energy-high-text']
}

export function applyTheme(theme: ThemeDefinition, mode: ThemeMode) {
  const root = document.documentElement
  const palette = theme.palettes[mode]

  root.setAttribute('data-theme', mode)
  root.setAttribute('data-theme-id', theme.id)

  for (const [token, value] of Object.entries(palette)) {
    const cssVars = tokenToCssVarMap[token]
    if (!cssVars) continue

    for (const cssVar of cssVars) {
      root.style.setProperty(cssVar, value)
    }
  }
}
