import type { ThemeDefinition } from './types'

export const defaultTheme: ThemeDefinition = {
  id: 'default',
  name: 'Default',
  palettes: {
    light: {
      bg: '#ffffff',
      surface: '#fafbfb',
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
      energyLowBg: '#e3e6df',
      energyLowAccent: '#5f7556',
      energyLowText: '#1e2d18',
      energyMediumBg: '#e0e7f1',
      energyMediumAccent: '#5884b5',
      energyMediumText: '#2b4866',
      energyHighBg: '#ede8f5',
      energyHighAccent: '#9664d0',
      energyHighText: '#3d2060'
    },
    dark: {
      bg: '#161a1d',
      surface: '#1a1e21',
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
      energyLowBg: '#1f2721',
      energyLowAccent: '#87a07a',
      energyLowText: '#c2cebc',
      energyMediumBg: '#1c2431',
      energyMediumAccent: '#4174ae',
      energyMediumText: '#a7c3e2',
      energyHighBg: '#211a34',
      energyHighAccent: '#7d5aa9',
      energyHighText: '#ccc2df'
    }
  }
}