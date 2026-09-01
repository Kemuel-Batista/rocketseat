import type { UserInstanceDto } from '@/lib/api/userInstancesApi';

/** Bônus % desse grupo, conforme tamanho (mesma `nation` no time). */
export function bonusPercentForNationGroupSize(count: number): number {
  if (count >= 5) return 80;
  if (count === 4) return 30;
  if (count === 3) return 10;
  if (count === 2) return 5;
  return 0;
}

export type NationalitySynergyEntry = {
  nation: string;
  count: number;
  bonusPercent: number;
};

export type TeamOverallPreview = {
  baseOverallSum: number;
  /** Soma dos bônus de cada nacionalidade (acumulativo). */
  nationalityBonusPercent: number;
  maxSameNationCount: number;
  nationalitySynergy: NationalitySynergyEntry[];
  overall: number;
};

/**
 * Para cada `nation` distinta (normalizada), conta-se quantos jogadores;
 * aplica-se a tabela por grupo e **somam-se** todos os percentuais.
 * overall = round(baseOverallSum * (1 + nationalityBonusPercent/100))
 */
export function computeTeamOverallFromInstances(
  orderedInstanceIds: string[],
  byId: Map<string, UserInstanceDto>
): TeamOverallPreview {
  const nations: string[] = [];
  let base = 0;
  for (const id of orderedInstanceIds) {
    const inst = byId.get(id);
    if (!inst?.card) continue;
    base += Number(inst.card.ovr) || 0;
    const raw = inst.card.nation?.trim();
    if (raw) nations.push(raw.toUpperCase());
  }

  const counts = new Map<string, number>();
  for (const n of nations) {
    counts.set(n, (counts.get(n) ?? 0) + 1);
  }

  let maxSame = 0;
  let totalBonus = 0;
  const nationalitySynergy: NationalitySynergyEntry[] = [];

  for (const [nation, count] of counts.entries()) {
    if (count > maxSame) maxSame = count;
    const b = bonusPercentForNationGroupSize(count);
    if (b > 0) {
      totalBonus += b;
      nationalitySynergy.push({ nation, count, bonusPercent: b });
    }
  }

  nationalitySynergy.sort(
    (a, b) => b.bonusPercent - a.bonusPercent || a.nation.localeCompare(b.nation)
  );

  const overall = Math.round(base * (1 + totalBonus / 100));
  return {
    baseOverallSum: base,
    nationalityBonusPercent: totalBonus,
    maxSameNationCount: maxSame,
    nationalitySynergy,
    overall,
  };
}

/** Primeiros 5 `cardId` distintos (ordem estável da lista). */
export function pickInitialFiveInstanceIds(instances: UserInstanceDto[]): string[] {
  const ids: string[] = [];
  const seen = new Set<number>();
  for (const inst of instances) {
    if (seen.has(inst.cardId)) continue;
    seen.add(inst.cardId);
    ids.push(inst.id);
    if (ids.length === 5) break;
  }
  return ids;
}
