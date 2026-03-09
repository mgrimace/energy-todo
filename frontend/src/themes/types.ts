export type ThemeMode = 'light' | 'dark'

export type ThemePalette = Record<string, string>

export interface ThemeDefinition {
  id: string
  name: string
  preview: string[]
  palettes: {
    light: ThemePalette
    dark: ThemePalette
  }
}
