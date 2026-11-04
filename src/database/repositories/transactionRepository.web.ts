import type { CreateTransactionInput, Transaction } from "../types";

const STORAGE_KEY = "personal-finance-transactions";

function getStoredTransactions(): Transaction[] {
  if (typeof localStorage === "undefined") return [];

  const data = localStorage.getItem(STORAGE_KEY);

  return data ? JSON.parse(data) : [];
}

function saveStoredTransactions(data: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function addTransaction(
  data: CreateTransactionInput,
): Promise<number> {
  const transactions = getStoredTransactions();

  const newId =
    transactions.length > 0
      ? Math.max(...transactions.map((item) => item.id)) + 1
      : 1;

  const newTransaction: Transaction = {
    id: newId,
    ...data,
    note: data.note ?? null,
    created_at: new Date().toISOString(),
  };

  transactions.unshift(newTransaction);
  saveStoredTransactions(transactions);

  return newId;
}

export async function getTransactions(): Promise<Transaction[]> {
  return getStoredTransactions().sort((a, b) => {
    return (
      new Date(b.transaction_date).getTime() -
      new Date(a.transaction_date).getTime()
    );
  });
}

export async function deleteTransaction(id: number): Promise<void> {
  const transactions = getStoredTransactions().filter((item) => item.id !== id);

  saveStoredTransactions(transactions);
}

export async function deleteAllTransactions(): Promise<void> {
  saveStoredTransactions([]);
}
