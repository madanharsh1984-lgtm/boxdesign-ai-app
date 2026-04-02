import { TextStyle } from 'react-native';

// Named scale exports (used by some screens as fontSize.xl, fontWeight.bold)
export const fontSize = {
  xs: 11, sm: 13, md: 15, lg: 18, xl: 22, xxl: 28, hero: 34,
};
export const fontWeight = {
  regular: '400' as const,
  medium:  '500' as const,
  semiBold:'600' as const,
  bold:    '700' as const,
  black:   '900' as const,
};

// Named style presets
export const typography: { [key: string]: TextStyle } = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 22, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: '700' },
  h4: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 15 },
  caption: { fontSize: 13 },
  small: { fontSize: 11 },
  tiny: { fontSize: 9 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
};
