import { Session, FavoriteConfig } from "../types/session";

const DB_NAME = "phase-diversity-db";
const DB_VERSION = 1;

const STORE_SESSIONS = "sessions";
const STORE_FAVORITES = "favorite_configs";

export class IndexedDBError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "IndexedDBError";
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(
        new IndexedDBError(
          "IndexedDB not available. Please use a modern browser or disable private browsing mode."
        )
      );
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new IndexedDBError("Failed to open database", request.error));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const sessionsStore = db.createObjectStore(STORE_SESSIONS, {
          keyPath: "id",
        });
        sessionsStore.createIndex("updated_at", "updated_at", {
          unique: false,
        });
        sessionsStore.createIndex("created_at", "created_at", {
          unique: false,
        });
      }

      if (!db.objectStoreNames.contains(STORE_FAVORITES)) {
        const favoritesStore = db.createObjectStore(STORE_FAVORITES, {
          keyPath: "id",
        });
        favoritesStore.createIndex("created_at", "created_at", {
          unique: false,
        });
      }
    };
  });
}

export async function getAllSessions(): Promise<Session[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SESSIONS, "readonly");
    const store = transaction.objectStore(STORE_SESSIONS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as Session[]);
    };

    request.onerror = () => {
      reject(
        new IndexedDBError("Failed to get all sessions", request.error)
      );
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

export async function getSession(id: string): Promise<Session | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SESSIONS, "readonly");
    const store = transaction.objectStore(STORE_SESSIONS);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new IndexedDBError("Failed to get session", request.error));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

export async function saveSession(session: Session): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SESSIONS, "readwrite");
    const store = transaction.objectStore(STORE_SESSIONS);
    const request = store.put(session);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new IndexedDBError("Failed to save session", request.error));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

export async function deleteSession(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SESSIONS, "readwrite");
    const store = transaction.objectStore(STORE_SESSIONS);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new IndexedDBError("Failed to delete session", request.error));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

export async function getAllFavoriteConfigs(): Promise<FavoriteConfig[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_FAVORITES, "readonly");
    const store = transaction.objectStore(STORE_FAVORITES);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as FavoriteConfig[]);
    };

    request.onerror = () => {
      reject(
        new IndexedDBError(
          "Failed to get all favorite configs",
          request.error
        )
      );
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

export async function saveFavoriteConfig(
  config: FavoriteConfig
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_FAVORITES, "readwrite");
    const store = transaction.objectStore(STORE_FAVORITES);
    const request = store.put(config);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(
        new IndexedDBError("Failed to save favorite config", request.error)
      );
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

export async function deleteFavoriteConfig(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_FAVORITES, "readwrite");
    const store = transaction.objectStore(STORE_FAVORITES);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(
        new IndexedDBError("Failed to delete favorite config", request.error)
      );
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}
