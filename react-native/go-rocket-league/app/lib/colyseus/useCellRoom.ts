import { Client } from '@colyseus/sdk';
import { useCallback, useRef, useState } from 'react';

import { colyseusConfig } from '@/lib/colyseus/config';
import { getRoomCellFromLatLng, getRoomName, getUserCell } from '@/lib/colyseus/h3';
import { DEFAULT_FUEL_PURCHASE_COINS_PER_PERCENT } from '@/lib/fuelPurchase';
import type {
  AdRewardGrantedPayload,
  AdRewardRejectedPayload,
  CardsPackGrantedPayload,
  CellCardState,
  CellCoinState,
  CellFlagState,
  CellUserState,
  CollectCardRejectedPayload,
  CoinCollectedPayload,
  CollectCoinRejectedPayload,
  FuelDepletedPayload,
  FlagCapturedPayload,
  FuelPurchaseGrantedPayload,
  FuelPurchaseRejectedPayload,
  JoinCellOptions,
  PackGrantedCard,
  PackSerialClass,
  RoomCardCollectedPayload,
  RoomCardGrantedPayload,
  RoomCoinGrantedPayload,
  RoomFuelEconomy,
} from '@/lib/colyseus/types';
import { useUserStore } from '@/store/userStore';

export type ChangeRoomDebug = {
  newRoom: string;
  at: number;
};

export type CellRoomState = {
  connected: boolean;
  error: string | null;
  otherUsers: Map<string, CellUserState>;
  flag: CellFlagState | null;
  coins: Map<string, CellCoinState>;
  /** Pickups de carta na célula (`state.cards`). */
  cards: Map<string, CellCardState>;
  lastFlagCaptured: FlagCapturedPayload | null;
  lastRoomCoinGranted: RoomCoinGrantedPayload | null;
  lastCollectCoinRejected: CollectCoinRejectedPayload | null;
  lastAdRewardGranted: AdRewardGrantedPayload | null;
  lastAdRewardRejected: AdRewardRejectedPayload | null;
  lastFuelPurchaseGranted: FuelPurchaseGrantedPayload | null;
  lastFuelPurchaseRejected: FuelPurchaseRejectedPayload | null;
  sessionId: string | null;
  roomName: string | null;
  lastChangeRoom: ChangeRoomDebug | null;
  /** Economia da zona (`state.economy`) ou derivada do self + default. */
  fuelEconomy: RoomFuelEconomy | null;
  /** Fila de packs (first/daily); o modal consome e chama `ackCardsPackFeedback`. */
  cardsPackPending: CardsPackGrantedPayload | null;
};

function buildJoinOptions(
  userId: string,
  username: string,
  avatarId: string,
  level: number,
  xp: number,
  fuel: number,
  lat: number,
  lng: number
): JoinCellOptions {
  const h3UserCell = getUserCell(lat, lng);
  const h3RoomCell = getRoomCellFromLatLng(lat, lng);
  return {
    userId,
    username,
    avatarId: String(avatarId ?? '1'),
    level,
    xp,
    fuel,
    lat,
    lng,
    h3UserCell,
    h3RoomCell,
  };
}

function getStateUsersEntries(raw: unknown): [string, Record<string, unknown>][] {
  if (!raw || typeof raw !== 'object') return [];
  const mapLike = raw as {
    entries?: () => IterableIterator<[string, unknown]>;
    forEach?: (cb: (v: unknown, k: string) => void) => void;
  };

  if (typeof mapLike.entries === 'function') {
    try {
      return Array.from(mapLike.entries()).map(([k, v]) => [String(k), (v ?? {}) as Record<string, unknown>]);
    } catch {}
  }

  if (raw instanceof Map) {
    return Array.from((raw as Map<string, unknown>).entries()).map(([k, v]) => [String(k), (v ?? {}) as Record<string, unknown>]);
  }

  if (typeof mapLike.forEach === 'function') {
    const entries: [string, Record<string, unknown>][] = [];
    mapLike.forEach((v, k) => entries.push([String(k), (v ?? {}) as Record<string, unknown>]));
    return entries;
  }

  return Object.entries(raw).map(([k, v]) => [k, (v ?? {}) as Record<string, unknown>]);
}

function normalizeSerialClass(raw: unknown): PackSerialClass {
  if (raw === 'extreme' || raw === 'elite' || raw === 'standard') return raw;
  return 'standard';
}

function cellCardStateToPackGranted(c: CellCardState): PackGrantedCard {
  const serialMax = Number.isFinite(c.serialMax) && c.serialMax > 0 ? Math.floor(c.serialMax) : 1;
  return {
    id: c.id,
    cardId: c.cardId,
    serialNumber: Number.isFinite(c.serialNumber) ? Math.max(0, Math.floor(c.serialNumber)) : 0,
    serialMax,
    serialClass: normalizeSerialClass(c.serialClass),
    ...(c.name ? { name: c.name } : {}),
    ...(c.url ? { url: c.url } : {}),
  };
}

