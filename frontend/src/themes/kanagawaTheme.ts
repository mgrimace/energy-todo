import type { ThemeDefinition } from './types'

export const kanagawaTheme: ThemeDefinition = {
  id: 'kanagawa',
  name: 'Kanagawa',
  palettes: {
    light: {
      // Kanagawa Lotus
      bg: '#f2ecbc',
      surface: '#ece8b3',
      surfaceAlt: '#e4dfa8',
      hover: '#e8e3a8',
      text: '#545464',
      textMuted: '#8a8980',
      accent: '#4d699b',
      accentStrong: '#6693bf',
      focus: '#6693bf',
      border: '#d4cfa0',
      borderStrong: '#c0ba8a',
      danger: '#c84053',
      energyLowBg: '#e5edda',
      energyLowAccent: '#9ab580',
      energyLowText: '#4a6132',
      energyMediumBg: '#dce5f0',
      energyMediumAccent: '#7a9cc4',
      energyMediumText: '#365080',
      energyHighBg: '#ecdce5',
      energyHighAccent: '#c088a4',
      energyHighText: '#7d3557'
    },
    dark: {
      // Kanagawa Dragon
      bg: '#181616',
      surface: '#1f1d1a',
      surfaceAlt: '#22231f',
      hover: '#2a2826',
      text: '#c5c9c5',
      textMuted: '#a6a69c',
      accent: '#7fb4ca',
      accentStrong: '#8ba4b0',
      focus: '#7fb4ca',
      border: '#2d2b27',
      borderStrong: '#3d3b37',
      danger: '#c4746e',
      energyLowBg: '#1e2620',
      energyLowAccent: '#4a5e4a',
      energyLowText: '#8a9a7b',
      energyMediumBg: '#1b2430',
      energyMediumAccent: '#3a5168',
      energyMediumText: '#7fb4ca',
      energyHighBg: '#221f2c',
      energyHighAccent: '#4a4260',
      energyHighText: '#a292a3'
    }
  }
}
