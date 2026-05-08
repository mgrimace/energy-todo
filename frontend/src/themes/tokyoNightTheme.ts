import type { ThemeDefinition } from './types'

export const tokyoNightTheme: ThemeDefinition = {
  id: 'tokyo-night',
  name: 'Tokyo Night',
  palettes: {
    light: {
      bg: '#e6e7ed',
      surface: '#dee0e6',
      surfaceAlt: '#d6d8df',
      hover: '#c6c9d1',
      text: '#363c4d',
      textMuted: '#595e71',        // derived darker — TN comment #707280 = 4.09:1 on bg, fails 4.5:1; no canonical TN Light shade available
      accent: '#2959aa',
      accentStrong: '#1d4a8a',
      focus: '#0f7c90',            // derived dark teal — cyan #0da0ba = 2.55:1, fails 3:1; distinct from accent
      border: '#c1c2c7',
      borderStrong: '#9da0ab',
      danger: '#bd4040',
      energyLowBg: '#d3e8e5',
      energyLowAccent: '#2d7b74',
      energyLowText: '#1a4f4a',
      energyMediumBg: '#d8dfee',
      energyMediumAccent: '#2959aa',
      energyMediumText: '#1a3470',
      energyHighBg: '#dfdaec',
      energyHighAccent: '#5a3e8e',
      energyHighText: '#3b1f6a'
    },
    dark: {
      bg: '#1a1b26',
      surface: '#1c1d2a',
      surfaceAlt: '#1e202e',
      hover: '#232433',
      text: '#a9b1d6',
      textMuted: '#8589a8',        // derived slightly lighter — TN comment #787c99 = 4.29:1 on bg, fails 4.5:1
      accent: '#7aa2f7',
      accentStrong: '#6183bb',
      focus: '#7dcfff',
      border: '#2a2d40',
      borderStrong: '#363b54',
      danger: '#f7768e',
      energyLowBg: '#1a2018',
      energyLowAccent: '#9ece6a',
      energyLowText: '#c5e0b8',
      energyMediumBg: '#1a1d2e',
      energyMediumAccent: '#7aa2f7',
      energyMediumText: '#b3c6ea',
      energyHighBg: '#1e1b2e',
      energyHighAccent: '#bb9af7',
      energyHighText: '#d0bff0'
    }
  }
}