function parsePackCardRow(row: unknown): PackGrantedCard | null {
  if (!row || typeof row !== 'object') return null;
  const o = row as Record<string, unknown>;
  const id = String(o.id ?? '');
  const cardId = Number(o.cardId);
  const serialNumber = Number(o.serialNumber);
  const serialMax = Number(o.serialMax);
  if (!id || !Number.isFinite(cardId)) return null;
  return {
    id,
    cardId,
    serialNumber: Number.isFinite(serialNumber) ? Math.max(0, Math.floor(serialNumber)) : 0,
    serialMax: Number.isFinite(serialMax) ? Math.max(1, Math.floor(serialMax)) : 1,
    serialClass: normalizeSerialClass(o.serialClass),
    ...(typeof o.name === 'string' && o.name ? { name: o.name } : {}),
    ...(typeof o.url === 'string' && o.url ? { url: o.url } : {}),
  };
}

function parseCardsPackGrantedPayload(raw: unknown): CardsPackGrantedPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const type = o.type === 'initial' || o.type === 'daily' ? o.type : null;
  if (!type) return null;
  const cardsRaw = o.cards;
  if (!Array.isArray(cardsRaw)) return null;
  const cards: PackGrantedCard[] = [];
  for (const c of cardsRaw) {
    const parsed = parsePackCardRow(c);
    if (parsed) cards.push(parsed);
  }
  if (cards.length === 0) return null;
  const count = Number(o.count);
  return {
    type,
    count: Number.isFinite(count) ? count : cards.length,
    cards,
  };
}

function randomFuelPurchaseKey(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Snapshot do `room.state` (Schema Colyseus) para log. */
function snapshotRoomStateForLog(state: unknown): unknown {
  if (
    state &&
    typeof state === 'object' &&
    typeof (state as { toJSON?: () => unknown }).toJSON === 'function'
  ) {
    try {
      return (state as { toJSON: () => unknown }).toJSON();
    } catch {
      return '[room.state: toJSON error]';
    }
  }
  return state;
}

function logRoomUpdatePosition(
  room: { state: unknown },
  payload: { lat: number; lng: number; fuel: number; deltaKm: number; h3UserCell: string }
) {
  // eslint-disable-next-line no-console
  console.log('[room:updatePosition]', {
    payload,
    state: snapshotRoomStateForLog(room.state),
  });
}

function usersFromState(state: unknown, selfSessionId: string): Map<string, CellUserState> {
  const users = new Map<string, CellUserState>();
  const raw = state && typeof state === 'object' && (state as { users?: unknown }).users;
  const entries = getStateUsersEntries(raw);

  for (const [sessionId, user] of entries) {
    if (sessionId === selfSessionId) continue;
    const u = user as Record<string, unknown>;
    const lat = Number(u?.lat ?? u?.['lat']);
    const lng = Number(u?.lng ?? u?.['lng']);
    users.set(sessionId, {
      id: String(u?.id ?? u?.['id'] ?? ''),
      username: String(u?.username ?? u?.['username'] ?? ''),
      avatarId: String(u?.avatarId ?? u?.['avatarId'] ?? ''),
      level: Number(u?.level ?? 0),
      xp: Number(u?.xp ?? 0),
      fuel: Number(u?.fuel ?? 0),
      lat: Number.isFinite(lat) ? lat : 0,
      lng: Number.isFinite(lng) ? lng : 0,
      h3UserCell: String(u?.h3UserCell ?? u?.['h3UserCell'] ?? ''),
    });
  }

  return users;
}

function getSelfFromState(
  state: unknown,
  sessionId: string
): {
  fuel: number;
  xp: number;
  level: number;
  flagsOwned: number;
  ownedAreaKm2: number;
  maxFuel: number;
  refillInterval: number;
  lastRefillAt: number;
  lastFuelUpdateAt: number;
  refillActive: boolean;
  refillGranted: number;
} | null {
  const raw = state && typeof state === 'object' && (state as { users?: unknown }).users;
  const entries = getStateUsersEntries(raw);
  const self = entries.find(([sid]) => sid === sessionId)?.[1] as Record<string, unknown> | undefined;
  if (!self) return null;

  const fuel = Number(self?.fuel ?? self?.['fuel']);
  const xp = Number(self?.xp ?? self?.['xp']);
  const level = Number(self?.level ?? self?.['level']);
  const flagsOwned = Number(self?.flagsOwned ?? self?.['flagsOwned']);
  const ownedAreaKm2 = Number(self?.ownedAreaKm2 ?? self?.['ownedAreaKm2']);
  const maxFuel = Number(self?.maxFuel ?? self?.['maxFuel']);
  const refillInterval = Number(self?.refillInterval ?? self?.['refillInterval']);
  const lastRefillAt = Number(self?.lastRefillAt ?? self?.['lastRefillAt']);
  const lastFuelUpdateAt = Number(self?.lastFuelUpdateAt ?? self?.['lastFuelUpdateAt']);
  const refillActive = Boolean(self?.refillActive ?? self?.['refillActive']);
  const refillGranted = Number(self?.refillGranted ?? self?.['refillGranted']);
  if (!Number.isFinite(fuel)) return null;

  return {
    fuel,
    xp: Number.isFinite(xp) ? xp : 0,
    level: Number.isFinite(level) ? level : 1,
    flagsOwned: Number.isFinite(flagsOwned) ? flagsOwned : 0,
    ownedAreaKm2: Number.isFinite(ownedAreaKm2) ? ownedAreaKm2 : 0,
    maxFuel: Number.isFinite(maxFuel) ? maxFuel : 100,
    refillInterval: Number.isFinite(refillInterval) ? refillInterval : 300000,
    lastRefillAt: Number.isFinite(lastRefillAt) ? lastRefillAt : 0,
    lastFuelUpdateAt: Number.isFinite(lastFuelUpdateAt) ? lastFuelUpdateAt : Date.now(),
    refillActive,
    refillGranted: Number.isFinite(refillGranted) ? refillGranted : 0,
  };
}

function getFlagFromState(state: unknown): CellFlagState | null {
  const raw = state && typeof state === 'object' && (state as { flag?: unknown }).flag;
  if (!raw || typeof raw !== 'object') return null;

  const flag = raw as Record<string, unknown>;
  const lat = Number(flag?.lat ?? flag?.['lat']);
  const lng = Number(flag?.lng ?? flag?.['lng']);
  const isCaptured = Boolean(flag?.isCaptured ?? flag?.['isCaptured']);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng, isCaptured };
}

