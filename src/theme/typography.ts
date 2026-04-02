import { TextStyle } from 'react-native';

export const typography: { [key: string]: TextStyle } = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 15,
  },
  caption: {
    fontSize: 13,
  },
  small: {
    fontSize: 11,
  },
  tiny: {
    fontSize: 9,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
};
