const SESSION_KEY = 'ec-session';

function getStorageEntries() {
  if (typeof window === 'undefined') return [];

  return [window.localStorage, window.sessionStorage];
}

function readSession(storage) {
  try {
    const raw = storage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    storage.removeItem(SESSION_KEY);
    return null;
  }
}

export function getStoredSession() {
  for (const storage of getStorageEntries()) {
    const session = readSession(storage);
    if (session?.token && session?.user) {
      return session;
    }
  }

  return null;
}

export function persistSession(session, options = {}) {
  const { remember = false } = options;
  const storages = getStorageEntries();

  for (const storage of storages) {
    storage.removeItem(SESSION_KEY);
  }

  const targetStorage = remember ? window.localStorage : window.sessionStorage;
  targetStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  for (const storage of getStorageEntries()) {
    storage.removeItem(SESSION_KEY);
  }
}

export function getAuthToken() {
  return getStoredSession()?.token ?? null;
}
