import type { ThemeDefinition } from './types'

export const catppuccinTheme: ThemeDefinition = {
  id: 'catppuccin',
  name: 'Catppuccin',
  palettes: {
    light: {
      bg: '#EFF1F5',
      surface: '#E6E9EF',
      surfaceAlt: '#DCE0E8',
      hover: '#CCD0DA',
      text: '#4C4F69',
      textMuted: '#5C5F77',        // subtext1 — subtext0 #6C6F85 failed 4.5:1 on surfaceAlt
      accent: '#1E66F5',
      accentStrong: '#8839EF',     // mauve — lavender #7287FD = 2.81:1, fails 3:1 on light bg
      focus: '#179299',            // teal — sky #04A5E5 = 2.47:1, fails 3:1
      border: '#BCC0CC',
      borderStrong: '#ACB0BE',
      danger: '#D20F39',
      energyLowBg: '#e1eae3',
      energyLowAccent: '#3a9226',  // derived darker green — Latte green #40A02B = 2.96:1, just below 3:1
      energyLowText: '#2e5e25',
      energyMediumBg: '#dee6f5',
      energyMediumAccent: '#1E66F5',
      energyMediumText: '#1a4ea0',
      energyHighBg: '#e7e2f5',
      energyHighAccent: '#8839EF',
      energyHighText: '#561fa6'
    },
    dark: {
      bg: '#1E1E2E',
      surface: '#272839',
      surfaceAlt: '#313244',
      hover: '#45475a',
      text: '#CDD6F4',
      textMuted: '#A6ADC8',
      accent: '#89B4FA',
      accentStrong: '#B4BEFE',
      focus: '#89DCEB',
      border: '#45475A',
      borderStrong: '#585B70',
      danger: '#F38BA8',
      energyLowBg: '#1c2822',
      energyLowAccent: '#A6E3A1',
      energyLowText: '#b3d9b0',
      energyMediumBg: '#1c2238',
      energyMediumAccent: '#89B4FA',
      energyMediumText: '#b3c6ea',
      energyHighBg: '#261e38',
      energyHighAccent: '#CBA6F7',
      energyHighText: '#d0bff0'
    }
  }
}
