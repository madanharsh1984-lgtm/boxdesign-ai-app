export const spacing = {
  base: 16,
  // Short aliases (used throughout screens)
  xs: 4,
  s:  8,
  m:  12,
  l:  20,
  xl: 24,
  xxl: 40,
  xxxl: 64,
  // Long aliases (same values, for compatibility)
  sm: 8,
  md: 12,
  lg: 20,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadow = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 8, elevation: 8 },
};
