import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@gorocketleague/coverage_visited_cells';

/** Carrega o Set de IDs de células (h3RoomCell) já visitadas. */
export async function loadVisitedCells(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

/** Persiste o Set de células visitadas (serializa como array). */
export async function saveVisitedCells(cells: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(cells)));
  } catch {
    // ignora falha de persistência
  }
}
