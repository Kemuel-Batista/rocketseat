import { useSQLiteContext } from 'expo-sqlite'

export type TargetCreate = {
  name: string
  amount: number
}

export type TargetUpdate = TargetCreate & {
  id: number
}

export type TargetResponse = {
  id: number
  name: string
  amount: number
  current: number
  percentage: number
  created_at: Date
  updated_at: Date
}

export function useTargetDatabase() {
  const database = useSQLiteContext()

  async function create(data: TargetCreate) {
    const statement = await database.prepareAsync(
      'INSERT INTO targets (name, amount) VALUES ($name, $amount);',
    )

    statement.executeAsync({
      $name: data.name,
      $amount: data.amount,
    })
  }

  async function listBySavedValue() {
    return await database.getAllAsync<TargetResponse>(`
      SELECT
        ts.id,
        ts.name,
        ts.amount,
        COALESCE(SUM(tv.amount), 0) AS current,
        COALESCE((SUM(tv.amount) / ts.amount) * 100, 0) AS percentage,
        ts.created_at,
        ts.updated_at
      FROM targets ts
      LEFT JOIN transactions tv ON tv.target_id = ts.id
      GROUP BY ts.id, ts.name, ts.amount
      ORDER by current DESC;
    `)
  }

  async function show(id: number) {
    return await database.getFirstAsync<TargetResponse>(`
      SELECT
        ts.id,
        ts.name,
        ts.amount,
        COALESCE(SUM(tv.amount), 0) AS current,
        COALESCE((SUM(tv.amount) / ts.amount) * 100, 0) AS percentage,
        ts.created_at,
        ts.updated_at
      FROM targets ts
      LEFT JOIN transactions tv ON tv.target_id = ts.id
      WHERE ts.id = ${id}
    `)
  }

  async function update(data: TargetUpdate) {
    const statement = await database.prepareAsync(
      'UPDATE targets SET name = $name, amount = $amount, updated_at = CURRENT_TIMESTAMP WHERE id = $id;',
    )

    statement.executeAsync({
      $id: data.id,
      $name: data.name,
      $amount: data.amount,
    })
  }

  return {
    show,
    create,
    update,
    listBySavedValue,
  }
}
