// Custom theme with JetBrains Mono font for Chakra UI v3

const customTheme = {
  fonts: {
    body: '"JetBrains Mono", monospace',
    heading: '"JetBrains Mono", monospace',
    mono: '"JetBrains Mono", monospace',
  },
  colors: {
    accent: {
      100: 'rgba(237, 84, 9, 0.1)',
      200: 'rgba(237, 84, 9, 0.2)',
      300: 'rgba(237, 84, 9, 0.3)',
      400: 'rgba(237, 84, 9, 0.4)',
      500: 'rgba(237, 84, 9, 0.5)',
      600: 'rgba(237, 84, 9, 0.6)',
      700: 'rgba(237, 84, 9, 0.7)',
      800: 'rgba(237, 84, 9, 0.8)',
      900: 'rgba(237, 84, 9, 0.9)',
      default: '#ED5409',
    },
    secondary: {
      100: 'rgba(255, 203, 103, 0.1)',
      200: 'rgba(255, 203, 103, 0.2)',
      300: 'rgba(255, 203, 103, 0.3)',
      400: 'rgba(255, 203, 103, 0.4)',
      500: 'rgba(255, 203, 103, 0.5)',
      600: 'rgba(255, 203, 103, 0.6)',
      700: 'rgba(255, 203, 103, 0.7)',
      800: 'rgba(255, 203, 103, 0.8)',
      900: 'rgba(255, 203, 103, 0.9)',
      default: '#FFCB67',
    },
    tertiary: {
      100: 'rgba(80, 97, 121, 0.1)',
      200: 'rgba(80, 97, 121, 0.2)',
      300: 'rgba(80, 97, 121, 0.3)',
      400: 'rgba(80, 97, 121, 0.4)',
      500: 'rgba(80, 97, 121, 0.5)',
      600: 'rgba(80, 97, 121, 0.6)',
      700: 'rgba(80, 97, 121, 0.7)',
      800: 'rgba(80, 97, 121, 0.8)',
      900: 'rgba(80, 97, 121, 0.9)',
      default: '#506179',
    },
    background: '#0A1B2E',
    foreground: '#FFFFFF',
  },
  styles: {
    global: {
      body: {
        bg: 'background',
        color: 'foreground',
        fontFamily: '"JetBrains Mono", monospace',
      },
    },
  },
};

export default customTheme; 