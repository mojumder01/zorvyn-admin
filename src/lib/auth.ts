/**
 * Demo sign-in only: anyone can use the demo account below. There is no server, so this
 * is not security — a real admin needs server-side authentication.
 */
import { useSyncExternalStore } from 'react';

export const DEMO_EMAIL = 'admin@zorvyn.demo';
export const DEMO_PASSWORD = 'demo1234';
const KEY = 'zorvyn-admin.session';

const listeners = new Set<() => void>();
const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return memory;
  }
};
let memory: string | null = null;

function write(value: string | null) {
  memory = value;
  try {
    if (value) localStorage.setItem(KEY, value);
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the session lasts until the page is closed
  }
  listeners.forEach((l) => l());
}

export function useSignedIn(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => read() === DEMO_EMAIL,
  );
}

export function signIn(email: string, password: string): boolean {
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) return false;
  write(DEMO_EMAIL);
  return true;
}

export const signOut = () => write(null);
