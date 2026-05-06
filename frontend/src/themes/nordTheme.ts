import type { ThemeDefinition } from './types'

export const nordTheme: ThemeDefinition = {
  id: 'nord',
  name: 'Nord',
  palettes: {
    light: {
      bg: '#ECEFF4',
      surface: '#E5E9F0',
      surfaceAlt: '#D8DEE9',
      hover: '#E5E9F0',
      text: '#2E3440',
      textMuted: '#4C566A',
      accent: '#5E81AC',
      accentStrong: '#81A1C1',
      focus: '#88C0D0',
      border: '#81A1C1',
      borderStrong: '#5E81AC',
      danger: '#BF616A',
      energyLowBg: '#D8E7D4',
      energyLowAccent: '#A3BE8C',
      energyLowText: '#2E3440',
      energyMediumBg: '#D4E3EC',
      energyMediumAccent: '#81A1C1',
      energyMediumText: '#2E3440',
      energyHighBg: '#DFD5E8',
      energyHighAccent: '#B48EAD',
      energyHighText: '#2E3440'
    },
    dark: {
      bg: '#2E3440',
      surface: '#3B4252',
      surfaceAlt: '#434C5E',
      hover: '#3B4252',
      text: '#ECEFF4',
      textMuted: '#D8DEE9',
      accent: '#88C0D0',
      accentStrong: '#81A1C1',
      focus: '#8FBCBB',
      border: '#4C566A',
      borderStrong: '#81A1C1',
      danger: '#BF616A',
      energyLowBg: '#3A4A43',
      energyLowAccent: '#A3BE8C',
      energyLowText: '#ECEFF4',
      energyMediumBg: '#3A4A5C',
      energyMediumAccent: '#81A1C1',
      energyMediumText: '#ECEFF4',
      energyHighBg: '#4B4258',
      energyHighAccent: '#B48EAD',
      energyHighText: '#ECEFF4'
    }
  }
}
