import type { Category, CreateCategoryInput, TransactionType } from "../types";

const STORAGE_KEY = "personal-finance-categories";
const TRANSACTION_STORAGE_KEY = "personal-finance-transactions";
const BUDGET_STORAGE_KEY = "personal-finance-budgets";

type StoredTransaction = {
  id: number;
  category: string;
  [key: string]: unknown;
};

type StoredBudget = {
  id: number;
  category: string;
  [key: string]: unknown;
};

function getStoredData<T>(key: string): T[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredData<T>(key: string, data: T[]): void {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(key, JSON.stringify(data));
}

function getStoredCategories(): Category[] {
  return getStoredData<Category>(STORAGE_KEY);
}

// Ambil semua kategori
export async function getCategories(
  type?: TransactionType,
): Promise<Category[]> {
  const categories = getStoredCategories();

  if (type) {
    return categories
      .filter((item) => item.type === type)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return categories.sort((a, b) => {
    return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
  });
}

// Tambah kategori
export async function addCategory(data: CreateCategoryInput): Promise<number> {
  const name = data.name.trim();

  if (!name) {
    throw new Error("Nama kategori tidak boleh kosong.");
  }

  const categories = getStoredCategories();

  const duplicate = categories.some(
    (item) =>
      item.name.toLowerCase() === name.toLowerCase() && item.type === data.type,
  );

  if (duplicate) {
    throw new Error("Kategori dengan nama tersebut sudah tersedia.");
  }

  const newId =
    categories.length > 0
      ? Math.max(...categories.map((item) => item.id)) + 1
      : 1;

  const newCategory: Category = {
    id: newId,
    name,
    type: data.type,
    icon: data.icon ?? null,
    color: data.color ?? null,
  };

  categories.push(newCategory);
  saveStoredData(STORAGE_KEY, categories);

  return newId;
}

// Edit kategori
export async function updateCategory(
  id: number,
  data: CreateCategoryInput,
): Promise<void> {
  const name = data.name.trim();

  if (!name) {
    throw new Error("Nama kategori tidak boleh kosong.");
  }

  const categories = getStoredCategories();

  const existing = categories.find((item) => item.id === id);

  if (!existing) {
    throw new Error("Kategori tidak ditemukan.");
  }

  const transactions = getStoredData<StoredTransaction>(
    TRANSACTION_STORAGE_KEY,
  );

  const budgets = getStoredData<StoredBudget>(BUDGET_STORAGE_KEY);

  const transactionCount = transactions.filter(
    (item) => item.category === existing.name,
  ).length;

  const budgetCount = budgets.filter(
    (item) => item.category === existing.name,
  ).length;

  const isUsed = transactionCount > 0 || budgetCount > 0;

  // Jenis kategori tidak boleh berubah jika sudah digunakan
  if (isUsed && existing.type !== data.type) {
    throw new Error(
      "Jenis kategori tidak bisa diubah karena sudah digunakan pada transaksi atau anggaran.",
    );
  }

  // Cek kategori duplikat
  const duplicate = categories.some(
    (item) =>
      item.id !== id &&
      item.name.toLowerCase() === name.toLowerCase() &&
      item.type === data.type,
  );

  if (duplicate) {
    throw new Error("Kategori dengan nama tersebut sudah tersedia.");
  }

  // Perbarui nama kategori pada transaksi dan anggaran lama
  const updatedTransactions = transactions.map((item) =>
    item.category === existing.name ? { ...item, category: name } : item,
  );

  const updatedBudgets = budgets.map((item) =>
    item.category === existing.name ? { ...item, category: name } : item,
  );

  const updatedCategories = categories.map((item) =>
    item.id === id
      ? {
          ...item,
          name,
          type: data.type,
          icon: data.icon ?? null,
          color: data.color ?? null,
        }
      : item,
  );

  // Simpan perubahan
  saveStoredData(TRANSACTION_STORAGE_KEY, updatedTransactions);
  saveStoredData(BUDGET_STORAGE_KEY, updatedBudgets);
  saveStoredData(STORAGE_KEY, updatedCategories);
}

// Hapus kategori
export async function deleteCategory(id: number): Promise<void> {
  const categories = getStoredCategories();

  const existing = categories.find((item) => item.id === id);

  if (!existing) {
    throw new Error("Kategori tidak ditemukan.");
  }

  const transactions = getStoredData<StoredTransaction>(
    TRANSACTION_STORAGE_KEY,
  );

  const budgets = getStoredData<StoredBudget>(BUDGET_STORAGE_KEY);

  const transactionCount = transactions.filter(
    (item) => item.category === existing.name,
  ).length;

  const budgetCount = budgets.filter(
    (item) => item.category === existing.name,
  ).length;

  if (transactionCount > 0 || budgetCount > 0) {
    throw new Error(
      `Kategori "${existing.name}" tidak bisa dihapus karena masih digunakan oleh ${transactionCount} transaksi dan ${budgetCount} anggaran.`,
    );
  }

  const updatedCategories = categories.filter((item) => item.id !== id);

  saveStoredData(STORAGE_KEY, updatedCategories);
}
