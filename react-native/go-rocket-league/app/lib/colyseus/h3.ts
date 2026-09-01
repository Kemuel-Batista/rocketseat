import '@/polyfills/text-decoder-utf16le';
import { latLngToCell, cellToParent } from 'h3-js';

import { resRoomCell, resUserCell } from './h3Resolutions';

/** Área aproximada de uma célula na resolução da sala (ex.: resRoomCell 8 ≈ 0,74 km²). */
export const roomCellApproxKm2 = 0.74;

/**
 * Célula H3 do jogador em **resUserCell** (ex. 9), a partir de lat/lng.
 * Usada em `h3UserCell` no join e em `updatePosition`.
 */
export function getUserCell(lat: number, lng: number): string {
  return latLngToCell(lat, lng, resUserCell);
}

/**
 * `h3RoomCell` no join: **parent** da célula do usuário em **resRoomCell** (ex. 8).
 * O argumento deve ser o índice retornado por {@link getUserCell} (mesma res que o backend
 * chama de `H3_RES_USER_CELL`). Não passe `latLngToCell(..., resRoomCell)` aqui.
 */
export function getRoomCell(h3UserCellAtUserRes: string): string {
  return cellToParent(h3UserCellAtUserRes, resRoomCell);
}

/**
 * Sala Colyseus (`h3RoomCell`) a partir de coordenadas: sempre **parent** da célula fina
 * do jogador. Equivalente a `getRoomCell(getUserCell(lat, lng))`.
 *
 * **Não** usar `latLngToCell(lat, lng, resRoomCell)` para o matchmaking: o servidor espera
 * o parent da célula em `resUserCell`, alinhado a `filterBy(["h3RoomCell"])` (flag, coins, etc.).
 */
export function getRoomCellFromLatLng(lat: number, lng: number): string {
  return getRoomCell(getUserCell(lat, lng));
}

/**
 * Nome da sala: `cell:${getRoomCellFromLatLng(lat, lng)}`.
 */
export function getRoomName(lat: number, lng: number): string {
  return `cell:${getRoomCellFromLatLng(lat, lng)}`;
}
