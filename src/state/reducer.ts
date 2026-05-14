import { cryptoId } from "@/lib/id";
import { emptyDemoPlayers } from "@/state/demo";
import type { Player, RarityId } from "@/types";

export type Action =
  | { type: "ADD_PLAYER"; name: string }
  | { type: "REMOVE_PLAYER"; playerId: string }
  | { type: "RENAME_PLAYER"; playerId: string; name: string }
  | { type: "ADD_PULL"; playerId: string; rarity: RarityId; now?: number }
  | { type: "UNDO_PULL"; playerId: string; pullId: string }
  | { type: "CLEAR_PULLS"; playerId: string }
  | { type: "SEED_DEMO" }
  | { type: "RESET_ALL" };

export function scoreboxReducer(state: Player[], action: Action): Player[] {
  switch (action.type) {
    case "ADD_PLAYER": {
      const name = action.name.trim();
      if (!name) return state;
      return [...state, { id: cryptoId(), name, pulls: [] }];
    }

    case "REMOVE_PLAYER":
      return state.filter((p) => p.id !== action.playerId);

    case "RENAME_PLAYER": {
      const name = action.name.trim();
      if (!name) return state;
      return state.map((p) => (p.id === action.playerId ? { ...p, name } : p));
    }

    case "ADD_PULL":
      return state.map((p) =>
        p.id === action.playerId
          ? {
              ...p,
              pulls: [
                ...p.pulls,
                { id: cryptoId(), rarity: action.rarity, t: action.now ?? Date.now() },
              ],
            }
          : p,
      );

    case "UNDO_PULL":
      return state.map((p) =>
        p.id === action.playerId
          ? { ...p, pulls: p.pulls.filter((pu) => pu.id !== action.pullId) }
          : p,
      );

    case "CLEAR_PULLS":
      return state.map((p) =>
        p.id === action.playerId ? { ...p, pulls: [] } : p,
      );

    case "SEED_DEMO":
      return emptyDemoPlayers();

    case "RESET_ALL":
      return [];
  }
}
