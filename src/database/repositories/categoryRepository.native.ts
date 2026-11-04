import { db } from "../database";
import type { Category, CreateCategoryInput, TransactionType } from "../types";

// Ambil semua kategori
export async function getCategories(
  type?: TransactionType,
): Promise<Category[]> {
  if (type) {
    return await db.getAllAsync<Category>(
      `SELECT * FROM categories
       WHERE type = ?
       ORDER BY name ASC`,
      [type],
    );
  }

  return await db.getAllAsync<Category>(
    `SELECT * FROM categories
     ORDER BY type ASC, name ASC`,
  );
}

// Tambah kategori
export async function addCategory(data: CreateCategoryInput): Promise<number> {
  const name = data.name.trim();

  if (!name) {
    throw new Error("Nama kategori tidak boleh kosong.");
  }

  const duplicate = await db.getFirstAsync<Category>(
    `SELECT * FROM categories
     WHERE LOWER(name) = LOWER(?)
     AND type = ?`,
    [name, data.type],
  );

  if (duplicate) {
    throw new Error("Kategori dengan nama tersebut sudah tersedia.");
  }

  const result = await db.runAsync(
    `INSERT INTO categories (name, type, icon, color)
     VALUES (?, ?, ?, ?)`,
    [name, data.type, data.icon ?? null, data.color ?? null],
  );

  return result.lastInsertRowId;
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

  await db.withTransactionAsync(async () => {
    const existing = await db.getFirstAsync<Category>(
      `SELECT * FROM categories WHERE id = ?`,
      [id],
    );

    if (!existing) {
      throw new Error("Kategori tidak ditemukan.");
    }

    // Cek apakah kategori digunakan transaksi atau anggaran
    const transactionCount = await db.getFirstAsync<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM transactions
       WHERE category = ?`,
      [existing.name],
    );

    const budgetCount = await db.getFirstAsync<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM budgets
       WHERE category = ?`,
      [existing.name],
    );

    const isUsed =
      (transactionCount?.total ?? 0) > 0 || (budgetCount?.total ?? 0) > 0;

    // Jangan izinkan perubahan jenis jika kategori sudah digunakan
    if (isUsed && existing.type !== data.type) {
      throw new Error(
        "Jenis kategori tidak bisa diubah karena sudah digunakan pada transaksi atau anggaran.",
      );
    }

    // Cek nama kategori duplikat
    const duplicate = await db.getFirstAsync<Category>(
      `SELECT * FROM categories
       WHERE LOWER(name) = LOWER(?)
       AND type = ?
       AND id != ?`,
      [name, data.type, id],
    );

    if (duplicate) {
      throw new Error("Kategori dengan nama tersebut sudah tersedia.");
    }

    // Jika nama berubah, perbarui referensi data lama
    if (existing.name !== name) {
      await db.runAsync(
        `UPDATE transactions
         SET category = ?
         WHERE category = ?`,
        [name, existing.name],
      );

      await db.runAsync(
        `UPDATE budgets
         SET category = ?
         WHERE category = ?`,
        [name, existing.name],
      );
    }

    // Perbarui data kategori
    await db.runAsync(
      `UPDATE categories
       SET name = ?, type = ?, icon = ?, color = ?
       WHERE id = ?`,
      [name, data.type, data.icon ?? null, data.color ?? null, id],
    );
  });
}

// Hapus kategori
export async function deleteCategory(id: number): Promise<void> {
  const existing = await db.getFirstAsync<Category>(
    `SELECT * FROM categories WHERE id = ?`,
    [id],
  );

  if (!existing) {
    throw new Error("Kategori tidak ditemukan.");
  }

  const transactionCount = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total
     FROM transactions
     WHERE category = ?`,
    [existing.name],
  );

  const budgetCount = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total
     FROM budgets
     WHERE category = ?`,
    [existing.name],
  );

  const transactionTotal = transactionCount?.total ?? 0;
  const budgetTotal = budgetCount?.total ?? 0;

  if (transactionTotal > 0 || budgetTotal > 0) {
    throw new Error(
      `Kategori "${existing.name}" tidak bisa dihapus karena masih digunakan oleh ${transactionTotal} transaksi dan ${budgetTotal} anggaran.`,
    );
  }

  await db.runAsync("DELETE FROM categories WHERE id = ?", [id]);
}
