import type { ThemeDefinition } from './types'

export const solarizedTheme: ThemeDefinition = {
  id: 'solarized',
  name: 'Solarized',
  palettes: {
    light: {
      bg: '#fdf6e3',
      surface: '#f6efdc',
      surfaceAlt: '#eee8d5',
      hover: '#dfdac7',
      text: '#546a70',            // derived — base01 #586e75 = 4.39:1 on surfaceAlt, fails 4.5:1; minimum darkening
      textMuted: '#566c73',      // derived — slightly lighter than text for correct muted hierarchy, just passes 4.52:1 on surfaceAlt
      accent: '#268bd2',
      accentStrong: '#6c71c4',
      focus: '#258f8e',          // derived slightly darker cyan — #2aa198 = 2.87:1, fails 3:1
      border: '#93a1a1',
      borderStrong: '#839496',
      danger: '#dc322f',
      energyLowBg: '#edf3d0',
      energyLowAccent: '#7a8c00', // derived — solarized yellow #859900 = 2.81:1, fails 3:1
      energyLowText: '#586e75',
      energyMediumBg: '#dfeef8',
      energyMediumAccent: '#268bd2',
      energyMediumText: '#586e75',
      energyHighBg: '#f2e1ee',
      energyHighAccent: '#d33682',
      energyHighText: '#4d6470'  // derived slightly darker — #586e75 = 4.39:1 on highBg, fails 4.5:1
    },
    dark: {
      bg: '#002b36',
      surface: '#03303c',
      surfaceAlt: '#073642',
      hover: '#0e414e',
      text: '#839496',
      textMuted: '#93a1a1',      // base1 — base00 #657b83 = 2.73:1 on dark bg, fails 4.5:1
      accent: '#268bd2',
      accentStrong: '#6c71c4',
      focus: '#2aa198',
      border: '#586e75',
      borderStrong: '#657b83',
      danger: '#dc322f',
      energyLowBg: '#2f3f14',
      energyLowAccent: '#859900',
      energyLowText: '#a8b5b5',  // derived slightly lighter — base1 #93a1a1 = 4.12:1 on lowBg, fails 4.5:1
      energyMediumBg: '#123a57',
      energyMediumAccent: '#268bd2',
      energyMediumText: '#9badb0', // derived slightly lighter — base1 #93a1a1 = 4.47:1 on medBg, fails 4.5:1
      energyHighBg: '#4a2b43',
      energyHighAccent: '#e0428e', // derived lighter magenta — #d33682 = 2.85:1 on highBg, fails 3:1
      energyHighText: '#93a1a1'
    }
  }
}