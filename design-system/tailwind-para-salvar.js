/**
 * Para Salvar A Cuba - Tailwind CSS Configuration Extension
 *
 * Usage: Merge this into your tailwind.config.js or use as a separate theme config
 *
 * Example:
 * const paraSalvarTheme = require('./design-system/tailwind-para-salvar.js');
 * module.exports = {
 *   ...yourConfig,
 *   theme: {
 *     extend: paraSalvarTheme.extend,
 *   },
 *   plugins: [...yourPlugins, ...paraSalvarTheme.plugins],
 * };
 */

module.exports = {
  extend: {
    colors: {
      // Primary Teal - Trust, Unity, Democracy
      primary: {
        DEFAULT: '#006565',
        50: '#f0fffe',
        100: '#e0fffd',
        200: '#b3fff9',
        300: '#76f2f2',
        400: '#00e5e5',
        500: '#00bcd4', // Light teal
        600: '#008899',
        700: '#006565', // Main teal
        800: '#004d4d',
        900: '#003333',
        container: '#008080',
        onColor: '#ffffff',
        onContainer: '#e3fffe',
        fixed: '#93f2f2',
        fixedDim: '#76d6d5',
      },

      // Secondary Coral - Energy, Action, Urgency
      secondary: {
        DEFAULT: '#fe7e4f',
        50: '#ffe8d9',
        100: '#ffd6c2',
        200: '#ffb59c',
        300: '#ff9570',
        400: '#ff7f50', // Lighter coral
        500: '#ff6b35', // Medium coral
        600: '#ff7e4f', // Vibrant coral (main button)
        700: '#c94b1f',
        800: '#a43c12', // Darker coral (hover/container)
        900: '#4a1a07',
        container: '#a43c12',
        onColor: '#ffffff',
        onContainer: '#ffffff',
        fixed: '#ffdbcf',
        fixedDim: '#ffb59c',
      },

      // Tertiary Navy - Wisdom, Sophistication
      tertiary: {
        DEFAULT: '#495b70',
        50: '#f7f9ff',
        100: '#e0e9f5',
        200: '#c2d4eb',
        300: '#a3bfe1',
        400: '#7a9fd2',
        500: '#6b7fa3',
        600: '#495b70', // Main navy
        700: '#3d4a5e',
        800: '#2e3647',
        900: '#1f2330',
        container: '#627489',
        onColor: '#ffffff',
        onContainer: '#f7f9ff',
        fixed: '#d1e4fc',
        fixedDim: '#b5c8e0',
      },

      // Surface Colors - Layered UI
      surface: {
        DEFAULT: '#f6faf9',
        dim: '#d7dbda',
        bright: '#f6faf9',
        containerLowest: '#ffffff',
        containerLow: '#f0f4f3',
        container: '#ebefee',
        containerHigh: '#e5e9e8',
        containerHighest: '#dfe3e2',
        variant: '#dfe3e2',
        onColor: '#181c1c',
        onColorVariant: '#3e4949',
        tint: '#006a6a',
      },

      // Outline Colors
      outline: {
        DEFAULT: '#6e7979',
        variant: '#bdc9c8',
      },

      // Semantic Colors
      background: '#f6faf9',
      onBackground: '#181c1c',
      error: '#ba1a1a',
      errorContainer: '#ffdad6',
      onError: '#ffffff',
      onErrorContainer: '#93000a',
      success: '#4caf50',
      warning: '#ff9800',
      info: '#2196f3',
    },

    fontFamily: {
      display: ['Manrope', 'sans-serif'],
      headline: ['Manrope', 'sans-serif'],
      body: ['Inter', 'sans-serif'],
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      serif: ['Georgia', 'serif'],
    },

    fontSize: {
      // Display
      'display-lg': ['3.5rem', { lineHeight: '1.2', fontWeight: '700', fontFamily: 'Manrope' }],
      'display-md': ['2.75rem', { lineHeight: '1.2', fontWeight: '700', fontFamily: 'Manrope' }],
      'display-sm': ['2.25rem', { lineHeight: '1.2', fontWeight: '700', fontFamily: 'Manrope' }],

      // Headline
      'headline-lg': ['2rem', { lineHeight: '1.3', fontWeight: '700', fontFamily: 'Manrope' }],
      'headline-md': ['1.75rem', { lineHeight: '1.3', fontWeight: '600', fontFamily: 'Manrope' }],
      'headline-sm': ['1.5rem', { lineHeight: '1.3', fontWeight: '600', fontFamily: 'Manrope' }],

      // Title
      'title-lg': ['1.375rem', { lineHeight: '1.4', fontWeight: '600', fontFamily: 'Manrope' }],
      'title-md': ['1.25rem', { lineHeight: '1.4', fontWeight: '500', fontFamily: 'Manrope' }],
      'title-sm': ['1.125rem', { lineHeight: '1.4', fontWeight: '500', fontFamily: 'Manrope' }],

      // Body
      'body-lg': ['1rem', { lineHeight: '1.5', fontWeight: '400', fontFamily: 'Inter' }],
      'body-md': ['0.875rem', { lineHeight: '1.5', fontWeight: '400', fontFamily: 'Inter' }],
      'body-sm': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400', fontFamily: 'Inter' }],

      // Label
      'label-lg': ['0.875rem', { lineHeight: '1.4', fontWeight: '600', fontFamily: 'Inter' }],
      'label-md': ['0.75rem', { lineHeight: '1.4', fontWeight: '500', fontFamily: 'Inter' }],
      'label-sm': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500', fontFamily: 'Inter' }],

      // Default overrides
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },

    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },

    spacing: {
      0: '0',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem',
    },

    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '4px',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '2.5rem',
      full: '9999px',
    },

    boxShadow: {
      none: '0 0 transparent',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

      // Para Salvar Custom Shadows
      'para-sm': '0 1px 2px rgb(0 0 0 / 0.05)',
      'para-md': '0 4px 6px rgb(0 0 0 / 0.07)',
      'para-lg': '0 10px 15px rgb(0 0 0 / 0.1)',
      'para-xl': '0 20px 25px rgb(0 0 0 / 0.12)',
      'para-2xl': '0 25px 50px rgb(0 0 0 / 0.15)',

      // Elevation shadows for floating elements
      'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.06)',
      'elevation-2': '0 4px 6px rgba(0, 0, 0, 0.07)',
      'elevation-3': '0 10px 15px rgba(0, 0, 0, 0.1)',
      'elevation-4': '0 15px 25px rgba(0, 0, 0, 0.12)',
      'elevation-5': '0 25px 50px rgba(0, 0, 0, 0.15)',

      // CTA shadows
      'cta-primary': '0 15px 30px rgba(0, 101, 101, 0.15)',
      'cta-primary-hover': '0 20px 40px rgba(0, 101, 101, 0.25)',

      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    },

    transitionDuration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },

    transitionTimingFunction: {
      para: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },

    backdropBlur: {
      sm: '4px',
      md: '12px',
      lg: '20px',
    },

    animation: {
      fadeIn: 'fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      slideUp: 'slideUp 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      slideDown: 'slideDown 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    },

    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { opacity: '0', transform: 'translateY(10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      slideDown: {
        '0%': { opacity: '0', transform: 'translateY(-10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
    },
  },

  // Plugins for custom utilities
  plugins: [
    // Glass morphism plugin
    function ({ addUtilities }) {
      addUtilities({
        '.glass': {
          background: 'rgba(246, 250, 249, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(189, 201, 200, 0.2)',
        },
        '.glass-md': {
          background: 'rgba(246, 250, 249, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(189, 201, 200, 0.2)',
        },
        '.glass-lg': {
          background: 'rgba(246, 250, 249, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(189, 201, 200, 0.3)',
        },

        // Gradient utilities
        '.gradient-primary': {
          background: 'linear-gradient(135deg, #006565, #008080)',
        },
        '.gradient-secondary': {
          background: 'linear-gradient(135deg, #a43c12, #ff7f50)',
        },
        '.gradient-hero': {
          background: 'linear-gradient(135deg, #f6faf9, #ebe9e8)',
        },

        // Button utilities
        '.btn-base': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '1rem',
          fontWeight: '600',
          fontSize: '0.875rem',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          border: 'none',
          cursor: 'pointer',
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        },
        '.btn-primary': {
          '@apply btn-base': {},
          background: 'linear-gradient(135deg, #006565, #008080)',
          color: '#ffffff',
          padding: '1rem 2rem',
          boxShadow: '0 15px 30px rgba(0, 101, 101, 0.15)',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(0, 101, 101, 0.25)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        '.btn-secondary': {
          '@apply btn-base': {},
          backgroundColor: '#a43c12',
          color: '#ffffff',
          padding: '1rem 2rem',
          '&:hover': {
            backgroundColor: '#925d39',
          },
        },
        '.btn-tertiary': {
          '@apply btn-base': {},
          backgroundColor: 'transparent',
          color: '#006565',
          border: '1px solid #bdc9c8',
          padding: '0.75rem 1.5rem',
          '&:hover': {
            backgroundColor: '#f0f4f3',
          },
        },

        // Card utilities
        '.card': {
          backgroundColor: '#ffffff',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
        },

        // Text utilities
        '.text-display-lg': {
          fontSize: '3.5rem',
          lineHeight: '1.2',
          fontWeight: '700',
          fontFamily: 'Manrope',
        },
        '.text-display-md': {
          fontSize: '2.75rem',
          lineHeight: '1.2',
          fontWeight: '700',
          fontFamily: 'Manrope',
        },
        '.text-headline-lg': {
          fontSize: '2rem',
          lineHeight: '1.3',
          fontWeight: '700',
          fontFamily: 'Manrope',
        },
        '.text-headline-md': {
          fontSize: '1.75rem',
          lineHeight: '1.3',
          fontWeight: '600',
          fontFamily: 'Manrope',
        },
      });
    },
  ],
};
