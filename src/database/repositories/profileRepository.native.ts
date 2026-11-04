import { db } from "../database";

export type Profile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  photo: string;
  updated_at: string;
};

export type UpdateProfileInput = {
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
};

export async function getProfile(): Promise<Profile | null> {
  const result = await db.getFirstAsync<Profile>(
    "SELECT * FROM profile WHERE id = 1",
  );

  return result ?? null;
}

export async function updateProfile(data: UpdateProfileInput): Promise<void> {
  await db.runAsync(
    `UPDATE profile
     SET name = ?, email = ?, phone = ?, photo = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`,
    data.name.trim(),
    data.email?.trim() ?? "",
    data.phone?.trim() ?? "",
    data.photo ?? "",
  );
}
