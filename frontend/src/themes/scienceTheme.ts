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

      accent: '#3e9fda',
      accentStrong: '#2478b5',
      focus: '#73bbe8',

      border: '#d6dde3',
      borderStrong: '#b8c3cc',

      danger: '#cfa3ad',

      energyLowBg: '#dcf5eb',
      energyLowAccent: '#1f9a74',
      energyLowText: '#163126',

      energyMediumBg: '#deeffd',
      energyMediumAccent: '#2b7fc2',
      energyMediumText: '#10283b',

      energyHighBg: '#f4e7f1',
      energyHighAccent: '#b05c8d',
      energyHighText: '#341827'
    },

    dark: {
      bg: '#0d141b',
      surface: '#111b24',
      surfaceAlt: '#16212b',
      hover: '#223240',

      text: '#d7e0e7',
      textMuted: '#98aab7',

      accent: '#4db2ea',
      accentStrong: '#3294cb',
      focus: '#78baee',

      border: '#2a3945',
      borderStrong: '#344754',

      danger: '#cfa3ad',

      energyLowBg: '#162922',
      energyLowAccent: '#72d6b4',
      energyLowText: '#d2f2e7',

      energyMediumBg: '#13283a',
      energyMediumAccent: '#6fb7f2',
      energyMediumText: '#d5ebff',

      energyHighBg: '#2a1d26',
      energyHighAccent: '#d996c4',
      energyHighText: '#f0d7e7'
    }
  }
}