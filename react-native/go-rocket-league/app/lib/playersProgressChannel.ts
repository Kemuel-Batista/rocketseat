/**
 * Canal de eventos para atualizações de progresso (found_count / max_supply).
 * Após syncPlayersProgressOnce aplicar updates no SQLite, emite os ids atualizados
 * para que telas com cartas visíveis atualizem a UI em tempo real.
 */

export type PlayersProgressUpdate = {
  id: number;
  foundCount: number;
  maxSupply: number;
};

type Listener = (updates: PlayersProgressUpdate[]) => void;

const listeners = new Set<Listener>();

/**
 * Inscreve-se para receber atualizações de progresso (ids que sofreram update).
 * Retorna função para cancelar a inscrição.
 */
export function subscribePlayersProgress(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Dispara evento com os jogadores que tiveram progresso atualizado.
 * Chamado por syncPlayersProgressOnce após gravar no banco.
 */
export function emitPlayersProgressUpdates(updates: PlayersProgressUpdate[]): void {
  if (updates.length === 0) return;
  listeners.forEach((fn) => {
    try {
      fn(updates);
    } catch {
      // evita um listener quebrado derrubar os outros
    }
  });
}
