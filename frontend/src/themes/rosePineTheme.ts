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
      textMuted: '#686280',
      accent: '#286983',
      accentStrong: '#1f5470',
      focus: '#56949f',
      border: '#dfdad9',
      borderStrong: '#cecacd',
      danger: '#b4637a',
      energyLowBg: '#e2eef0',
      energyLowAccent: '#4d878f',
      energyLowText: '#2a5c66',
      energyMediumBg: '#e4eeed',
      energyMediumAccent: '#286983',
      energyMediumText: '#174a58',
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
      energyLowBg: '#191f26',
      energyLowAccent: '#9ccfd8',
      energyLowText: '#c9e8ed',
      energyMediumBg: '#192028',
      energyMediumAccent: '#31748f',
      energyMediumText: '#9ccfd8',
      energyHighBg: '#1e1a2c',
      energyHighAccent: '#c4a7e7',
      energyHighText: '#d8c8f0'
    }
  }
}
