import type { ThemeDefinition } from './types'

export const kanagawaTheme: ThemeDefinition = {
  id: 'kanagawa',
  name: 'Kanagawa',
  palettes: {
    light: {
      // Kanagawa Lotus
      bg: '#f2ecbc',
      surface: '#e4dfa8',
      surfaceAlt: '#ece8b3',
      hover: '#e8e3a8',
      text: '#545464',
      textMuted: '#8a8980',
      accent: '#4d699b',
      accentStrong: '#6693bf',
      accentOn: '#f2ecbc',
      focus: '#6693bf',
      border: '#d4cfa0',
      borderStrong: '#c0ba8a',
      success: '#6f894e',
      danger: '#c84053',
      warning: '#77713f',
      dangerSoft: '#f5dcd6',
      energyLowBg: '#e5edda',
      energyLowBorder: '#9ab580',
      energyLowText: '#4a6132',
      energyMediumBg: '#dce5f0',
      energyMediumBorder: '#7a9cc4',
      energyMediumText: '#365080',
      energyHighBg: '#ecdce5',
      energyHighBorder: '#c088a4',
      energyHighText: '#7d3557'
    },
    dark: {
      // Kanagawa Dragon
      bg: '#181616',
      surface: '#22231f',
      surfaceAlt: '#1f1d1a',
      hover: '#2a2826',
      text: '#c5c9c5',
      textMuted: '#a6a69c',
      accent: '#7fb4ca',
      accentStrong: '#8ba4b0',
      accentOn: '#181616',
      focus: '#7fb4ca',
      border: '#2d2b27',
      borderStrong: '#3d3b37',
      success: '#8a9a7b',
      danger: '#c4746e',
      warning: '#c4b28a',
      dangerSoft: '#2a2826',
      energyLowBg: '#1e2620',
      energyLowBorder: '#4a5e4a',
      energyLowText: '#8a9a7b',
      energyMediumBg: '#1b2430',
      energyMediumBorder: '#3a5168',
      energyMediumText: '#7fb4ca',
      energyHighBg: '#221f2c',
      energyHighBorder: '#4a4260',
      energyHighText: '#a292a3'
    }
  }
}
