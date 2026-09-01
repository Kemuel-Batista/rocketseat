/**
 * Custom map style configuration for react-native-maps (Google provider).
 * Uses map colors from theme (colors.mapLand, mapWater, mapRoad, mapLandStroke).
 */

import type { MapStyleElement } from 'react-native-maps';

import { colors } from './colors';

const mapColors = {
  land: colors.mapLand,
  landStroke: colors.mapLandStroke,
  water: colors.mapWater,
  road: colors.mapRoad,
  roadLabel: colors.primary,
  admin: colors.mapLandStroke,
  transit: colors.mapRoad,
  labelText: colors.mapLandStroke,
  labelStroke: colors.mapLandStroke,
};

/**
 * Custom style array for Google Maps (customMapStyle prop).
 * Monochromatic grayscale, vintage-style map (light paper, light oceans, medium gray land).
 */
export const customMapStyle: MapStyleElement[] = [
  // Base: all geometry desaturated dark
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: mapColors.land }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.labelText }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: mapColors.labelStroke }, { visibility: 'on' }],
  },
  // Water
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: mapColors.water }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.labelText }],
  },
  // Landscape / natural
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: mapColors.land }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: mapColors.land }],
  },
  // Roads
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: mapColors.road }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.roadLabel }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: mapColors.road }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: mapColors.road }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: mapColors.road }],
  },
  // POI — hidden (no points of interest)
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  // Administrative
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: mapColors.admin }],
  },
  // Hide country, city, neighborhood names
  {
    featureType: 'administrative.country',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  // Transit
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: mapColors.transit }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.labelText }],
  },
  // Hide bus stops
  {
    featureType: 'transit.station.bus',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
];

/** Default region for the map (Belo Horizonte, zoom ~18–19). */
export const defaultMapRegion = {
  latitude: -19.9167,
  longitude: -43.9345,
  latitudeDelta: 0.002,
  longitudeDelta: 0.002,
} as const;

/** Zoom mínimo para ativar o modo explorador (cartas, jogadores, eventos). Ex.: 18 ou 19. */
export const EXPLORER_ZOOM_THRESHOLD = 16;

/** Calcula o nível de zoom aproximado a partir da região do mapa (longitudeDelta). */
export function getZoomFromRegion(longitudeDelta: number): number {
  if (longitudeDelta <= 0) return 21;
  return Math.round(Math.log(360 / longitudeDelta) / Math.LN2);
}
