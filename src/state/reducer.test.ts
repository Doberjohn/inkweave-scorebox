import { describe, expect, it } from "vitest";
import { scoreboxReducer } from "./reducer";
import { scoreOf, computeScoreboard } from "@/lib/scoring";
import type { Player } from "@/types";

function seed(): Player[] {
  return [{ id: "p1", name: "Alex", pulls: [] }];
}

describe("scoreboxReducer", () => {
  it("ADD_PLAYER appends a trimmed player; empty names are ignored", () => {
    const state = scoreboxReducer([], { type: "ADD_PLAYER", name: "  Bea  " });
    expect(state).toHaveLength(1);
    expect(state[0]?.name).toBe("Bea");

    const sameAfterEmpty = scoreboxReducer(state, { type: "ADD_PLAYER", name: "   " });
    expect(sameAfterEmpty).toBe(state);
  });

  it("ADD_PULL records a pull with the given rarity", () => {
    const state = scoreboxReducer(seed(), {
      type: "ADD_PULL",
      playerId: "p1",
      rarity: "legendary",
      now: 1_000,
    });
    expect(state[0]?.pulls).toHaveLength(1);
    expect(state[0]?.pulls[0]?.rarity).toBe("legendary");
    expect(scoreOf(state[0]!)).toBe(4);
  });

  it("UNDO_PULL removes the matching pull only", () => {
    const seeded: Player[] = [
      {
        id: "p1",
        name: "Alex",
        pulls: [
          { id: "x", rarity: "epic", t: 1 },
          { id: "y", rarity: "iconic", t: 2 },
        ],
      },
    ];
    const state = scoreboxReducer(seeded, {
      type: "UNDO_PULL",
      playerId: "p1",
      pullId: "x",
    });
    expect(state[0]?.pulls.map((p) => p.id)).toEqual(["y"]);
  });

  it("RESET_ALL clears state", () => {
    expect(scoreboxReducer(seed(), { type: "RESET_ALL" })).toEqual([]);
  });
});

describe("computeScoreboard", () => {
  it("marks the highest scorer as leader; ties share the top", () => {
    const players: Player[] = [
      { id: "a", name: "A", pulls: [{ id: "1", rarity: "iconic", t: 1 }] },
      { id: "b", name: "B", pulls: [{ id: "2", rarity: "iconic", t: 2 }] },
      { id: "c", name: "C", pulls: [{ id: "3", rarity: "legendary", t: 3 }] },
    ];
    const sb = computeScoreboard(players);
    expect(sb.topScore).toBe(25);
    expect(sb.leaders.map((l) => l.player.id).sort()).toEqual(["a", "b"]);
    expect(sb.byPlayerId.get("a")?.isTied).toBe(true);
    expect(sb.byPlayerId.get("c")?.marginToLeader).toBe(21);
  });

  it("no leader when every score is zero", () => {
    const players: Player[] = [
      { id: "a", name: "A", pulls: [] },
      { id: "b", name: "B", pulls: [] },
    ];
    const sb = computeScoreboard(players);
    expect(sb.topScore).toBe(0);
    expect(sb.leaders).toHaveLength(0);
    expect(sb.byPlayerId.get("a")?.isLeader).toBe(false);
  });
});
