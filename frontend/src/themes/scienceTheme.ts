import type { ThemeDefinition } from './types'

export const scienceTheme: ThemeDefinition = {
  id: 'science',
  name: 'Science',

  palettes: {
    light: {
      bg: '#edf4f8',
      surface: '#f5f9fc',
      surfaceAlt: '#fbfdff',
      hover: '#dce5eb',

      text: '#2c3942',
      textMuted: '#5d6b74',

      accent: '#4b8fba',
      accentStrong: '#376f97',
      focus: '#0f7c90',            // derived dark teal — sky #6ea8cb = 2.33:1, fails 3:1

      border: '#d1dbe2',
      borderStrong: '#b5c2cb',

      danger: '#b86a68',

      energyLowBg: '#dceee7',
      energyLowAccent: '#3f8b73',
      energyLowText: '#1f332d',

      energyMediumBg: '#dce8f4',
      energyMediumAccent: '#4d7faa',
      energyMediumText: '#183247',

      energyHighBg: '#ece3ef',
      energyHighAccent: '#9a6fa9',
      energyHighText: '#35223e'
    },

    dark: {
      bg: '#0f151b',
      surface: '#141c23',
      surfaceAlt: '#18222b',
      hover: '#22303b',

      text: '#d6dfe5',
      textMuted: '#94a5b1',

      accent: '#5a9dc6',
      accentStrong: '#78b5db',
      focus: '#7cb8db',

      border: '#2b3943',
      borderStrong: '#374753',

      danger: '#b66b69',

      energyLowBg: '#1a2924',
      energyLowAccent: '#79c3ab',
      energyLowText: '#d6efe7',

      energyMediumBg: '#182737',
      energyMediumAccent: '#78abd4',
      energyMediumText: '#d8ebfb',

      energyHighBg: '#2a2230',
      energyHighAccent: '#c08dc0',
      energyHighText: '#efddef'
    }
  }
}