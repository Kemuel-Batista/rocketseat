/**
 * Espelho do UserState do backend (Colyseus Schema).
 * Chave no state.users = sessionId (string).
 */
export type CellUserState = {
  id: string;
  username: string;
  avatarId: string;
  level: number;
  xp: number;
  fuel: number;
  lat: number;
  lng: number;
  h3UserCell: string;
};

export type CellFlagState = {
  lat: number;
  lng: number;
  isCaptured: boolean;
};

/** Entrada em `room.state.coins` (pickup na sala). */
export type CellCoinState = {
  id: string;
  lat: number;
  lng: number;
  value: number;
  h3SpawnCell: string;
  spawnedAt: number;
};

export type RoomCoinGrantedPayload = {
  coinId: string;
  value: number;
  balance: number;
  duplicate: boolean;
  roomCell: string;
};

export type CollectCoinRejectedPayload = {
  coinId: string;
  reason: string;
};

export type CoinCollectedPayload = {
  coinId: string;
  collectedByUserId: string;
  value: number;
};

export type FlagCapturedPayload = {
  h3RoomCell: string;
  capturedByUserId: string;
  ownerUserId: string;
};

export type FuelDepletedPayload = {
  fuel: number;
  maxFuel: number;
  refillInterval: number;
  lastRefillAt: number;
};

export type AdRewardGrantedPayload = {
  balance: number;
  amount: number;
  duplicate: boolean;
};

export type AdRewardRejectedReason =
  | 'no_user'
  | 'invalid_token'
  | 'rate_limited'
  | 'server_error';

export type AdRewardRejectedPayload = {
  reason: AdRewardRejectedReason | string;
};

/** `room.state.economy` (Colyseus) — ver FUEL_PURCHASE_MOBILE.md */
export type RoomFuelEconomy = {
  fuelPurchaseCoinsPerPercent: number;
  maxFuel: number;
};

export type FuelPurchaseGrantedPayload = {
  balance: number;
  fuel: number;
  maxFuel: number;
  coinsSpent: number;
  percentMissing?: number;
  /** % da capacidade comprado nesta transação; pode vir null em duplicate com metadata antiga */
  percentPurchased?: number | null;
  duplicate: boolean;
};

export type FuelPurchaseRejectedReason =
  | 'no_user'
  | 'invalid_idempotency'
  | 'invalid_percent'
  | 'already_full'
  | 'insufficient_coins'
  | 'user_not_found'
  | 'server_error';

export type FuelPurchaseRejectedPayload = {
  reason: FuelPurchaseRejectedReason | string;
};

/** Classe de série exibida no pack (backend). */
export type PackSerialClass = 'extreme' | 'elite' | 'standard';

/** Entrada em `room.state.cards` (pickup na sala). Ver CARD_SPAWN_COLYSEUS.md */
export type CellCardState = {
  id: string;
  cardId: number;
  lat: number;
  lng: number;
  name: string;
  ovr: number;
  url: string;
  serialNumber: number;
  serialMax: number;
  serialClass: PackSerialClass;
  h3RoomCell: string;
  spawnSource: string;
  spawnedAt: number;
};

/** Uma instância no evento `cardsPackGranted`. */
export type PackGrantedCard = {
  id: string;
  cardId: number;
  serialNumber: number;
  serialMax: number;
  serialClass: PackSerialClass;
  /** Quando o servidor enviar metadados extras. */
  name?: string;
  url?: string;
};

export type CardsPackType = 'initial' | 'daily' | 'map_pickup';

export type CardsPackGrantedPayload = {
  type: CardsPackType;
  count: number;
  cards: PackGrantedCard[];
};

export type RoomCardGrantedPayload = {
  cardInstanceId: string;
  userId: string;
  /** `collision` | `collectCard` — ver CARD_SPAWN_COLYSEUS.md */
  via?: string;
};

export type RoomCardCollectedPayload = {
  cardInstanceId: string;
  collectedByUserId: string;
};

export type CollectCardRejectedPayload = {
  cardInstanceId?: string;
  reason: string;
};

export type JoinCellOptions = {
  userId: string;
  username: string;
  avatarId: string;
  level: number;
  xp: number;
  fuel: number;
  lat: number;
  lng: number;
  /** Índice H3 na resolução do usuário (`H3_RES_USER_CELL`, ex. 9). */
  h3UserCell: string;
  /**
   * Índice H3 na resolução da sala (`H3_RES_ROOM_CELL`, ex. 8): **parent** de `h3UserCell`,
   * nunca a mesma res que `h3UserCell` (não reutilizar o hex fino como sala).
   */
  h3RoomCell: string;
};
