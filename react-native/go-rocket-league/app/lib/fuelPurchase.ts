/**
 * Alinhado a FUEL_PURCHASE_MOBILE.md — preço proporcional ao % do tanque vazio.
 * Orçamentos fixos no app; o servidor usa `room.state.economy.fuelPurchaseCoinsPerPercent`.
 */

/** Fallback se `room.state.economy` ainda não existir no schema. */
export const DEFAULT_FUEL_PURCHASE_COINS_PER_PERCENT = 1;

/** Estimativa de moedas por anúncio (AD_REWARD_MOBILE.md default); servidor é autoritativo. */
export const DEFAULT_AD_REWARD_COINS_ESTIMATE = 10;

export function percentTankMissing(fuel: number, maxFuel: number): number {
  const cap = Math.max(0, maxFuel);
  if (cap <= 0) return 0;
  const f = Math.min(cap, Math.max(0, fuel));
  const empty = cap - f;
  return (empty / cap) * 100;
}

/** Custo para encher o tanque (moedas), conforme doc: ceil(percentMissing × cpp). */
export function coinsForFullRefill(fuel: number, maxFuel: number, coinsPerPercent: number): number {
  const pm = percentTankMissing(fuel, maxFuel);
  if (pm <= 0 || coinsPerPercent <= 0) return 0;
  return Math.ceil(pm * coinsPerPercent);
}

export type RefillWithBudgetPreview = {
  percentAdded: number;
  coinsSpent: number;
  fuelAfter: number;
};

/**
 * Quanto de % do tanque dá para comprar sem ultrapassar o teto de moedas `budgetCoins`.
 * `coinsSpent = ceil(percentAdded × coinsPerPercent)`.
 */
export function previewRefillWithMaxSpend(
  maxSpendCoins: number,
  coinsPerPercent: number,
  fuel: number,
  maxFuel: number
): RefillWithBudgetPreview | null {
  if (maxSpendCoins <= 0 || coinsPerPercent <= 0 || maxFuel <= 0) return null;
  const pm = percentTankMissing(fuel, maxFuel);
  if (pm <= 0) return null;
  const maxPercentForBudget = Math.floor(maxSpendCoins / coinsPerPercent);
  if (maxPercentForBudget <= 0) return null;
  const percentAdded = Math.min(maxPercentForBudget, pm);
  const coinsSpent = Math.ceil(percentAdded * coinsPerPercent);
  const fuelAfter = fuel + (percentAdded / 100) * maxFuel;
  return { percentAdded, coinsSpent, fuelAfter };
}

/** % do tanque que ~`coinAmount` moedas compram nesta zona (teto = o que ainda falta). Sempre inteiro (sem decimais); o que falta encher usa arredondamento e no mínimo 1% quando ainda há espaço. */
export function fuelPercentFromCoinAmount(
  coinAmount: number,
  coinsPerPercent: number,
  fuel: number,
  maxFuel: number
): number {
  if (coinAmount <= 0 || coinsPerPercent <= 0 || maxFuel <= 0) return 0;
  const pm = percentTankMissing(fuel, maxFuel);
  if (pm <= 0) return 0;
  const buyPct = Math.floor(coinAmount / coinsPerPercent);
  if (buyPct <= 0) return 0;
  const capWhole = Math.max(1, Math.round(pm));
  return Math.min(buyPct, capWhole);
}
