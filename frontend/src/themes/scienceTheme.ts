import type { ThemeDefinition } from './types'

export const scienceTheme: ThemeDefinition = {
  id: 'science',
  name: 'Science',
  palettes: {
    light: {
      bg: '#f1f8fd',
      surface: '#f8fbfe',
      surfaceAlt: '#ffffff',
      hover: '#dde6ed',
      text: '#2a3a46',
      textMuted: '#5c6b76',

      accent: '#3a8ed0',
      accentStrong: '#1f5e91',
      focus: '#6aa6d8',

      border: '#d6dde3',
      borderStrong: '#b8c3cc',

      danger: '#8c4b2a',

      energyLowBg: '#e8f3ed',
      energyLowAccent: '#4d8f78',
      energyLowText: '#2f5a44',

      energyMediumBg: '#e8f0f8',
      energyMediumAccent: '#8fa9c4',
      energyMediumText: '#2e4a66',

      energyHighBg: '#ece9f4',
      energyHighAccent: '#b7aed1',
      energyHighText: '#4b4266'
    },

    dark: {
      bg: '#0f1720',
      surface: '#121c26',
      surfaceAlt: '#16222c',
      hover: '#233645',

      text: '#d4dde4',
      textMuted: '#9fb0bd',

      accent: '#4fa3e0',
      accentStrong: '#3a8ed0',
      focus: '#66b3ea',

      border: '#2b3944',
      borderStrong: '#364752',

      danger: '#d07b57',

      energyLowBg: '#1f2d27',
      energyLowAccent: '#5a9882',
      energyLowText: '#a7d0bb',

      energyMediumBg: '#223243',
      energyMediumAccent: '#4f6f8a',
      energyMediumText: '#b6cce0',

      energyHighBg: '#27233a',
      energyHighAccent: '#5c5775',
      energyHighText: '#d2cce6'
    }
  }
}