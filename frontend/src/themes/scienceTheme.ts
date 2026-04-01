import type { ThemeDefinition } from './types'

export const scienceTheme: ThemeDefinition = {
  id: 'science',
  name: 'Science',
  palettes: {
    light: {
      bg: '#f1f8fd',
      surface: '#e6f1fc',
      surfaceAlt: '#ffffff',
      hover: '#dde6ed',
      text: '#2a3a46',
      textMuted: '#5c6b76',

      accent: '#3a8ed0',
      accentStrong: '#1f5e91',
      accentOn: '#ffffff',
      focus: '#6aa6d8',

      border: '#d6dde3',
      borderStrong: '#b8c3cc',

      success: '#2f5a44',
      danger: '#8c4b2a',
      warning: '#a1741a',
      dangerSoft: '#f2e6e3',

      energyLowBg: '#e8f3ed',
      energyLowBorder: '#a8c8b8',
      energyLowText: '#2f5a44',

      energyMediumBg: '#e8f0f8',
      energyMediumBorder: '#8fa9c4',
      energyMediumText: '#2e4a66',

      energyHighBg: '#ece9f4',
      energyHighBorder: '#b7aed1',
      energyHighText: '#4b4266'
    },

    dark: {
      bg: '#0f1720',
      surface: '#1b2a36',
      surfaceAlt: '#16222c',
      hover: '#233645',

      text: '#d4dde4',
      textMuted: '#9fb0bd',

      accent: '#4fa3e0',
      accentStrong: '#3a8ed0',
      accentOn: '#0e151b',
      focus: '#66b3ea',

      border: '#2b3944',
      borderStrong: '#364752',

      success: '#a7d0bb',
      danger: '#d07b57',
      warning: '#d8b46b',
      dangerSoft: '#2a2320',

      energyLowBg: '#1f2d27',
      energyLowBorder: '#3d5e50',
      energyLowText: '#a7d0bb',

      energyMediumBg: '#223243',
      energyMediumBorder: '#4f6f8a',
      energyMediumText: '#b6cce0',

      energyHighBg: '#27233a',
      energyHighBorder: '#5c5775',
      energyHighText: '#d2cce6'
    }
  }
}