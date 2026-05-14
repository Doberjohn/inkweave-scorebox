import type { PersistedState, Player } from "@/types";

export const STORAGE_KEY = "lorcana-scorebox-v1";

export function loadInitial(): Player[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedState;
  } catch {
    // Corrupt JSON or unavailable storage — fall through to empty.
  }
  return [];
}

export function persist(players: Player[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  } catch {
    // Quota exceeded or private-mode storage — drop the write silently;
    // the in-memory state is still correct for this session.
  }
}
