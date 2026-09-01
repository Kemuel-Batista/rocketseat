/**
 * Overlay otimizado para renderizar células H3 ao redor da célula central.
 * Muito mais leve que polygonToCells + bbox.
 */

import '@/polyfills/text-decoder-utf16le';
import { cellToBoundary, latLngToCell, gridDisk } from 'h3-js';
import { useMemo } from 'react';
import { Polygon } from 'react-native-maps';

import { resRoomCell } from '@/lib/colyseus/h3Resolutions';

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type Props = {
  region: MapRegion;
  currentCellH3RoomCell?: string | null;
  explorerZoomThresholdDelta: number; // delta equivalente ao zoom 16
};

const boundaryCache = new Map<
  string,
  { latitude: number; longitude: number }[]
>();

function getHexCoordinates(h3Index: string) {
  if (boundaryCache.has(h3Index)) {
    return boundaryCache.get(h3Index)!;
  }

  const boundary = cellToBoundary(h3Index, true); // geoJson format
  const coords = boundary.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));

  boundaryCache.set(h3Index, coords);
  return coords;
}

export function MapH3CellsOverlay({
  region,
  currentCellH3RoomCell,
  explorerZoomThresholdDelta,
}: Props) {
  const isExplorerMode =
    region.latitudeDelta <= explorerZoomThresholdDelta;

  const polygons = useMemo(() => {
    if (!isExplorerMode) return [];

    try {
      // 1️⃣ pega célula central
      const centerCell = latLngToCell(
        region.latitude,
        region.longitude,
        resRoomCell
      );

      // 2️⃣ gera cluster fixo (raio 3 ~ 37 células)
      const cells = gridDisk(centerCell, 3);

      // 3️⃣ monta polígonos
      return cells.map((h3Index) => ({
        key: h3Index,
        coordinates: getHexCoordinates(h3Index),
        isCurrent:
          currentCellH3RoomCell != null &&
          currentCellH3RoomCell === h3Index,
      }));
    } catch {
      return [];
    }
  }, [
    region.latitude,
    region.longitude,
    isExplorerMode,
    currentCellH3RoomCell,
  ]);

  if (!isExplorerMode) return null;

  return (
    <>
      {polygons.map(({ key, coordinates, isCurrent }) => (
        <Polygon
          key={key}
          coordinates={coordinates}
          fillColor={
            isCurrent
              ? 'rgba(34, 197, 94, 0.25)'
              : 'rgba(6, 182, 212, 0.12)'
          }
          strokeColor={
            isCurrent
              ? 'rgba(34, 197, 94, 0.8)'
              : 'rgba(6, 182, 212, 0.4)'
          }
          strokeWidth={isCurrent ? 2 : 1}
          zIndex={-1}
        />
      ))}
    </>
  );
}