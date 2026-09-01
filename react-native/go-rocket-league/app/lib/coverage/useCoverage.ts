import { useCallback, useEffect, useState } from 'react';

import { loadVisitedCells, saveVisitedCells } from './visitedCellsStorage';

/**
 * Hook para o Set persistido de células (h3RoomCell) visitadas — progresso de exploração.
 */
export function useCoverage() {
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadVisitedCells().then((set) => {
      setVisitedCells(set);
      setLoaded(true);
    });
  }, []);

  const addVisitedCell = useCallback((cellId: string) => {
    if (!cellId) return;
    setVisitedCells((prev) => {
      if (prev.has(cellId)) return prev;
      const next = new Set(prev);
      next.add(cellId);
      saveVisitedCells(next);
      return next;
    });
  }, []);

  return {
    /** Quantidade de células (h3RoomCell) já visitadas. */
    coverageCount: visitedCells.size,
    /** Registra uma célula como visitada e persiste. */
    addVisitedCell,
    loaded,
  };
}
