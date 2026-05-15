import type { Player, Rarity } from "@/types";

export interface RecapPlayer {
  rank: number;
  name: string;
  score: number;
  pullCount: number;
  topPull: Rarity | null;
}

export interface Recap {
  date: Date;
  champion: RecapPlayer | null;
  rest: RecapPlayer[];
}

export function buildRecap(players: Player[], now: Date = new Date()): Recap {
  if (players.length === 0) {
    return { date: now, champion: null, rest: [] };
  }
  throw new Error("not implemented");
}
