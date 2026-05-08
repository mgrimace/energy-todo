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
      textMuted: '#616054',        // derived — bright.black #8a8980 = 2.93:1, fails 4.5:1; no canonical mid-shade between text and bright.black in Lotus palette
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
      energyLowAccent: '#8a9a7b',  // dragon bright.green — #4a5e4a = 2.57:1, fails 3:1
      energyLowText: '#8a9a7b',
      energyMediumBg: '#1b2430',
      energyMediumAccent: '#7fb4ca', // bright.blue — #3a5168 = 2.19:1, fails 3:1
      energyMediumText: '#7fb4ca',
      energyHighBg: '#221f2c',
      energyHighAccent: '#938aa9',   // bright.magenta — #4a4260 = 1.92:1, fails 3:1
      energyHighText: '#a292a3'
    }
  }
}
