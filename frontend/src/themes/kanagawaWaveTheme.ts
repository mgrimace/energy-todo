import type { ThemeDefinition } from './types'

export const kanagawaWaveTheme: ThemeDefinition = {
  id: 'kanagawa-wave',
  name: 'Kanagawa Wave',
  palettes: {
    light: {
      // Kanagawa Lotus (same as kanagawa theme)
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
      // Kanagawa Wave
      bg: '#1f1f28',
      surface: '#2a2a37',
      surfaceAlt: '#252530',
      hover: '#313145',
      text: '#dcd7ba',
      textMuted: '#727169',
      accent: '#7fb4ca',
      accentStrong: '#7e9cd8',
      accentOn: '#1f1f28',
      focus: '#7fb4ca',
      border: '#363646',
      borderStrong: '#54546d',
      success: '#76946a',
      danger: '#c34043',
      warning: '#c0a36e',
      dangerSoft: '#313145',
      energyLowBg: '#253025',
      energyLowBorder: '#4a6645',
      energyLowText: '#98bb6c',
      energyMediumBg: '#1e2d3e',
      energyMediumBorder: '#3a5878',
      energyMediumText: '#7fb4ca',
      energyHighBg: '#2a2438',
      energyHighBorder: '#5a4e78',
      energyHighText: '#957fb8'
    }
  }
}
