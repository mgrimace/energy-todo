import type { ThemeDefinition, ThemeMode } from './types'

const tokenToCssVarMap: Record<string, string[]> = {
  canvas:            ['--color-bg'],
  surface:           ['--color-surface-muted', '--color-entry-card-bg'],
  surfaceAlt:        ['--color-item-cards-bg', '--color-field-bg'],
  hover:             ['--surface-hover'],
  text:              ['--color-text'],
  textMuted:         ['--color-text-muted'],
  border:            ['--color-border'],
  borderStrong:      ['--color-border-strong'],
  accent:            ['--color-accent'],
  accentHover:       ['--color-accent-strong'],
  focus:             ['--color-focus-ring'],
  negative:          ['--color-danger-text'],
  energyLowBg:       ['--energy-low-bg'],
  energyLowAccent:   ['--energy-low-accent'],
  energyLowText:     ['--energy-low-text'],
  energyMediumBg:    ['--energy-medium-bg'],
  energyMediumAccent:['--energy-medium-accent'],
  energyMediumText:  ['--energy-medium-text'],
  energyHighBg:      ['--energy-high-bg'],
  energyHighAccent:  ['--energy-high-accent'],
  energyHighText:    ['--energy-high-text'],
}

export function applyTheme(theme: ThemeDefinition, mode: ThemeMode) {
  const root = document.documentElement
  const palette = theme.palettes[mode]

  root.setAttribute('data-theme', mode)
  root.setAttribute('data-theme-id', theme.id)

  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(el => {
    el.content = palette.canvas
  })

  for (const [token, value] of Object.entries(palette)) {
    const cssVars = tokenToCssVarMap[token]
    if (!cssVars) continue
    for (const cssVar of cssVars) {
      root.style.setProperty(cssVar, value)
    }
  }
}
