import type { ThemeDefinition } from './types'

export const rosePineTheme: ThemeDefinition = {
  id: 'rose-pine',
  name: 'Rosé Pine',
  palettes: {
    light: {
      bg: '#faf4ed',
      surface: '#f6eee7',
      surfaceAlt: '#f2e9e1',
      hover: '#dfdad9',
      text: '#575279',
      textMuted: '#9893a5',
      accent: '#286983',
      accentStrong: '#1f5470',
      focus: '#56949f',
      border: '#dfdad9',
      borderStrong: '#cecacd',
      danger: '#b4637a',
      energyLowBg: '#e4eeed',
      energyLowAccent: '#286983',
      energyLowText: '#174a58',
      energyMediumBg: '#e2eef0',
      energyMediumAccent: '#56949f',
      energyMediumText: '#2a5c66',
      energyHighBg: '#ede9f0',
      energyHighAccent: '#907aa9',
      energyHighText: '#4a3566'
    },
    dark: {
      bg: '#191724',
      surface: '#1c1a29',
      surfaceAlt: '#1f1d2e',
      hover: '#26233a',
      text: '#e0def4',
      textMuted: '#908caa',
      accent: '#31748f',
      accentStrong: '#6aabbf',
      focus: '#9ccfd8',
      border: '#26233a',
      borderStrong: '#403d52',
      danger: '#eb6f92',
      energyLowBg: '#192028',
      energyLowAccent: '#31748f',
      energyLowText: '#9ccfd8',
      energyMediumBg: '#191f26',
      energyMediumAccent: '#9ccfd8',
      energyMediumText: '#c9e8ed',
      energyHighBg: '#1e1a2c',
      energyHighAccent: '#c4a7e7',
      energyHighText: '#d8c8f0'
    }
  }
}
