import { cryptoId } from "@/lib/id";
import type { Player } from "@/types";

export function emptyDemoPlayers(): Player[] {
  return [
    { id: cryptoId(), name: "Player 1", pulls: [] },
    { id: cryptoId(), name: "Player 2", pulls: [] },
    { id: cryptoId(), name: "Player 3", pulls: [] },
  ];
}
