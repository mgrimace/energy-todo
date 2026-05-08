import type { ThemeDefinition } from './types'

export const gruvboxTheme: ThemeDefinition = {
  id: 'gruvbox',
  name: 'Gruvbox',
  palettes: {
    light: {
      bg: '#fbf1c7',
      surface: '#f2e5bc',
      surfaceAlt: '#ebdbb2',
      hover: '#ebdbb2',
      text: '#3c3836',
      textMuted: '#665c54',
      accent: '#458588',
      accentStrong: '#458588',     // neutral_blue — bright_blue #83a598 = 2.37:1, fails 3:1
      focus: '#427b58',            // faded_aqua — bright_aqua #8ec07c = 1.85:1, fails 3:1
      border: '#bdae93',
      borderStrong: '#a89984',
      danger: '#cc241d',
      energyLowBg: '#edf1d4',
      energyLowAccent: '#79740e',  // faded_green — neutral_green #98971a = 2.73:1, fails 3:1
      energyLowText: '#3c3836',
      energyMediumBg: '#dfe9e9',
      energyMediumAccent: '#458588',
      energyMediumText: '#3c3836',
      energyHighBg: '#eadce8',
      energyHighAccent: '#b16286',
      energyHighText: '#3c3836'
    },
    dark: {
      bg: '#282828',
      surface: '#32302f',
      surfaceAlt: '#3c3836',
      hover: '#504945',
      text: '#ebdbb2',
      textMuted: '#bdae93',
      accent: '#83a598',
      accentStrong: '#458588',
      focus: '#8ec07c',
      border: '#504945',
      borderStrong: '#665c54',
      danger: '#fb4934',
      energyLowBg: '#2f3a2f',
      energyLowAccent: '#b8bb26',
      energyLowText: '#ebdbb2',
      energyMediumBg: '#2d3d44',
      energyMediumAccent: '#83a598',
      energyMediumText: '#ebdbb2',
      energyHighBg: '#3a3342',
      energyHighAccent: '#d3869b',
      energyHighText: '#ebdbb2'
    }
  }
}