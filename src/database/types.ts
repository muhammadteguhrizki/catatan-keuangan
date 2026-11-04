export type TransactionType = "income" | "expense";

export type Transaction = {
  id: number;
  type: TransactionType;
  title: string;
  amount: number;
  category: string;
  note: string | null;
  transaction_date: string;
  created_at?: string;
};

export type CreateTransactionInput = {
  type: TransactionType;
  title: string;
  amount: number;
  category: string;
  note?: string;
  transaction_date: string;
};

export type Budget = {
  id: number;
  category: string;
  amount: number;
  month: string;
  created_at?: string;
};

export type CreateBudgetInput = {
  category: string;
  amount: number;
  month: string;
};

// CATEGORY
export type Category = {
  id: number;
  name: string;
  type: TransactionType;
  icon: string | null;
  color: string | null;
};

export type CreateCategoryInput = {
  name: string;
  type: TransactionType;
  icon?: string | null;
  color?: string | null;
};
