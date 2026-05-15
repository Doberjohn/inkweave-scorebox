import type { Player, Pull, Rarity } from "@/types";
import { RARITY_BY_ID } from "@/data/rarities";
import { computeScoreboard } from "./scoring";

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

function topPullOf(pulls: Pull[]): Rarity | null {
  let best: Rarity | null = null;
  for (const pull of pulls) {
    const rarity = RARITY_BY_ID[pull.rarity];
    if (!best || rarity.points > best.points) best = rarity;
  }
  return best;
}

function toRecapPlayer(player: Player, rank: number, score: number): RecapPlayer {
  return {
    rank,
    name: player.name,
    score,
    pullCount: player.pulls.length,
    topPull: topPullOf(player.pulls),
  };
}

export function buildRecap(players: Player[], now: Date = new Date()): Recap {
  if (players.length === 0) {
    return { date: now, champion: null, rest: [] };
  }

  const scoreboard = computeScoreboard(players);
  if (scoreboard.topScore === 0) {
    return { date: now, champion: null, rest: [] };
  }

  const ranked = players
    .map((p) => {
      const r = scoreboard.byPlayerId.get(p.id);
      if (!r) throw new Error(`Unranked player ${p.id}`);
      return toRecapPlayer(p, r.rank, r.score);
    })
    .sort((a, b) => a.rank - b.rank || b.score - a.score);

  const [champion, ...rest] = ranked;
  return { date: now, champion: champion ?? null, rest };
}
