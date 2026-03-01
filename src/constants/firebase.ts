function parseEnvBoolean(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export const CLOUD_SYNC_ENABLED = parseEnvBoolean(
  import.meta.env.VITE_CLOUD_SYNC_ENABLED,
);

const FIREBASE_USERS_COLLECTION_PRODUCTION = "users";
const FIREBASE_USERS_COLLECTION_DEVELOPMENT = "users_dev";

export const FIREBASE_USERS_COLLECTION = import.meta.env.DEV
  ? FIREBASE_USERS_COLLECTION_DEVELOPMENT
  : FIREBASE_USERS_COLLECTION_PRODUCTION;

export const FIREBASE_DEVICE_ID_STORAGE_KEY = "flowanchor.firebase.device-id";

export const FIREBASE_SYNC_DEBOUNCE_MS = 1200;
export const FIREBASE_SYNC_PAGE_SIZE = 100;
export const FIREBASE_SYNC_MAX_CATCH_UP_PAGES = 20;
export const FIREBASE_SYNC_RETRY_BASE_MS = 1500;
export const FIREBASE_SYNC_RETRY_MAX_MS = 20000;
