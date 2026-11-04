import { db } from "../database";
import type { CreateTransactionInput, Transaction } from "../types";

export async function addTransaction(
  data: CreateTransactionInput,
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO transactions (
      type,
      title,
      amount,
      category,
      note,
      transaction_date
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.type,
      data.title,
      data.amount,
      data.category,
      data.note ?? null,
      data.transaction_date,
    ],
  );

  return result.lastInsertRowId;
}

export async function getTransactions(): Promise<Transaction[]> {
  return await db.getAllAsync<Transaction>(
    `SELECT * FROM transactions
     ORDER BY transaction_date DESC, id DESC`,
  );
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.runAsync("DELETE FROM transactions WHERE id = ?", [id]);
}

export async function deleteAllTransactions(): Promise<void> {
  await db.runAsync("DELETE FROM transactions");
}
