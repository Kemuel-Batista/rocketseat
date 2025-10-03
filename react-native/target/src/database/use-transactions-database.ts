import { useSQLiteContext } from 'expo-sqlite'

export type TransactionCreate = {
  target_id: number
  amount: number
  observation?: string
}

export type TransactionResponse = {
  id: number
  target_id: number
  amount: number
  observation: string
  created_at: string
  updated_at: string
}

export type Summary = {
  input: number
  output: number
}

export function useTransactionsDatabase() {
  const database = useSQLiteContext()

  async function create(data: TransactionCreate) {
    const statement = await database.prepareAsync(`
      INSERT INTO transactions 
      (target_id, amount, observation)
      VALUES ($target_id, $amount, $observation);  
    `)

    await statement.executeAsync({
      $target_id: data.target_id,
      $amount: data.amount,
      $observation: data.observation ?? null,
    })
  }

  async function remove(id: number) {
    await database.runAsync('DELETE FROM transactions WHERE id = ?', id)
  }

  function summary() {
    return database.getFirstAsync<Summary>(`
        SELECT
          COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS input,
          COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END), 0) AS output
        FROM transactions
      `)
  }

  function listByTargetId(id: number): Promise<TransactionResponse[]> {
    return database.getAllAsync(`
      SELECT * FROM transactions
      WHERE target_id = ${id}
      ORDER BY created_at DESC  
    `)
  }

  return {
    create,
    remove,
    summary,
    listByTargetId,
  }
}
