import type { Budget, CreateBudgetInput } from "../types";

const STORAGE_KEY = "personal-finance-budgets";

function getStoredBudgets(): Budget[] {
  if (typeof localStorage === "undefined") return [];

  const data = localStorage.getItem(STORAGE_KEY);

  return data ? JSON.parse(data) : [];
}

function saveStoredBudgets(data: Budget[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function addBudget(data: CreateBudgetInput): Promise<number> {
  const budgets = getStoredBudgets();

  const newId =
    budgets.length > 0 ? Math.max(...budgets.map((item) => item.id)) + 1 : 1;

  const newBudget: Budget = {
    id: newId,
    ...data,
    created_at: new Date().toISOString(),
  };

  budgets.unshift(newBudget);
  saveStoredBudgets(budgets);

  return newId;
}

export async function getBudgets(month: string): Promise<Budget[]> {
  return getStoredBudgets().filter((item) => item.month === month);
}

export async function deleteBudget(id: number): Promise<void> {
  const budgets = getStoredBudgets().filter((item) => item.id !== id);

  saveStoredBudgets(budgets);
}
