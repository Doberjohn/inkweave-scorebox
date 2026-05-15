import { describe, expect, it } from "vitest";
import { buildRecap } from "./recap";
import type { Player } from "@/types";

const fixedNow = new Date("2026-05-15T12:00:00Z");

function player(id: string, name: string, pullRarityIds: string[]): Player {
  return {
    id,
    name,
    pulls: pullRarityIds.map((rarity, i) => ({
      id: `${id}-${i}`,
      rarity: rarity as Player["pulls"][number]["rarity"],
      t: 1_000 + i,
    })),
  };
}

describe("buildRecap", () => {
  it("returns null champion and empty rest for zero players", () => {
    const recap = buildRecap([], fixedNow);
    expect(recap.champion).toBeNull();
    expect(recap.rest).toEqual([]);
    expect(recap.date).toBe(fixedNow);
  });
});

describe("buildRecap — single player", () => {
  it("makes the only player the champion when they have at least one pull", () => {
    const recap = buildRecap([player("p1", "Alex", ["legendary"])], fixedNow);
    expect(recap.champion?.name).toBe("Alex");
    expect(recap.champion?.rank).toBe(1);
    expect(recap.champion?.score).toBe(4);
    expect(recap.champion?.pullCount).toBe(1);
    expect(recap.champion?.topPull?.id).toBe("legendary");
    expect(recap.rest).toEqual([]);
  });

  it("returns null champion when the only player has zero pulls", () => {
    const recap = buildRecap([player("p1", "Alex", [])], fixedNow);
    expect(recap.champion).toBeNull();
    expect(recap.rest).toEqual([]);
  });
});
