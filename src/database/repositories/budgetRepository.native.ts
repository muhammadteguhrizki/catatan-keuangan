import { db } from "../database";
import type { Budget, CreateBudgetInput } from "../types";

export async function addBudget(data: CreateBudgetInput): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO budgets (category, amount, month)
     VALUES (?, ?, ?)`,
    [data.category, data.amount, data.month],
  );

  return result.lastInsertRowId;
}

export async function getBudgets(month: string): Promise<Budget[]> {
  return await db.getAllAsync<Budget>(
    `SELECT * FROM budgets
     WHERE month = ?
     ORDER BY id DESC`,
    [month],
  );
}

export async function deleteBudget(id: number): Promise<void> {
  await db.runAsync("DELETE FROM budgets WHERE id = ?", [id]);
}
