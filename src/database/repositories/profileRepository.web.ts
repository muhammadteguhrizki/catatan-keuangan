import type { Profile, UpdateProfileInput } from "./profileRepository.native";

const STORAGE_KEY = "personal-finance-profile";

export async function getProfile(): Promise<Profile | null> {
  if (typeof localStorage === "undefined") return null;

  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return null;
  }

  return JSON.parse(data) as Profile;
}

export async function updateProfile(data: UpdateProfileInput): Promise<void> {
  if (typeof localStorage === "undefined") return;

  const current = await getProfile();

  const profile: Profile = {
    id: 1,
    name: data.name.trim(),
    email: data.email?.trim() ?? "",
    phone: data.phone?.trim() ?? "",
    photo: data.photo ?? current?.photo ?? "",
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
