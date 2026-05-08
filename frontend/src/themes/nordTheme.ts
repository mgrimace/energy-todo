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
      accentStrong: '#5E81AC',     // frost3 — frost1 #81A1C1 = 2.76:1, fails 3:1
      focus: '#4C566A',            // polar night 4 — frost2 #88C0D0 = 1.74:1, fails 3:1; polar night provides clear visual distinction
      border: '#81A1C1',
      borderStrong: '#5E81AC',
      danger: '#BF616A',
      energyLowBg: '#D8E7D4',
      energyLowAccent: '#4d7a3e',  // derived darker green — aurora green #A3BE8C = 1.99:1, fails 3:1; no canonical Nord green is dark enough
      energyLowText: '#2E3440',
      energyMediumBg: '#D4E3EC',
      energyMediumAccent: '#5E81AC', // frost3 — frost1 #81A1C1 = 2.76:1, fails 3:1 on energyMediumBg
      energyMediumText: '#2E3440',
      energyHighBg: '#DFD5E8',
      energyHighAccent: '#8a6990',   // derived darker purple — aurora purple #B48EAD = 2.48:1, fails 3:1; no canonical Nord purple is dark enough
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
