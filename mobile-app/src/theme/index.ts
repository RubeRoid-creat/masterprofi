/**
 * Design System
 * Centralized theme configuration
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';
import { modernDesign } from './modernDesign';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  modernDesign,
};

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './modernDesign';

