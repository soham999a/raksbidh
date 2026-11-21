import { useSyncExternalStore } from "react";
import { buildSeed } from "./seed";
import type { DB, Role } from "./types";

const KEY = "jotno-db-v1";
const SESSION_KEY = "jotno-session-v1";

type Listener = () => void;

/** A tiny localStorage-backed store that stays in sync across browser tabs. */
function createLocalStore<T>(key: string, fallback: () => T) {
  let cache: T | null = null;
  let loaded = false;
  let serverSnapshot: T | null = null;
  const listeners = new Set<Listener>();
  let bound = false;

  const read = (): T => {
    if (typeof window === "undefined") return getServer();
    if (loaded) return cache as T;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        cache = JSON.parse(raw) as T;
        return cache;
      }
    } catch {
      /* fall through to seed */
    }
    cache = fallback();
    try {
      window.localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      /* storage full or blocked */
    }
    return cache;
  };

  const getServer = (): T => {
    if (!serverSnapshot) serverSnapshot = fallback();
    return serverSnapshot;
  };

  const emit = () => listeners.forEach((l) => l());

  const bind = () => {
    if (bound || typeof window === "undefined") return;
    bound = true;
    window.addEventListener("storage", (e) => {
      if (e.key === key || e.key === null) {
        cache = null;
        loaded = false;
        emit();
      }
    });
  };

  const write = (next: T) => {
    cache = next;
    loaded = true;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    emit();
  };

  return {
    read,
    getServer,
    write,
    subscribe(l: Listener) {
      bind();
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

const dbStore = createLocalStore<DB>(KEY, () => buildSeed());

export function getDB() {
  return dbStore.read();
}

/** Mutate a copy of the database; changes are saved and pushed to every open tab. */
export function updateDB(mutator: (draft: DB) => void) {
  const draft = structuredClone(dbStore.read());
  mutator(draft);
  dbStore.write(draft);
}

export function resetDB() {
  dbStore.write(buildSeed());
}

export function useDB(): DB {
  return useSyncExternalStore(dbStore.subscribe, dbStore.read, dbStore.getServer);
}

export interface Session {
  email: string;
  role: Role;
}

const sessionStore = createLocalStore<Session | null>(SESSION_KEY, () => null);

export function useSession() {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.read, sessionStore.getServer);
}

export function signIn(s: Session) {
  sessionStore.write(s);
}

export function signOut() {
  sessionStore.write(null);
}

const langStore = createLocalStore<"en" | "bn" | null>("jotno-lang-v1", () => null);

export function useStoredLang() {
  return useSyncExternalStore(langStore.subscribe, langStore.read, langStore.getServer);
}

export function setLang(l: "en" | "bn") {
  langStore.write(l);
}
