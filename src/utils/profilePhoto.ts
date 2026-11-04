import { Platform } from "react-native";

const PROFILE_PHOTO_FILENAME = "profile-photo.jpg";
const PROFILE_PHOTO_KEY = "profile-photo";
const DB_NAME = "personal-finance-files";
const STORE_NAME = "photos";
const WEB_PHOTO_URI = "indexeddb://profile-photo";

let cachedObjectUrl: string | null = null;

function openPhotoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePhotoToIndexedDB(sourceUri: string): Promise<string> {
  const response = await fetch(sourceUri);

  if (!response.ok) {
    throw new Error("Tidak dapat membaca foto dari browser.");
  }

  const blob = await response.blob();
  const database = await openPhotoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put(blob, PROFILE_PHOTO_KEY);

    transaction.oncomplete = () => {
      database.close();
      resolve(WEB_PHOTO_URI);
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

async function getPhotoFromIndexedDB(): Promise<string> {
  const database = await openPhotoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(PROFILE_PHOTO_KEY);

    request.onsuccess = () => {
      const blob = request.result as Blob | undefined;

      database.close();

      if (!blob) {
        resolve("");
        return;
      }

      if (cachedObjectUrl) {
        URL.revokeObjectURL(cachedObjectUrl);
      }

      cachedObjectUrl = URL.createObjectURL(blob);
      resolve(cachedObjectUrl);
    };

    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

export async function saveProfilePhoto(sourceUri: string): Promise<string> {
  if (Platform.OS === "web") {
    return savePhotoToIndexedDB(sourceUri);
  }

  const FileSystem = await import("expo-file-system/legacy");

  const directory = FileSystem.documentDirectory;

  if (!directory) {
    throw new Error("Folder penyimpanan aplikasi tidak tersedia.");
  }

  const destinationUri = `${directory}${PROFILE_PHOTO_FILENAME}`;

  const existingFile = await FileSystem.getInfoAsync(destinationUri);

  if (existingFile.exists) {
    await FileSystem.deleteAsync(destinationUri, {
      idempotent: true,
    });
  }

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destinationUri,
  });

  return destinationUri;
}

export async function getProfilePhotoUri(storedPhoto: string): Promise<string> {
  if (!storedPhoto) {
    return "";
  }

  if (Platform.OS === "web" && storedPhoto === WEB_PHOTO_URI) {
    return getPhotoFromIndexedDB();
  }

  return storedPhoto;
}
