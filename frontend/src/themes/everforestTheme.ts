import type { ThemeDefinition } from './types'

export const everforestTheme: ThemeDefinition = {
  id: 'everforest',
  name: 'Everforest',
  palettes: {
    light: {
      bg: '#FDF6E3',
      surface: '#F4F0D9',
      surfaceAlt: '#EFEBD4',
      hover: '#E6E2CC',
      text: '#5C6A72',
      textMuted: '#5C6A72',        // fg — grey0/grey1 (#7A8478/#829181) fail 4.5:1 on all surfaces; only fg passes
      accent: '#3A94C5',
      accentStrong: '#2a8d66',     // derived darker green — aqua #35A77C = 2.79:1, fails 3:1
      focus: '#3A94C5',
      border: '#BDC3AF',
      borderStrong: '#A6B0A0',
      danger: '#F85552',
      energyLowBg: '#F0F1D2',
      energyLowAccent: '#6e7e00',  // derived darker yellow-green — #8DA101 = 2.69:1, fails 3:1
      energyLowText: '#5C6A72',
      energyMediumBg: '#E9F0E9',
      energyMediumAccent: '#3285b5', // derived darker blue — #3A94C5 = 2.91:1 on energyMediumBg, fails 3:1
      energyMediumText: '#5C6A72',
      energyHighBg: '#FAE8E2',
      energyHighAccent: '#c84fa3',   // derived darker pink — #DF69BA = 2.83:1, fails 3:1
      energyHighText: '#5C6A72'
    },
    dark: {
      bg: '#2D353B',
      surface: '#343F44',
      surfaceAlt: '#3D484D',
      hover: '#475258',
      text: '#D3C6AA',
      textMuted: '#b2beb5',        // derived slightly lighter — grey2 #9DA9A0 = 4.44:1 on surface, 3.86:1 on surfaceAlt; needed lightening
      accent: '#7FBBB3',
      accentStrong: '#83C092',
      focus: '#7FBBB3',
      border: '#4F585E',
      borderStrong: '#56635F',
      danger: '#E67E80',
      energyLowBg: '#425047',
      energyLowAccent: '#A7C080',
      energyLowText: '#D3C6AA',
      energyMediumBg: '#3A515D',
      energyMediumAccent: '#7FBBB3',
      energyMediumText: '#D3C6AA',
      energyHighBg: '#4A444E',
      energyHighAccent: '#D699B6',
      energyHighText: '#D3C6AA'
    }
  }
}
