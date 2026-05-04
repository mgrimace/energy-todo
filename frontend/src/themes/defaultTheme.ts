import type { ThemeDefinition } from './types'

export const defaultTheme: ThemeDefinition = {
  id: 'default',
  name: 'Default',
  palettes: {
    light: {
      bg: '#ffffff',
      surface: '#e8ebed',
      surfaceAlt: '#f6f7f8',
      hover: '#e8ebed',
      text: '#24292d',
      textMuted: '#434a51',
      accent: '#3882c2',
      accentStrong: '#1f639e',
      focus: '#65a4d7',
      border: '#d7dcdf',
      borderStrong: '#b6bec3',
      danger: '#E67C7C',
      energyLowBg: '#e0eeea',
      energyLowAccent: '#1c7d49',
      energyLowText: '#1a4433',
      energyMediumBg: '#e0e7f1',
      energyMediumAccent: '#235d9f',
      energyMediumText: '#2f4760',
      energyHighBg: '#ede8f5',
      energyHighAccent: '#7633c2',
      energyHighText: '#3d2060'
    },
    dark: {
      bg: '#161a1d',
      surface: '#22272b',
      surfaceAlt: '#1e2225',
      hover: '#262c31',
      text: '#d2d4d5',
      textMuted: '#b1b6b9',
      accent: '#2769b4',
      accentStrong: '#4d8fdb',
      focus: '#4d8fdb',
      border: '#2c343a',
      borderStrong: '#343f46',
      danger: '#c45858',
      energyLowBg: '#162520',
      energyLowAccent: '#29a362',
      energyLowText: '#7ad4a5',
      energyMediumBg: '#1c2431',
      energyMediumAccent: '#4d8fdb',
      energyMediumText: '#b5cbe0',
      energyHighBg: '#211a34',
      energyHighAccent: '#9d6dd5',
      energyHighText: '#ccc2df'
    }
  }
}