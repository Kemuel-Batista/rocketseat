/**
 * Theme exports.
 * Central place for palette, colors, map styles, and future theme tokens.
 * App uses dark theme only.
 */

export { palette, colors } from './colors';
export {
  customMapStyle,
  defaultMapRegion,
  EXPLORER_ZOOM_THRESHOLD,
  getZoomFromRegion,
} from './MapStyles';
