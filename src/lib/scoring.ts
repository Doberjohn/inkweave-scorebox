import { RARITY_BY_ID } from "@/data/rarities";
import type { Player, PullTally, RankedPlayer, Scoreboard } from "@/types";

export function scoreOf(player: Player): number {
  let total = 0;
  for (const pull of player.pulls) total += RARITY_BY_ID[pull.rarity].points;
  return total;
}

export function tallyOf(player: Player): PullTally {
  const t: PullTally = {};
  for (const p of player.pulls) t[p.rarity] = (t[p.rarity] ?? 0) + 1;
  return t;
}

export function computeScoreboard(players: readonly Player[]): Scoreboard {
  const scored = players.map((player) => ({ player, score: scoreOf(player) }));
  const sorted = [...scored].sort((a, b) => b.score - a.score);

  const topScore = sorted[0]?.score ?? 0;

  // Dense rank: equal scores share a rank, next rank is +1 (not +N).
  const ranks = new Map<string, number>();
  let denseRank = 0;
  let prevScore: number | null = null;
  for (const entry of sorted) {
    if (entry.score !== prevScore) {
      denseRank += 1;
      prevScore = entry.score;
    }
    ranks.set(entry.player.id, denseRank);
  }

  const leadersCount = topScore > 0
    ? sorted.filter((s) => s.score === topScore).length
    : 0;
  const isTiedAtTop = leadersCount > 1;

  const byPlayerId = new Map<string, RankedPlayer>();
  const leaders: RankedPlayer[] = [];

  for (const entry of scored) {
    const isLeader = topScore > 0 && entry.score === topScore;
    const ranked: RankedPlayer = {
      player: entry.player,
      score: entry.score,
      rank: ranks.get(entry.player.id) ?? 1,
      isLeader,
      isTied: isLeader && isTiedAtTop,
      marginToLeader: Math.max(0, topScore - entry.score),
    };
    byPlayerId.set(entry.player.id, ranked);
    if (isLeader) leaders.push(ranked);
  }

  return { byPlayerId, topScore, leaders };
}
