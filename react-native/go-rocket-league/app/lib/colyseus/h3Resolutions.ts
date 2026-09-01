/**
 * Resoluções H3 — devem bater com `H3_RES_USER_CELL` / `H3_RES_ROOM_CELL` no backend.
 *
 * A sala (`h3RoomCell` no Colyseus) é **sempre** o parent da célula do usuário:
 * `cellToParent(latLngToCell(lat,lng,resUserCell), resRoomCell)`.
 */
export const resUserCell = 9;
export const resRoomCell = 8;