function getCoinsFromState(state: unknown): Map<string, CellCoinState> {
  const coins = new Map<string, CellCoinState>();
  const raw = state && typeof state === 'object' && (state as { coins?: unknown }).coins;
  const entries = getStateUsersEntries(raw);

  for (const [coinId, row] of entries) {
    const c = row as Record<string, unknown>;
    const lat = Number(c?.lat ?? c?.['lat']);
    const lng = Number(c?.lng ?? c?.['lng']);
    const value = Number(c?.value ?? c?.['value']);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const id = String(c?.id ?? c?.['id'] ?? coinId);
    coins.set(id, {
      id,
      lat,
      lng,
      value: Number.isFinite(value) ? value : 1,
      h3SpawnCell: String(c?.h3SpawnCell ?? c?.['h3SpawnCell'] ?? ''),
      spawnedAt: Number(c?.spawnedAt ?? c?.['spawnedAt'] ?? 0),
    });
  }

  return coins;
}

function getCardsFromState(state: unknown): Map<string, CellCardState> {
  const cards = new Map<string, CellCardState>();
  const raw = state && typeof state === 'object' && (state as { cards?: unknown }).cards;
  const entries = getStateUsersEntries(raw);

  for (const [key, row] of entries) {
    const c = row as Record<string, unknown>;
    const lat = Number(c?.lat ?? c?.['lat']);
    const lng = Number(c?.lng ?? c?.['lng']);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const id = String(c?.id ?? c?.['id'] ?? key);
    const cardId = Number(c?.cardId ?? c?.['cardId']);
    if (!id || !Number.isFinite(cardId)) continue;
    cards.set(id, {
      id,
      cardId,
      lat,
      lng,
      name: String(c?.name ?? c?.['name'] ?? ''),
      ovr: Number.isFinite(Number(c?.ovr ?? c?.['ovr'])) ? Number(c?.ovr ?? c?.['ovr']) : 0,
      url: String(c?.url ?? c?.['url'] ?? ''),
      serialNumber: Number.isFinite(Number(c?.serialNumber)) ? Number(c?.serialNumber) : 0,
      serialMax: Number.isFinite(Number(c?.serialMax)) ? Number(c?.serialMax) : 0,
      serialClass: normalizeSerialClass(c?.serialClass ?? c?.['serialClass']),
      h3RoomCell: String(c?.h3RoomCell ?? c?.['h3RoomCell'] ?? ''),
      spawnSource: String(c?.spawnSource ?? c?.['spawnSource'] ?? ''),
      spawnedAt: Number.isFinite(Number(c?.spawnedAt)) ? Number(c?.spawnedAt) : 0,
    });
  }

  return cards;
}

