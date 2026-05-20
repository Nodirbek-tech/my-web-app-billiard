// Auth removed — stub that satisfies existing imports without enforcing any auth.
import type { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

const state: AuthState = {
  user: null,
  token: null,
  setAuth: () => {},
  logout: () => {},
  isAdmin: () => true,   // always admin — all nav items visible
};

// Minimal zustand-compatible hook so `useAuthStore((s) => s.x)` and
// `useAuthStore()` both work, and `useAuthStore.getState()` works too.
function useAuthStore(): AuthState;
function useAuthStore<T>(selector: (s: AuthState) => T): T;
function useAuthStore<T>(selector?: (s: AuthState) => T): T | AuthState {
  return selector ? selector(state) : state;
}
useAuthStore.getState = () => state;

export { useAuthStore };
