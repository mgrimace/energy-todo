import type { ThemeDefinition } from './types'

export const catppuccinTheme: ThemeDefinition = {
  id: 'catppuccin',
  name: 'Catppuccin',
  palettes: {
    light: {
      bg: '#EFF1F5',
      surface: '#E6E9EF',
      surfaceAlt: '#DCE0E8',
      hover: '#E6E9EF',
      text: '#4C4F69',
      textMuted: '#6C6F85',
      accent: '#1E66F5',
      accentStrong: '#7287FD',
      focus: '#04A5E5',
      border: '#BCC0CC',
      borderStrong: '#ACB0BE',
      danger: '#D20F39',
      energyLowBg: '#DCE0E8',
      energyLowAccent: '#40A02B',
      energyLowText: '#4C4F69',
      energyMediumBg: '#DCE0E8',
      energyMediumAccent: '#1E66F5',
      energyMediumText: '#4C4F69',
      energyHighBg: '#DCE0E8',
      energyHighAccent: '#8839EF',
      energyHighText: '#4C4F69'
    },
    dark: {
      bg: '#1E1E2E',
      surface: '#181825',
      surfaceAlt: '#11111B',
      hover: '#313244',
      text: '#CDD6F4',
      textMuted: '#A6ADC8',
      accent: '#89B4FA',
      accentStrong: '#B4BEFE',
      focus: '#89DCEB',
      border: '#45475A',
      borderStrong: '#585B70',
      danger: '#F38BA8',
      energyLowBg: '#313244',
      energyLowAccent: '#A6E3A1',
      energyLowText: '#CDD6F4',
      energyMediumBg: '#313244',
      energyMediumAccent: '#89B4FA',
      energyMediumText: '#CDD6F4',
      energyHighBg: '#313244',
      energyHighAccent: '#CBA6F7',
      energyHighText: '#CDD6F4'
    }
  }
}