function getFuelEconomyFromState(state: unknown): Partial<RoomFuelEconomy> | null {
  if (!state || typeof state !== 'object') return null;
  const economy = (state as { economy?: unknown }).economy;
  if (!economy || typeof economy !== 'object') return null;
  const e = economy as Record<string, unknown>;
  const cpp = Number(e.fuelPurchaseCoinsPerPercent ?? e['fuelPurchaseCoinsPerPercent']);
  const mf = Number(e.maxFuel ?? e['maxFuel']);
  const out: Partial<RoomFuelEconomy> = {};
  if (Number.isFinite(cpp) && cpp > 0) {
    out.fuelPurchaseCoinsPerPercent = cpp;
  }
  if (Number.isFinite(mf) && mf > 0) {
    out.maxFuel = mf;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function resolveFuelEconomy(
  fromState: Partial<RoomFuelEconomy> | null,
  selfMaxFuel: number | null
): RoomFuelEconomy | null {
  const hasRoomEconomy =
    fromState != null &&
    ((fromState.fuelPurchaseCoinsPerPercent != null && fromState.fuelPurchaseCoinsPerPercent > 0) ||
      (fromState.maxFuel != null && fromState.maxFuel > 0));

  if (!hasRoomEconomy && (selfMaxFuel == null || selfMaxFuel <= 0)) {
    return null;
  }

  const cpp =
    fromState?.fuelPurchaseCoinsPerPercent != null && fromState.fuelPurchaseCoinsPerPercent > 0
      ? fromState.fuelPurchaseCoinsPerPercent
      : DEFAULT_FUEL_PURCHASE_COINS_PER_PERCENT;
  const mf =
    fromState?.maxFuel != null && fromState.maxFuel > 0
      ? fromState.maxFuel
      : selfMaxFuel != null && selfMaxFuel > 0
        ? selfMaxFuel
        : 100;

  return { fuelPurchaseCoinsPerPercent: cpp, maxFuel: mf };
}

export function useCellRoom(
  lat: number,
  lng: number,
  user: {
    userId: number | null;
    username: string | null;
    avatarId: number | null;
    level: number;
    xp: number;
    fuel: number;
  }
) {
  const [state, setState] = useState<CellRoomState>({
    connected: false,
    error: null,
    otherUsers: new Map(),
    flag: null,
    coins: new Map(),
    cards: new Map(),
    lastFlagCaptured: null,
    lastRoomCoinGranted: null,
    lastCollectCoinRejected: null,
    lastAdRewardGranted: null,
    lastAdRewardRejected: null,
    lastFuelPurchaseGranted: null,
    lastFuelPurchaseRejected: null,
    sessionId: null,
    roomName: null,
    lastChangeRoom: null,
    fuelEconomy: null,
    cardsPackPending: null,
  });

  const roomRef = useRef<Awaited<ReturnType<Client['joinOrCreate']>> | null>(null);
  const cardsPackQueueRef = useRef<CardsPackGrantedPayload[]>([]);
  const clientRef = useRef<Client | null>(null);
  const lastLatLngRef = useRef({ lat, lng });
  const currentRoomCellRef = useRef<string | null>(null);

  // evita corrida de troca de sala
  const switchInFlightRef = useRef<Promise<void> | null>(null);

  // se cair um updatePosition no meio do handoff, reenviamos ao entrar na nova
  const pendingPosRef = useRef<{ lat: number; lng: number; fuel: number; deltaKm: number } | null>(null);
  // moedas já coletadas localmente: evita "voltar" por update atrasado do servidor
  const locallyHiddenCoinIdsRef = useRef<Set<string>>(new Set());
  const locallyHiddenCardIdsRef = useRef<Set<string>>(new Set());

  const attachToRoom = useCallback(
    (r: Awaited<ReturnType<Client['joinOrCreate']>>, roomNameForDisplay: string) => {
      const lastCoinIdsRef = { current: new Set<string>() };
      const lastCardIdsRef = { current: new Set<string>() };
      r.onStateChange((roomState) => {
        if (roomRef.current !== r) return;

        const others = usersFromState(roomState, r.sessionId);
        const flag = getFlagFromState(roomState);
        const rawCoins = getCoinsFromState(roomState);
        const coins = new Map<string, CellCoinState>();
        for (const [coinId, coin] of rawCoins) {
          if (!locallyHiddenCoinIdsRef.current.has(String(coinId))) {
            coins.set(String(coinId), coin);
          }
        }
        // limpeza: quando a moeda não existe mais no estado do servidor, solta da blacklist local
        for (const hiddenId of Array.from(locallyHiddenCoinIdsRef.current)) {
          if (!rawCoins.has(hiddenId)) {
            locallyHiddenCoinIdsRef.current.delete(hiddenId);
          }
        }

        const rawCards = getCardsFromState(roomState);
        const cards = new Map<string, CellCardState>();
        for (const [cardId, card] of rawCards) {
          if (!locallyHiddenCardIdsRef.current.has(String(cardId))) {
            cards.set(String(cardId), card);
          }
        }
        for (const hiddenId of Array.from(locallyHiddenCardIdsRef.current)) {
          if (!rawCards.has(hiddenId)) {
            locallyHiddenCardIdsRef.current.delete(hiddenId);
          }
        }

        const nextCoinIds = new Set(Array.from(coins.keys()).map((id) => String(id)));
        const addedCoinIds = Array.from(nextCoinIds).filter((id) => !lastCoinIdsRef.current.has(id));
        const removedCoinIds = Array.from(lastCoinIdsRef.current).filter((id) => !nextCoinIds.has(id));
        if (addedCoinIds.length > 0) {
          // eslint-disable-next-line no-console
          console.log('[coin:add]', roomNameForDisplay, addedCoinIds);
        }
        if (removedCoinIds.length > 0) {
          // eslint-disable-next-line no-console
          console.log('[coin:remove]', roomNameForDisplay, removedCoinIds);
        }
        lastCoinIdsRef.current = nextCoinIds;

        const nextCardIds = new Set(Array.from(rawCards.keys()).map((id) => String(id)));
        const addedCardIds = Array.from(nextCardIds).filter((id) => !lastCardIdsRef.current.has(id));
        const removedCardIds = Array.from(lastCardIdsRef.current).filter((id) => !nextCardIds.has(id));
        if (addedCardIds.length > 0) {
          // eslint-disable-next-line no-console
          console.log('[card:add]', roomNameForDisplay, addedCardIds);
        }
        if (removedCardIds.length > 0) {
          // eslint-disable-next-line no-console
          console.log('[card:remove]', roomNameForDisplay, removedCardIds);
        }
        lastCardIdsRef.current = nextCardIds;

        const self = getSelfFromState(roomState, r.sessionId);
        const econPatch = getFuelEconomyFromState(roomState);
        const fuelEconomyResolved = resolveFuelEconomy(
          econPatch,
          self != null ? self.maxFuel : null
        );

        setState((s) => ({
          ...s,
          otherUsers: others,
          flag,
          coins,
          cards,
          fuelEconomy: fuelEconomyResolved,
        }));

        if (self) {
          const store = useUserStore.getState();
          store.setFuel(self.fuel);
          store.setXp(self.xp);
          store.setLevel(self.level);
          store.setFlagsOwned(self.flagsOwned);
          store.setOwnedAreaKm2(self.ownedAreaKm2);
          store.setFuelRuntime({
            maxFuel: self.maxFuel,
            refillInterval: self.refillInterval,
            lastRefillAt: self.lastRefillAt,
            lastFuelUpdateAt: self.lastFuelUpdateAt,
            refillActive: self.refillActive,
            refillGranted: self.refillGranted,
          });
          // Mantém metadata de recarga enquanto o servidor ainda não concluir o ciclo.
          // Assim o indicador pode interpolar entre updates sem perder consumo.
          const recharge = store.fuelRecharge;
          if (recharge && self.fuel >= recharge.maxFuel) {
            store.setFuelRecharge(null);
          }
        }

      });

      r.onLeave(() => {
        if (roomRef.current === r) {
          roomRef.current = null;
          currentRoomCellRef.current = null;
          cardsPackQueueRef.current = [];
          setState((s) => ({
            ...s,
            connected: false,
            sessionId: null,
            otherUsers: new Map(),
            flag: null,
            coins: new Map(),
            cards: new Map(),
            fuelEconomy: null,
            cardsPackPending: null,
          }));
        }
      });

      r.onError((code, message) => {
        setState((s) => ({
          ...s,
          error: message ?? `Code ${code}`,
          connected: false,
        }));
      });

      // changeRoom com handoffId
      r.onMessage('changeRoom' as never, (data: { newRoom: string; handoffId?: string }) => {
        const client = clientRef.current;
        const oldRoom = roomRef.current;
        if (!client || !oldRoom) return;

        if (switchInFlightRef.current) return;

        const task = (async () => {
          setState((s) => ({
            ...s,
            lastChangeRoom: { newRoom: data.newRoom, at: Date.now() },
          }));

          const { userId, username, avatarId } = user;
          if (userId == null) return;

          const { lat: currentLat, lng: currentLng } = lastLatLngRef.current;

          const h3RoomCellFromServer = data.newRoom.startsWith('cell:')
            ? data.newRoom.slice(5)
            : data.newRoom;

          const storeState = useUserStore.getState();
          const opts = buildJoinOptions(
            String(userId),
            username ?? '',
            String(avatarId ?? '1'),
            storeState.level,
            storeState.xp,
            storeState.fuel,
            currentLat,
            currentLng
          );

          const optsNewCell = { ...opts, h3RoomCell: h3RoomCellFromServer };

          // JOIN primeiro
          const nextRoom = await client.joinOrCreate('cell', optsNewCell);

          // switch refs
          roomRef.current = nextRoom;
          currentRoomCellRef.current = h3RoomCellFromServer;

          attachToRoom(nextRoom, `cell:${h3RoomCellFromServer}`);

          setState((s) => ({
            ...s,
            connected: true,
            sessionId: nextRoom.sessionId,
            roomName: `cell:${h3RoomCellFromServer}`,
          }));

          // reenvia último updatePosition se ficou pendente
          const pending = pendingPosRef.current;
          if (pending) {
            pendingPosRef.current = null;
            const outgoing = {
              lat: pending.lat,
              lng: pending.lng,
              h3UserCell: getUserCell(pending.lat, pending.lng),
              fuel: pending.fuel,
              deltaKm: pending.deltaKm,
            };
            logRoomUpdatePosition(nextRoom, outgoing);
            nextRoom.send('updatePosition' as never, outgoing);
          }

          // confirma handoff para a sala antiga (server remove e encerra)
          const handoffId = String(data?.handoffId ?? '');
          if (handoffId) {
            try {
              oldRoom.send('switchedRoom' as never, { handoffId });
            } catch {}
          }

          // leave na sala antiga por último (sem gap)
          try {
            await oldRoom.leave();
          } catch {}
        })()
          .catch((err) => {
            setState((s) => ({
              ...s,
              error: String(err?.message ?? err),
              connected: false,
            }));
          })
          .finally(() => {
            switchInFlightRef.current = null;
          });

        switchInFlightRef.current = task;
      });

      r.onMessage(
        'flagCaptured' as never,
        (payload: FlagCapturedPayload) => {
          setState((s) => ({ ...s, lastFlagCaptured: payload }));
        }
      );

      r.onMessage('roomCoinGranted' as never, (payload: RoomCoinGrantedPayload) => {
        // eslint-disable-next-line no-console
        console.log('[coin:collected]', roomNameForDisplay, payload);
        const balance = Number(payload?.balance);
        const collectedCoinId = String(payload?.coinId ?? '');
        if (collectedCoinId) {
          locallyHiddenCoinIdsRef.current.add(collectedCoinId);
        }
        if (Number.isFinite(balance)) {
          useUserStore.getState().setCoinBalance(balance);
        }
        setState((s) => ({
          ...s,
          coins: (() => {
            if (!collectedCoinId) return s.coins;
            const nextCoins = new Map(s.coins);
            nextCoins.delete(collectedCoinId);
            return nextCoins;
          })(),
          lastRoomCoinGranted: {
            coinId: collectedCoinId,
            value: Number(payload?.value ?? 0),
            balance: Number.isFinite(balance) ? balance : 0,
            duplicate: Boolean(payload?.duplicate),
            roomCell: String(payload?.roomCell ?? ''),
          },
        }));
      });

      r.onMessage('coinCollected' as never, (payload: CoinCollectedPayload) => {
        const coinId = String(payload?.coinId ?? '');
        if (!coinId) return;
        // eslint-disable-next-line no-console
        console.log('[coin:collected:event]', roomNameForDisplay, payload);
        locallyHiddenCoinIdsRef.current.add(coinId);
        setState((s) => {
          const nextCoins = new Map(s.coins);
          nextCoins.delete(coinId);
          return { ...s, coins: nextCoins };
        });
      });

      r.onMessage('collectCoinRejected' as never, (payload: CollectCoinRejectedPayload) => {
        // eslint-disable-next-line no-console
        console.log('[coin:collect_rejected]', roomNameForDisplay, payload);
        setState((s) => ({
          ...s,
          lastCollectCoinRejected: {
            coinId: String(payload?.coinId ?? ''),
            reason: String(payload?.reason ?? ''),
          },
        }));
      });

      r.onMessage('adRewardGranted' as never, (payload: AdRewardGrantedPayload) => {
        // eslint-disable-next-line no-console
        console.log('[ad:reward_granted]', roomNameForDisplay, payload);
        setState((s) => ({
          ...s,
          lastAdRewardGranted: {
            balance: Number(payload?.balance ?? 0),
            amount: Number(payload?.amount ?? 0),
            duplicate: Boolean(payload?.duplicate),
          },
          lastAdRewardRejected: null,
        }));
      });

      r.onMessage('adRewardRejected' as never, (payload: AdRewardRejectedPayload) => {
        // eslint-disable-next-line no-console
        console.log('[ad:reward_rejected]', roomNameForDisplay, payload);
        setState((s) => ({
          ...s,
          lastAdRewardRejected: {
            reason: String(payload?.reason ?? 'server_error'),
          },
          lastAdRewardGranted: null,
        }));
      });

      r.onMessage('fuelPurchaseGranted' as never, (payload: FuelPurchaseGrantedPayload) => {
        // eslint-disable-next-line no-console
        console.log('[fuel:purchase_granted]', roomNameForDisplay, payload);
        const balance = Number(payload?.balance);
        const fuel = Number(payload?.fuel);
        const maxFuel = Number(payload?.maxFuel);
        const store = useUserStore.getState();
        if (Number.isFinite(balance)) store.setCoinBalance(balance);
        if (Number.isFinite(fuel)) store.setFuel(fuel);
        if (Number.isFinite(maxFuel)) {
          store.setFuelRuntime({
            maxFuel,
            refillInterval: store.fuelRuntime.refillInterval,
            lastRefillAt: store.fuelRuntime.lastRefillAt,
            lastFuelUpdateAt: store.fuelRuntime.lastFuelUpdateAt,
            refillActive: store.fuelRuntime.refillActive,
            refillGranted: store.fuelRuntime.refillGranted,
          });
        }
        setState((s) => ({
          ...s,
          lastFuelPurchaseGranted: {
            balance: Number.isFinite(balance) ? balance : 0,
            fuel: Number.isFinite(fuel) ? fuel : 0,
            maxFuel: Number.isFinite(maxFuel) ? maxFuel : 100,
            coinsSpent: Number(payload?.coinsSpent ?? 0),
            percentMissing: Number.isFinite(Number(payload?.percentMissing))
              ? Number(payload?.percentMissing)
              : undefined,
            duplicate: Boolean(payload?.duplicate),
          },
          lastFuelPurchaseRejected: null,
        }));
      });

      r.onMessage('fuelPurchaseRejected' as never, (payload: FuelPurchaseRejectedPayload) => {
        // eslint-disable-next-line no-console
        console.log('[fuel:purchase_rejected]', roomNameForDisplay, payload);
        setState((s) => ({
          ...s,
          lastFuelPurchaseRejected: {
            reason: String(payload?.reason ?? 'server_error'),
          },
          lastFuelPurchaseGranted: null,
        }));
      });

      r.onMessage('cardsPackGranted' as never, (payload: unknown) => {
        const parsed = parseCardsPackGrantedPayload(payload);
        if (!parsed) return;
        // eslint-disable-next-line no-console
        console.log('[cards:pack_granted]', roomNameForDisplay, parsed.type, parsed.cards.length);
        setState((s) => {
          if (s.cardsPackPending == null) {
            return { ...s, cardsPackPending: parsed };
          }
          cardsPackQueueRef.current.push(parsed);
          return s;
        });
      });

      r.onMessage('roomCardGranted' as never, (payload: RoomCardGrantedPayload) => {
        const cardInstanceId = String(payload?.cardInstanceId ?? '');
        const grantedUserId = String(payload?.userId ?? '');
        const isMine = user.userId != null && String(user.userId) === grantedUserId;
        // eslint-disable-next-line no-console
        console.log('[card:granted]', roomNameForDisplay, {
          cardInstanceId,
          userId: grantedUserId,
          via: String(payload?.via ?? ''),
          isMine,
        });
        if (cardInstanceId) {
          locallyHiddenCardIdsRef.current.add(cardInstanceId);
        }
        setState((s) => {
          if (!cardInstanceId) return s;
          const nextCards = new Map(s.cards);
          const fromClient = nextCards.get(cardInstanceId);
          const fromRoom =
            roomRef.current != null
              ? getCardsFromState(roomRef.current.state).get(cardInstanceId)
              : undefined;
          const cellCard = fromClient ?? fromRoom ?? null;
          nextCards.delete(cardInstanceId);

          let cardsPackPending = s.cardsPackPending;
          if (isMine && cellCard) {
            const synthetic: CardsPackGrantedPayload = {
              type: 'map_pickup',
              count: 1,
              cards: [cellCardStateToPackGranted(cellCard)],
            };
            if (cardsPackPending == null) {
              cardsPackPending = synthetic;
            } else {
              cardsPackQueueRef.current.push(synthetic);
            }
          }

          return { ...s, cards: nextCards, cardsPackPending };
        });
      });

      r.onMessage('roomCardCollected' as never, (payload: RoomCardCollectedPayload) => {
        const cardInstanceId = String(payload?.cardInstanceId ?? '');
        // eslint-disable-next-line no-console
        console.log('[card:collected:event]', roomNameForDisplay, {
          cardInstanceId,
          collectedByUserId: String(payload?.collectedByUserId ?? ''),
        });
        if (cardInstanceId) {
          locallyHiddenCardIdsRef.current.add(cardInstanceId);
        }
        setState((s) => {
          if (!cardInstanceId) return s;
          const nextCards = new Map(s.cards);
          nextCards.delete(cardInstanceId);
          return { ...s, cards: nextCards };
        });
      });

      r.onMessage('collectCardRejected' as never, (payload: CollectCardRejectedPayload) => {
        // eslint-disable-next-line no-console
        console.log('[card:collect_rejected]', roomNameForDisplay, {
          cardInstanceId: String(payload?.cardInstanceId ?? ''),
          reason: String(payload?.reason ?? ''),
        });
      });

      r.onMessage(
        'fuelDepleted' as never,
        (payload: FuelDepletedPayload) => {
          const normalized = {
            maxFuel: Number(payload?.maxFuel ?? 100),
            refillInterval: Number(payload?.refillInterval ?? 1000),
            lastRefillAt: Number(payload?.lastRefillAt ?? Date.now()),
          };

          const store = useUserStore.getState();
          store.setFuel(0);
          store.setFuelRecharge(normalized);
        }
      );

      // atualiza state base
      setState((s) => ({
        ...s,
        connected: true,
        sessionId: r.sessionId,
        roomName: roomNameForDisplay,
      }));
    },
    [user.userId, user.username, user.avatarId]
  );

  const connect = useCallback(
    async (targetLat: number, targetLng: number) => {
      const { userId, username, avatarId } = user;
      if (userId == null) return;

      lastLatLngRef.current = { lat: targetLat, lng: targetLng };
      setState((s) => ({ ...s, error: null }));

      // cria/reusa Client
      if (!clientRef.current) {
        clientRef.current = new Client(colyseusConfig.wsUrl);
      }
      const client = clientRef.current;

      const targetCell = getRoomCellFromLatLng(targetLat, targetLng);

      // se já está na mesma célula, não reconecta
      if (roomRef.current && currentRoomCellRef.current === targetCell) return;

      // Join nova sala primeiro (sem sair da antiga ainda)
      const storeState = useUserStore.getState();
      const options = buildJoinOptions(
        String(userId),
        username ?? '',
        String(avatarId ?? '1'),
        storeState.level,
        storeState.xp,
        storeState.fuel,
        targetLat,
        targetLng
      );

      const roomNameForDisplay = getRoomName(targetLat, targetLng);

      try {
        const oldRoom = roomRef.current;

        const newRoom = await client.joinOrCreate('cell', options);

        // ativa nova
        roomRef.current = newRoom;
        currentRoomCellRef.current = options.h3RoomCell ?? targetCell;

        attachToRoom(newRoom, roomNameForDisplay);

        setState((s) => ({
          ...s,
          connected: true,
          sessionId: newRoom.sessionId,
          roomName: roomNameForDisplay,
          otherUsers: usersFromState(newRoom.state, newRoom.sessionId),
          flag: getFlagFromState(newRoom.state),
          coins: getCoinsFromState(newRoom.state),
          cards: getCardsFromState(newRoom.state),
        }));

        // agora sai da antiga
        if (oldRoom) {
          try {
            await oldRoom.leave();
          } catch {}
        }
      } catch (err) {
        setState((s) => ({
          ...s,
          connected: false,
          error: err instanceof Error ? err.message : String(err),
        }));
      }
    },
    [attachToRoom, user.userId, user.username, user.avatarId]
  );

  const sendUpdatePosition = useCallback((newLat: number, newLng: number, newFuel: number, deltaKm: number) => {
    lastLatLngRef.current = { lat: newLat, lng: newLng };

    const room = roomRef.current;
    const payload = { lat: newLat, lng: newLng, fuel: newFuel, deltaKm };

    if (!room) {
      pendingPosRef.current = payload;
      return;
    }

    const conn = room.connection as { isOpen?: boolean };
    if (conn?.isOpen === false) {
      pendingPosRef.current = payload;
      return;
    }

    const outgoing = {
      ...payload,
      h3UserCell: getUserCell(newLat, newLng),
    };
    logRoomUpdatePosition(room, outgoing);
    room.send('updatePosition' as never, outgoing);
  }, []);

  const sendUpdateStats = useCallback((xp: number, level: number, fuel: number) => {
    const room = roomRef.current;
    if (!room) return;
    room.send('updateStats' as never, { xp, level, fuel });
  }, []);

  const sendCollectCoin = useCallback((coinId: string) => {
    const room = roomRef.current;
    if (!room || !coinId) return;
    room.send('collectCoin' as never, { coinId });
  }, []);

  const sendClaimAdReward = useCallback((body: { clientRewardToken: string; rewardUnitId?: string }) => {
    const room = roomRef.current;
    if (!room || !body.clientRewardToken) return;
    room.send('claimAdReward' as never, {
      clientRewardToken: body.clientRewardToken,
      ...(body.rewardUnitId ? { rewardUnitId: body.rewardUnitId } : {}),
    });
  }, []);

  const sendPurchaseFuel = useCallback((body?: { idempotencyKey?: string; percentToAdd?: number }) => {
    const room = roomRef.current;
    if (!room) return;
    const idempotencyKey = body?.idempotencyKey?.trim() || randomFuelPurchaseKey();
    const pct =
      typeof body?.percentToAdd === 'number' &&
      Number.isFinite(body.percentToAdd) &&
      body.percentToAdd > 0
        ? Math.floor(body.percentToAdd)
        : undefined;
    const payload =
      pct != null ? { idempotencyKey, percentToAdd: pct } : { idempotencyKey };
    // eslint-disable-next-line no-console
    console.log('[fuel:purchase_send]', {
      mode: pct != null ? 'partial' : 'full_tank',
      percentToAdd: pct ?? null,
      idempotencyKey: `${idempotencyKey.slice(0, 8)}…`,
    });
    room.send('purchaseFuel' as never, payload as never);
  }, []);

  const ackFuelPurchaseFeedback = useCallback(() => {
    setState((s) => ({
      ...s,
      lastFuelPurchaseGranted: null,
      lastFuelPurchaseRejected: null,
    }));
  }, []);

  const ackAdRewardFeedback = useCallback(() => {
    setState((s) => ({
      ...s,
      lastAdRewardGranted: null,
      lastAdRewardRejected: null,
    }));
  }, []);

  const ackCardsPackFeedback = useCallback(() => {
    setState((s) => {
      const next = cardsPackQueueRef.current.shift();
      return { ...s, cardsPackPending: next ?? null };
    });
  }, []);

  const leave = useCallback(() => {
    roomRef.current?.leave().catch(() => {});
    roomRef.current = null;
    currentRoomCellRef.current = null;
    cardsPackQueueRef.current = [];
    // mantém clientRef se quiser reconectar rápido; se preferir, zere:
    // clientRef.current = null;

    setState((s) => ({
      ...s,
      connected: false,
      error: null,
      otherUsers: new Map(),
      flag: null,
      coins: new Map(),
      cards: new Map(),
      sessionId: null,
      roomName: null,
      lastAdRewardGranted: null,
      lastAdRewardRejected: null,
      lastFuelPurchaseGranted: null,
      lastFuelPurchaseRejected: null,
      fuelEconomy: null,
      cardsPackPending: null,
    }));
  }, []);

  return {
    ...state,
    connect,
    leave,
    sendUpdatePosition,
    sendUpdateStats,
    sendCollectCoin,
    sendClaimAdReward,
    sendPurchaseFuel,
    ackFuelPurchaseFeedback,
    ackAdRewardFeedback,
    ackCardsPackFeedback,
  };
}