import { describe, expect, it } from "vitest";
import { buildRecap } from "./recap";

const fixedNow = new Date("2026-05-15T12:00:00Z");

describe("buildRecap", () => {
  it("returns null champion and empty rest for zero players", () => {
    const recap = buildRecap([], fixedNow);
    expect(recap.champion).toBeNull();
    expect(recap.rest).toEqual([]);
    expect(recap.date).toBe(fixedNow);
  });
});
