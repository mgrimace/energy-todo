import type { ThemeDefinition } from './types'

export const draculaTheme: ThemeDefinition = {
  id: 'dracula',
  name: 'Dracula',
  palettes: {
    light: {
      bg: '#DEDCCF',
      surface: '#CECCC0',
      surfaceAlt: '#BCBAB3',
      hover: '#ECE9DF',
      text: '#1F1F1F',
      textMuted: '#3d362a',        // derived dark warm brown — Alucard comment #6C664B = 4.19:1 on bg but fails surface/surfaceAlt at 4.5:1; surfaces require near-black
      accent: '#036A96',
      accentStrong: '#644AC9',
      focus: '#815CD6',
      border: '#CECCC0',
      borderStrong: '#BCBAB3',
      danger: '#CB3A2A',
      energyLowBg: '#ECE9DF',
      energyLowAccent: '#14710A',
      energyLowText: '#1F1F1F',
      energyMediumBg: '#ECE9DF',
      energyMediumAccent: '#036A96',
      energyMediumText: '#1F1F1F',
      energyHighBg: '#ECE9DF',
      energyHighAccent: '#644AC9',
      energyHighText: '#1F1F1F'
    },
    dark: {
      bg: '#191A21',
      surface: '#21222C',
      surfaceAlt: '#343746',
      hover: '#424450',
      text: '#F8F8F2',
      textMuted: '#a0acd8',        // derived lighter periwinkle — current-line #6272A4 = 3.68:1 on bg, fails 4.5:1 on all dark surfaces
      accent: '#8BE9FD',
      accentStrong: '#BD93F9',
      focus: '#815CD6',
      border: '#282A36',
      borderStrong: '#424450',
      danger: '#FF5555',
      energyLowBg: '#343746',
      energyLowAccent: '#50FA7B',
      energyLowText: '#F8F8F2',
      energyMediumBg: '#343746',
      energyMediumAccent: '#8BE9FD',
      energyMediumText: '#F8F8F2',
      energyHighBg: '#343746',
      energyHighAccent: '#BD93F9',
      energyHighText: '#F8F8F2'
    }
  }
}
