import type { GetUserInstancesParams } from '@/lib/api/userInstancesApi';

export type CollectionListFilters = {
  ovrMin: number;
  ovrMax: number;
  nation: string;
  position: string;
  spawnSource: string;
};

export const DEFAULT_COLLECTION_FILTERS: CollectionListFilters = {
  ovrMin: 0,
  ovrMax: 100,
  nation: '',
  position: '',
  spawnSource: '',
};

const OVR_FULL_MIN = 0;
const OVR_FULL_MAX = 100;

export function isCollectionFiltersActive(f: CollectionListFilters): boolean {
  return (
    f.ovrMin > OVR_FULL_MIN ||
    f.ovrMax < OVR_FULL_MAX ||
    f.nation.trim() !== '' ||
    f.position.trim() !== '' ||
    f.spawnSource.trim() !== ''
  );
}

export function buildCollectionListParams(
  offset: number,
  search: string,
  filters: CollectionListFilters,
  pageSize: number
): GetUserInstancesParams {
  const trimmed = search.trim();
  const params: GetUserInstancesParams = {
    limit: pageSize,
    offset,
    ...(trimmed ? { search: trimmed } : {}),
  };
  if (filters.ovrMin > OVR_FULL_MIN || filters.ovrMax < OVR_FULL_MAX) {
    params.ovrMin = filters.ovrMin;
    params.ovrMax = filters.ovrMax;
  }
  if (filters.nation.trim()) params.nation = filters.nation.trim();
  if (filters.position.trim()) params.position = filters.position.trim();
  if (filters.spawnSource.trim()) params.spawnSource = filters.spawnSource.trim();
  return params;
}
