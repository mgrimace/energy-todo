import type { ThemeDefinition } from './types'

export const solarizedTheme: ThemeDefinition = {
  id: 'solarized',
  name: 'Solarized',
  palettes: {
    light: {
      bg: '#fdf6e3',
      surface: '#eee8d5',
      surfaceAlt: '#fdf6e3',
      hover: '#eee8d5',
      text: '#657b83',
      textMuted: '#586e75',
      accent: '#268bd2',
      accentStrong: '#6c71c4',
      focus: '#2aa198',
      border: '#93a1a1',
      borderStrong: '#839496',
      danger: '#dc322f',
      energyLowBg: '#edf3d0',
      energyLowAccent: '#859900',
      energyLowText: '#586e75',
      energyMediumBg: '#dfeef8',
      energyMediumAccent: '#268bd2',
      energyMediumText: '#586e75',
      energyHighBg: '#f2e1ee',
      energyHighAccent: '#d33682',
      energyHighText: '#586e75'
    },
    dark: {
      bg: '#002b36',
      surface: '#073642',
      surfaceAlt: '#002b36',
      hover: '#073642',
      text: '#839496',
      textMuted: '#93a1a1',
      accent: '#268bd2',
      accentStrong: '#6c71c4',
      focus: '#2aa198',
      border: '#586e75',
      borderStrong: '#657b83',
      danger: '#dc322f',
      energyLowBg: '#2f3f14',
      energyLowAccent: '#859900',
      energyLowText: '#93a1a1',
      energyMediumBg: '#123a57',
      energyMediumAccent: '#268bd2',
      energyMediumText: '#93a1a1',
      energyHighBg: '#4a2b43',
      energyHighAccent: '#d33682',
      energyHighText: '#93a1a1'
    }
  }
}