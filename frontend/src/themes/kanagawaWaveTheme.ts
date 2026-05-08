import type { ThemeDefinition } from './types'

export const kanagawaWaveTheme: ThemeDefinition = {
  id: 'kanagawa-wave',
  name: 'Kanagawa Wave',
  palettes: {
    light: {
      // Kanagawa Lotus (same as kanagawa theme)
      bg: '#f2ecbc',
      surface: '#ece8b3',
      surfaceAlt: '#e4dfa8',
      hover: '#e8e3a8',
      text: '#545464',
      textMuted: '#616054',        // derived — bright.black #8a8980 = 2.93:1, fails 4.5:1; no canonical mid-shade in Lotus palette
      accent: '#4d699b',
      accentStrong: '#4d699b',     // normal.blue — bright.blue #6693bf = 2.70:1, fails 3:1
      focus: '#597b75',            // normal.cyan — bright.blue #6693bf = 2.70:1, fails 3:1
      border: '#d4cfa0',
      borderStrong: '#c0ba8a',
      danger: '#c84053',
      energyLowBg: '#e5edda',
      energyLowAccent: '#6f894e',  // lotus bright.green — #9ab580 = 1.88:1, fails 3:1
      energyLowText: '#4a6132',
      energyMediumBg: '#dce5f0',
      energyMediumAccent: '#4d699b', // normal.blue — #7a9cc4 = 2.37:1, fails 3:1
      energyMediumText: '#365080',
      energyHighBg: '#ecdce5',
      energyHighAccent: '#b35b79',   // normal.magenta — #c088a4 = 2.40:1, fails 3:1
      energyHighText: '#7d3557'
    },
    dark: {
      // Kanagawa Wave
      bg: '#1f1f28',
      surface: '#252530',
      surfaceAlt: '#2a2a37',
      hover: '#313145',
      text: '#dcd7ba',
      textMuted: '#9e9b91',        // derived neutral warm grey — bright.black #727169 = 3.14:1, fails 4.5:1 on Wave dark surfaces
      accent: '#7fb4ca',
      accentStrong: '#7e9cd8',
      focus: '#7fb4ca',
      border: '#363646',
      borderStrong: '#54546d',
      danger: '#c34043',
      energyLowBg: '#253025',
      energyLowAccent: '#98bb6c',  // wave bright.green — #4a6645 = 1.79:1, fails 3:1
      energyLowText: '#98bb6c',
      energyMediumBg: '#1e2d3e',
      energyMediumAccent: '#7fb4ca', // bright.blue — #3a5878 = 2.06:1, fails 3:1
      energyMediumText: '#7fb4ca',
      energyHighBg: '#2a2438',
      energyHighAccent: '#957fb8',   // normal.magenta — #5a4e78 = 1.84:1, fails 3:1
      energyHighText: '#a192c2'      // derived slightly lighter — same hue as new accent but lightened to pass 4.5:1 on highBg
    }
  }
}
