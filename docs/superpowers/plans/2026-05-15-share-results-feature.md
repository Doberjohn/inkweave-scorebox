# Share Results Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Share results" footer button that opens a ceremonial 1080×1080 recap modal; the modal generates a PNG and exposes Web Share / Copy / Download actions feature-detected per device.

**Architecture:** Pure data shaping in `src/lib/recap.ts`. Visual template in `src/components/ShareableRecap.tsx` rendered at native 1080×1080, scaled to fit viewport for preview. PNG generation via `html-to-image` in `src/lib/share.ts`. Modal in `src/components/ShareResultsModal.tsx` owns generation lifecycle and renders contextual action buttons. Wrapper `src/components/ShareResults.tsx` lives in the footer next to "Reset all" and owns modal-open state.

**Tech Stack:** React 19, TypeScript, Vitest for unit tests, `html-to-image` (new dep) for DOM→PNG snapshotting, native `navigator.share` / `navigator.clipboard.write` / anchor-download for share mechanisms.

---

## File Structure

**New files:**
- `src/lib/recap.ts` — `buildRecap(players, now?)` pure function + `RecapPlayer` / `Recap` types
- `src/lib/recap.test.ts` — unit tests for `buildRecap`
- `src/lib/share.ts` — `generateRecapPng`, `isWebShareSupported`, `shareViaWebShare`, `copyImageToClipboard`, `downloadBlob`
- `src/lib/share.test.ts` — unit tests for share helpers (feature detection, mocked navigator)
- `src/components/ShareableRecap.tsx` — pure visual template, always rendered at 1080×1080
- `src/components/ShareResultsModal.tsx` — dialog wrapping `<ShareableRecap>` + action buttons + toast
- `src/components/ShareResults.tsx` — footer trigger + modal lifecycle wrapper

**Modified files:**
- `package.json` — add `html-to-image` dependency
- `src/types.ts` — add `RecapPlayer`, `Recap` interfaces (alternatively colocate in `recap.ts`; we colocate)
- `src/components/PageFooter.tsx` — render the `<ShareResults>` trigger before the existing Reset button
- `src/App.tsx` — pass `players` to `<PageFooter>` so the share trigger sees the data
- `src/styles/scorebox.css` — add styles for `.share-trigger`, `.share-modal`, `.shareable-recap.*`, action buttons, toast

---

## Task 1: Install `html-to-image` and verify build

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install the dependency**

```bash
npm install html-to-image
```

Expected: a single package added, no peer-dep warnings.

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```

Expected: `built in ~2s`, no TS errors.

- [ ] **Step 3: Verify tests still pass**

```bash
npm run test:run
```

Expected: existing tests still pass.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add html-to-image for share-result PNG snapshotting"
```

---

## Task 2: Define `Recap` types and a failing `buildRecap` test

**Files:**
- Create: `src/lib/recap.ts`
- Create: `src/lib/recap.test.ts`

- [ ] **Step 1: Create the types file with stubs**

Write `src/lib/recap.ts`:

```ts
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

export function buildRecap(_players: Player[], _now: Date = new Date()): Recap {
  throw new Error("not implemented");
}
```

- [ ] **Step 2: Write the failing test for empty input**

Write `src/lib/recap.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the test and confirm it fails**

```bash
npm run test:run -- src/lib/recap.test.ts
```

Expected: FAIL with "not implemented".

- [ ] **Step 4: Implement the empty-input case**

Replace the body of `buildRecap` in `src/lib/recap.ts`:

```ts
export function buildRecap(players: Player[], now: Date = new Date()): Recap {
  if (players.length === 0) {
    return { date: now, champion: null, rest: [] };
  }
  throw new Error("not implemented");
}
```

- [ ] **Step 5: Run the test and confirm it passes**

```bash
npm run test:run -- src/lib/recap.test.ts
```

Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/recap.ts src/lib/recap.test.ts
git commit -m "Scaffold buildRecap with empty-input case"
```

---

## Task 3: Single-player recap (no champion, no rest if score is 0)

**Files:**
- Modify: `src/lib/recap.ts`
- Modify: `src/lib/recap.test.ts`

- [ ] **Step 1: Add failing tests for single player**

Append to `src/lib/recap.test.ts`:

```ts
import type { Player } from "@/types";

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
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
npm run test:run -- src/lib/recap.test.ts
```

Expected: 2 new failures with "not implemented".

- [ ] **Step 3: Implement using existing scoring helpers**

Replace the body of `buildRecap` in `src/lib/recap.ts`:

```ts
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
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm run test:run -- src/lib/recap.test.ts
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/recap.ts src/lib/recap.test.ts
git commit -m "buildRecap: single-player and zero-score cases"
```

---

## Task 4: Multi-player ranking, top-pull selection, and ties

**Files:**
- Modify: `src/lib/recap.test.ts`

(No source change expected — Task 3's implementation already handles these. We're proving it with tests.)

- [ ] **Step 1: Add tests for multiple players and ranking**

Append to `src/lib/recap.test.ts`:

```ts
describe("buildRecap — multi-player", () => {
  it("ranks players by score descending and surfaces each player's top pull", () => {
    const players = [
      player("p1", "Alex", ["foil-rare", "legendary"]),       // 1 + 4 = 5
      player("p2", "Bea", ["iconic"]),                        // 25
      player("p3", "Cyrus", ["epic", "super-rare"]),          // 5 + 2 = 7
    ];
    const recap = buildRecap(players, fixedNow);
    expect(recap.champion?.name).toBe("Bea");
    expect(recap.champion?.score).toBe(25);
    expect(recap.champion?.topPull?.id).toBe("iconic");
    expect(recap.rest.map((r) => r.name)).toEqual(["Cyrus", "Alex"]);
    expect(recap.rest[0]?.score).toBe(7);
    expect(recap.rest[0]?.topPull?.id).toBe("epic");
    expect(recap.rest[1]?.topPull?.id).toBe("legendary");
  });

  it("uses dense ranking — tied scores share a rank", () => {
    const players = [
      player("p1", "Alex", ["iconic"]),    // 25
      player("p2", "Bea", ["iconic"]),     // 25
      player("p3", "Cyrus", ["legendary"]),// 4
    ];
    const recap = buildRecap(players, fixedNow);
    expect(recap.champion?.rank).toBe(1);
    expect(recap.rest[0]?.rank).toBe(1);
    expect(recap.rest[1]?.rank).toBe(2);
  });

  it("picks the highest-points pull as topPull, regardless of pull order", () => {
    const players = [player("p1", "Alex", ["epic", "iconic", "foil-rare"])];
    const recap = buildRecap(players, fixedNow);
    expect(recap.champion?.topPull?.id).toBe("iconic");
  });
});
```

- [ ] **Step 2: Run tests and confirm all pass**

```bash
npm run test:run -- src/lib/recap.test.ts
```

Expected: 6 passed.

- [ ] **Step 3: Commit**

```bash
git add src/lib/recap.test.ts
git commit -m "Test buildRecap multi-player ranking and tie handling"
```

---

## Task 5: Download helper (`downloadBlob`)

**Files:**
- Create: `src/lib/share.ts`
- Create: `src/lib/share.test.ts`

- [ ] **Step 1: Create the stub with failing test**

Write `src/lib/share.ts`:

```ts
export function downloadBlob(_blob: Blob, _filename: string): void {
  throw new Error("not implemented");
}
```

Write `src/lib/share.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadBlob } from "./share";

describe("downloadBlob", () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let revokeSpy: ReturnType<typeof vi.spyOn>;
  let createUrlSpy: ReturnType<typeof vi.spyOn>;
  let clickedAnchor: HTMLAnchorElement | null = null;

  beforeEach(() => {
    clickedAnchor = null;
    createUrlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag) => {
        const real = Object.getPrototypeOf(document).createElement.call(document, tag);
        if (tag === "a") {
          real.click = vi.fn(() => {
            clickedAnchor = real;
          });
        }
        return real;
      });
  });
  afterEach(() => vi.restoreAllMocks());

  it("creates an anchor with the filename, clicks it, and revokes the URL", () => {
    const blob = new Blob(["x"], { type: "image/png" });
    downloadBlob(blob, "scorebox-test.png");
    expect(createUrlSpy).toHaveBeenCalledWith(blob);
    expect(clickedAnchor?.download).toBe("scorebox-test.png");
    expect(clickedAnchor?.href).toContain("blob:mock");
    expect(revokeSpy).toHaveBeenCalledWith("blob:mock");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
npm run test:run -- src/lib/share.test.ts
```

Expected: FAIL with "not implemented".

- [ ] **Step 3: Implement `downloadBlob`**

Replace `src/lib/share.ts`:

```ts
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 4: Run the test and confirm it passes**

```bash
npm run test:run -- src/lib/share.test.ts
```

Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/share.ts src/lib/share.test.ts
git commit -m "share.ts: downloadBlob helper"
```

---

## Task 6: Clipboard copy helper (`copyImageToClipboard`)

**Files:**
- Modify: `src/lib/share.ts`
- Modify: `src/lib/share.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `src/lib/share.test.ts`:

```ts
import { copyImageToClipboard } from "./share";

describe("copyImageToClipboard", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("calls navigator.clipboard.write with a ClipboardItem wrapping the PNG", async () => {
    const writeMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { write: writeMock } });
    // jsdom does not ship ClipboardItem; provide a minimal stub.
    vi.stubGlobal("ClipboardItem", class { constructor(public items: Record<string, Blob>) {} });

    const blob = new Blob(["x"], { type: "image/png" });
    await copyImageToClipboard(blob);

    expect(writeMock).toHaveBeenCalledTimes(1);
    const [items] = writeMock.mock.calls[0];
    expect(items).toHaveLength(1);
    expect(items[0].items["image/png"]).toBe(blob);
  });

  it("rejects when navigator.clipboard.write rejects", async () => {
    const writeMock = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { write: writeMock } });
    vi.stubGlobal("ClipboardItem", class { constructor(public items: Record<string, Blob>) {} });

    await expect(
      copyImageToClipboard(new Blob([], { type: "image/png" })),
    ).rejects.toThrow("denied");
  });
});
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
npm run test:run -- src/lib/share.test.ts
```

Expected: 2 failures, `copyImageToClipboard is not a function`.

- [ ] **Step 3: Implement `copyImageToClipboard`**

Append to `src/lib/share.ts`:

```ts
export async function copyImageToClipboard(blob: Blob): Promise<void> {
  const item = new ClipboardItem({ "image/png": blob });
  await navigator.clipboard.write([item]);
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm run test:run -- src/lib/share.test.ts
```

Expected: 3 passed total.

- [ ] **Step 5: Commit**

```bash
git add src/lib/share.ts src/lib/share.test.ts
git commit -m "share.ts: copyImageToClipboard helper"
```

---

## Task 7: Web Share detection + share helper

**Files:**
- Modify: `src/lib/share.ts`
- Modify: `src/lib/share.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `src/lib/share.test.ts`:

```ts
import { isWebShareSupported, shareViaWebShare } from "./share";

describe("isWebShareSupported", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns false when navigator.share is missing", () => {
    vi.stubGlobal("navigator", {});
    expect(isWebShareSupported()).toBe(false);
  });

  it("returns false when canShare rejects file payloads", () => {
    vi.stubGlobal("navigator", {
      share: vi.fn(),
      canShare: vi.fn().mockReturnValue(false),
    });
    expect(isWebShareSupported()).toBe(false);
  });

  it("returns true when canShare accepts a file payload", () => {
    vi.stubGlobal("navigator", {
      share: vi.fn(),
      canShare: vi.fn().mockReturnValue(true),
    });
    expect(isWebShareSupported()).toBe(true);
  });
});

describe("shareViaWebShare", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("calls navigator.share with a File built from the blob", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share: shareMock });
    const blob = new Blob(["x"], { type: "image/png" });

    await shareViaWebShare(blob, "scorebox-recap.png", "Scorebox", "Box opening recap");

    expect(shareMock).toHaveBeenCalledTimes(1);
    const arg = shareMock.mock.calls[0][0];
    expect(arg.title).toBe("Scorebox");
    expect(arg.text).toBe("Box opening recap");
    expect(arg.files).toHaveLength(1);
    expect(arg.files[0].name).toBe("scorebox-recap.png");
    expect(arg.files[0].type).toBe("image/png");
  });
});
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
npm run test:run -- src/lib/share.test.ts
```

Expected: 4 new failures.

- [ ] **Step 3: Implement detection and share helpers**

Append to `src/lib/share.ts`:

```ts
export function isWebShareSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.share !== "function") return false;
  if (typeof navigator.canShare !== "function") return false;
  const probe = new File([], "probe.png", { type: "image/png" });
  return navigator.canShare({ files: [probe] });
}

export async function shareViaWebShare(
  blob: Blob,
  filename: string,
  title: string,
  text: string,
): Promise<void> {
  const file = new File([blob], filename, { type: "image/png" });
  await navigator.share({ files: [file], title, text });
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm run test:run -- src/lib/share.test.ts
```

Expected: 7 passed total.

- [ ] **Step 5: Commit**

```bash
git add src/lib/share.ts src/lib/share.test.ts
git commit -m "share.ts: Web Share detection and shareViaWebShare"
```

---

## Task 8: PNG generation via `html-to-image`

**Files:**
- Modify: `src/lib/share.ts`

(No unit test — html-to-image needs a real DOM with layout. Manual verify in browser later.)

- [ ] **Step 1: Append the generation helper to `src/lib/share.ts`**

```ts
import { toBlob } from "html-to-image";

export async function generateRecapPng(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  const blob = await toBlob(node, {
    width: 1080,
    height: 1080,
    pixelRatio: 1,
    backgroundColor: "#0d0d14",
  });
  if (!blob) throw new Error("Failed to generate PNG from recap node");
  return blob;
}
```

- [ ] **Step 2: Verify the build still typechecks**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/lib/share.ts
git commit -m "share.ts: generateRecapPng via html-to-image"
```

---

## Task 9: `ShareableRecap` component — JSX skeleton

**Files:**
- Create: `src/components/ShareableRecap.tsx`

- [ ] **Step 1: Create the component file**

```tsx
import type { Recap, RecapPlayer } from "@/lib/recap";

interface ShareableRecapProps {
  recap: Recap;
}

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function rankLabel(rank: number): string {
  if (rank === 1) return "1ST";
  if (rank === 2) return "2ND";
  if (rank === 3) return "3RD";
  return `${rank}TH`;
}

function ChampionBlock({ champion }: { champion: RecapPlayer }) {
  return (
    <section className="shareable-recap__champion">
      <span className="shareable-recap__crown" aria-hidden="true">♛</span>
      <h2 className="shareable-recap__champion-name">{champion.name}</h2>
      <div className="shareable-recap__champion-score">{champion.score}</div>
      <div className="shareable-recap__champion-meta">
        points · {champion.pullCount} pull{champion.pullCount === 1 ? "" : "s"}
      </div>
      {champion.topPull && (
        <div className="shareable-recap__top-pull-chip">
          <img src={champion.topPull.icon} alt="" className="shareable-recap__top-pull-icon" />
          <div className="shareable-recap__top-pull-text">
            <span className="shareable-recap__top-pull-eyebrow">Biggest pull</span>
            <span className="shareable-recap__top-pull-name">
              {champion.topPull.name}
              <span className="shareable-recap__top-pull-points"> +{champion.topPull.points} pts</span>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

function RunnerUpRow({ player }: { player: RecapPlayer }) {
  return (
    <li className="shareable-recap__rest-row">
      <span className="shareable-recap__rest-rank">{rankLabel(player.rank)}</span>
      <span className="shareable-recap__rest-name">{player.name}</span>
      <span className="shareable-recap__rest-score">{player.score}</span>
      {player.topPull && (
        <span className="shareable-recap__rest-pull">
          {player.topPull.short} +{player.topPull.points}
        </span>
      )}
    </li>
  );
}

export function ShareableRecap({ recap }: ShareableRecapProps) {
  const date = DATE_FMT.format(recap.date).toUpperCase();

  return (
    <div className="shareable-recap">
      <div className="shareable-recap__glow" aria-hidden="true">
        <div className="orb orb-blue" />
        <div className="orb orb-purple" />
        <div className="orb orb-amber" />
        <div className="orb orb-teal" />
      </div>

      <header className="shareable-recap__header">
        <span className="shareable-recap__eyebrow">Box Opening · {date}</span>
      </header>

      {recap.champion && <ChampionBlock champion={recap.champion} />}

      {recap.rest.length > 0 && (
        <ul className="shareable-recap__rest">
          {recap.rest.map((p) => <RunnerUpRow key={p.name + p.rank} player={p} />)}
        </ul>
      )}

      <footer className="shareable-recap__footer">
        <div className="shareable-recap__brand">INKWEAVE SCOREBOX</div>
        <div className="shareable-recap__url">scorebox.inkweave.ink</div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/ShareableRecap.tsx
git commit -m "ShareableRecap: structural JSX template"
```

---

## Task 10: `ShareableRecap` styles

**Files:**
- Modify: `src/styles/scorebox.css`

- [ ] **Step 1: Append styles at the end of `src/styles/scorebox.css`**

```css
/* ── ShareableRecap ── 1080x1080 ceremonial recap canvas ──────── */
.shareable-recap {
  position: relative;
  width: 1080px;
  height: 1080px;
  background: var(--c-bg);
  color: var(--c-text);
  font-family: var(--font-body);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 64px 80px;
  box-sizing: border-box;
}
.shareable-recap__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.shareable-recap__glow .orb-blue   { top: -200px; left: -120px; }
.shareable-recap__glow .orb-purple { top: 20%;   right: -200px; }
.shareable-recap__glow .orb-amber  { bottom: -180px; left: 24%; }
.shareable-recap__glow .orb-teal   { bottom: 16%; right: 12%; }

.shareable-recap__header {
  position: relative;
  z-index: 1;
  text-align: center;
}
.shareable-recap__eyebrow {
  display: inline-block;
  font-size: 18px;
  letter-spacing: 3.2px;
  text-transform: uppercase;
  color: var(--c-text-muted);
  font-weight: 600;
}

.shareable-recap__champion {
  position: relative;
  z-index: 1;
  margin-top: 56px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}
.shareable-recap__crown {
  color: var(--c-primary-500);
  font-size: 56px;
  line-height: 1;
  filter: drop-shadow(0 0 18px rgba(255, 185, 0, 0.6));
}
.shareable-recap__champion-name {
  font-family: var(--font-hero);
  font-weight: 700;
  font-size: 84px;
  line-height: 1.05;
  margin: 0;
  background: linear-gradient(90deg, #faf1d3 0%, #d4af37 50%, #b29861 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  padding: 0 0.06em 0.06em;
}
.shareable-recap__champion-score {
  font-family: var(--font-hero);
  font-weight: 700;
  font-size: 200px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(180deg, #faf1d3 0%, #ffb900 60%, #b29861 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.shareable-recap__champion-meta {
  font-size: 22px;
  color: var(--c-text-muted);
  letter-spacing: 0.4px;
}

.shareable-recap__top-pull-chip {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 14px 26px;
  border: 1px solid rgba(212, 175, 55, 0.4);
  background: rgba(212, 175, 55, 0.08);
  border-radius: 999px;
  margin-top: 8px;
}
.shareable-recap__top-pull-icon { width: 44px; height: 44px; object-fit: contain; }
.shareable-recap__top-pull-text { display: flex; flex-direction: column; align-items: flex-start; }
.shareable-recap__top-pull-eyebrow {
  font-size: 11px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: var(--c-text-muted);
  font-weight: 600;
}
.shareable-recap__top-pull-name {
  font-family: var(--font-hero);
  font-size: 22px;
  color: var(--c-text);
  font-weight: 700;
}
.shareable-recap__top-pull-points { color: var(--c-primary-500); }

.shareable-recap__rest {
  position: relative;
  z-index: 1;
  list-style: none;
  margin: 64px 0 0;
  padding: 32px 0 0;
  border-top: 1px solid var(--c-surface-border);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.shareable-recap__rest-row {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  align-items: baseline;
  gap: 24px;
  padding: 4px 8px;
}
.shareable-recap__rest-rank {
  font-size: 14px;
  letter-spacing: 1.6px;
  color: var(--c-text-dim);
  font-weight: 700;
}
.shareable-recap__rest-name {
  font-family: var(--font-hero);
  font-size: 36px;
  color: var(--c-text);
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shareable-recap__rest-score {
  font-family: var(--font-hero);
  font-size: 40px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--c-text);
}
.shareable-recap__rest-pull {
  font-size: 16px;
  color: var(--c-text-muted);
  font-weight: 600;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

.shareable-recap__footer {
  position: relative;
  z-index: 1;
  margin-top: auto;
  padding-top: 32px;
  border-top: 1px solid var(--c-surface-border);
  text-align: center;
}
.shareable-recap__brand {
  font-size: 22px;
  letter-spacing: 4.2px;
  text-transform: uppercase;
  color: var(--c-primary-500);
  font-weight: 700;
}
.shareable-recap__url {
  margin-top: 8px;
  font-size: 14px;
  color: var(--c-text-dim);
  letter-spacing: 1.4px;
}
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/styles/scorebox.css
git commit -m "ShareableRecap styles"
```

---

## Task 11: `ShareResultsModal` — structure, lifecycle, PNG generation

**Files:**
- Create: `src/components/ShareResultsModal.tsx`

- [ ] **Step 1: Create the modal component**

```tsx
import { useEffect, useId, useRef, useState } from "react";
import type { Recap } from "@/lib/recap";
import {
  copyImageToClipboard,
  downloadBlob,
  generateRecapPng,
  isWebShareSupported,
  shareViaWebShare,
} from "@/lib/share";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { ShareableRecap } from "./ShareableRecap";

interface ShareResultsModalProps {
  recap: Recap;
  onClose: () => void;
}

type ActionStatus = "idle" | "working" | "ok" | "error";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function ShareResultsModal({ recap, onClose }: ShareResultsModalProps) {
  const titleId = useId();
  const recapRef = useRef<HTMLDivElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<ActionStatus>("idle");
  const [copyStatus, setCopyStatus] = useState<ActionStatus>("idle");
  const [downloadStatus, setDownloadStatus] = useState<ActionStatus>("idle");
  const canWebShare = isWebShareSupported();
  const filename = `scorebox-${isoDate(recap.date)}.png`;

  useBodyScrollLock(true);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const node = recapRef.current;
    if (!node) return;
    let cancelled = false;
    generateRecapPng(node)
      .then((b) => {
        if (!cancelled) setBlob(b);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setGenerateError(err instanceof Error ? err.message : "Unable to render image");
      });
    return () => { cancelled = true; };
  }, []);

  async function onShare() {
    if (!blob) return;
    setShareStatus("working");
    try {
      await shareViaWebShare(blob, filename, "Scorebox — Box Opening Recap", recapText(recap));
      setShareStatus("ok");
    } catch {
      setShareStatus("idle"); // user cancelling the share sheet is a normal no-op
    }
  }

  async function onCopy() {
    if (!blob) return;
    setCopyStatus("working");
    try {
      await copyImageToClipboard(blob);
      setCopyStatus("ok");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
      // Fall back to download so the user still gets the image
      downloadBlob(blob, filename);
      setTimeout(() => setCopyStatus("idle"), 2500);
    }
  }

  function onDownload() {
    if (!blob) return;
    setDownloadStatus("working");
    try {
      downloadBlob(blob, filename);
      setDownloadStatus("ok");
      setTimeout(() => setDownloadStatus("idle"), 2000);
    } catch {
      setDownloadStatus("error");
    }
  }

  return (
    <div className="share-modal-backdrop" onClick={onClose}>
      <div
        className="share-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="share-modal__header">
          <h2 id={titleId} className="share-modal__title">Share results</h2>
          <button type="button" className="share-modal__close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="share-modal__stage">
          <div className="share-modal__stage-inner" ref={recapRef}>
            <ShareableRecap recap={recap} />
          </div>
        </div>

        {generateError && (
          <div className="share-modal__error" role="alert">
            Couldn't build the image: {generateError}
          </div>
        )}

        <footer className="share-modal__actions">
          {canWebShare && (
            <button
              type="button"
              className="share-action share-action--primary"
              onClick={onShare}
              disabled={!blob || shareStatus === "working"}
            >
              {shareStatus === "ok" ? "Shared" : "Share"}
            </button>
          )}
          <button
            type="button"
            className={canWebShare ? "share-action" : "share-action share-action--primary"}
            onClick={onCopy}
            disabled={!blob || copyStatus === "working"}
          >
            {copyStatus === "ok" ? "Copied" : copyStatus === "error" ? "Saved instead" : "Copy image"}
          </button>
          <button
            type="button"
            className="share-action"
            onClick={onDownload}
            disabled={!blob || downloadStatus === "working"}
          >
            {downloadStatus === "ok" ? "Saved" : "Download"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function recapText(recap: Recap): string {
  if (!recap.champion) return "Box opening complete";
  return `${recap.champion.name} won with ${recap.champion.score} points`;
}
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/ShareResultsModal.tsx
git commit -m "ShareResultsModal: dialog with PNG generation and action buttons"
```

---

## Task 12: `ShareResultsModal` styles + scaled preview stage

**Files:**
- Modify: `src/styles/scorebox.css`

- [ ] **Step 1: Append modal + action styles at the end of `src/styles/scorebox.css`**

```css
/* ── Share Results Modal ─────────────────────────────────────── */
.share-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 110;
  background: rgba(8, 8, 14, 0.78);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: modalFade 0.18s var(--ease-smooth);
}
.share-modal {
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f19 100%);
  border: 1px solid var(--c-surface-border);
  border-radius: var(--r-card);
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  animation: modalSlide 0.28s var(--ease-bounce);
}
.share-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--c-surface-border);
}
.share-modal__title {
  font-family: var(--font-hero);
  font-size: 24px;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
}
.share-modal__close {
  width: 36px; height: 36px;
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid var(--c-surface-border);
  color: var(--c-text-muted);
  border-radius: 50%;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition: all 0.2s var(--ease-snappy);
}
.share-modal__close:hover {
  color: var(--c-error);
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.08);
}

/* Stage scales the native 1080x1080 recap into the modal width via
   container-type + scaled child. The child stays 1080x1080 so html-to-image
   captures it at native resolution. */
.share-modal__stage {
  position: relative;
  margin: 16px 20px;
  width: calc(100% - 40px);
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: var(--r-card);
  border: 1px solid var(--c-surface-border);
  background: var(--c-bg);
}
.share-modal__stage-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 1080px;
  height: 1080px;
  transform-origin: top left;
  /* CSS-only scale: stage width / 1080. Stage is fluid, so we use a CSS
     variable updated by JS in a follow-up if needed. For now, scale via
     container query units. */
  transform: scale(calc((100cqw) / 1080));
}
@supports not (container-type: inline-size) {
  .share-modal__stage-inner { transform: scale(0.46); } /* fallback for older browsers */
}
.share-modal__stage {
  container-type: inline-size;
}

.share-modal__error {
  margin: 0 20px 16px;
  padding: 12px 14px;
  background: var(--c-error-bg);
  border: 1px solid var(--c-error-border);
  border-radius: var(--r-md);
  color: var(--c-error);
  font-size: var(--fs-md);
}

.share-modal__actions {
  display: flex;
  gap: 10px;
  padding: 14px 20px 18px;
  border-top: 1px solid var(--c-surface-border);
}
.share-action {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 9px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--c-surface-border);
  border-radius: var(--r-md);
  color: var(--c-text-desc);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.2s var(--ease-snappy),
              background 0.2s var(--ease-smooth),
              color 0.2s var(--ease-smooth);
}
.share-action:hover:not(:disabled) {
  border-color: rgba(212, 175, 55, 0.45);
  background: rgba(212, 175, 55, 0.08);
  color: var(--c-primary-500);
}
.share-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.share-action--primary {
  background: var(--c-filter-gradient);
  color: var(--c-filter-text);
  border-color: transparent;
  box-shadow: var(--shadow-filter);
}
.share-action--primary:hover:not(:disabled) {
  color: var(--c-filter-text);
  background: var(--c-filter-gradient);
  border-color: transparent;
}
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/styles/scorebox.css
git commit -m "ShareResultsModal styles + scaled preview stage"
```

---

## Task 13: `ShareResults` wrapper + footer wiring

**Files:**
- Create: `src/components/ShareResults.tsx`
- Modify: `src/components/PageFooter.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/scorebox.css`

- [ ] **Step 1: Create the wrapper component**

Write `src/components/ShareResults.tsx`:

```tsx
import { useState } from "react";
import type { Player } from "@/types";
import { buildRecap } from "@/lib/recap";
import { ShareResultsModal } from "./ShareResultsModal";

interface ShareResultsProps {
  players: Player[];
  canShare: boolean;
}

export function ShareResults({ players, canShare }: ShareResultsProps) {
  const [open, setOpen] = useState(false);

  if (!canShare) return null;

  return (
    <>
      <button
        type="button"
        className="share-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        Share results
      </button>
      {open && (
        <ShareResultsModal
          recap={buildRecap(players)}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Update `PageFooter.tsx` to accept players and render the share trigger**

Replace `src/components/PageFooter.tsx`:

```tsx
import type { Player } from "@/types";
import { ShareResults } from "./ShareResults";

interface PageFooterProps {
  players: Player[];
  canReset: boolean;
  onReset: () => void;
}

const INKWEAVE_URL = "https://inkweave.ink";

export function PageFooter({ players, canReset, onReset }: PageFooterProps) {
  const totalPulls = players.reduce((sum, p) => sum + p.pulls.length, 0);
  const canShare = totalPulls > 0;

  return (
    <footer className="page-footer">
      <span className="footer-credit">
        Built on the{" "}
        <a
          href={INKWEAVE_URL}
          target="_blank"
          rel="noopener"
          className="footer-link"
        >
          Inkweave
        </a>{" "}
        system
      </span>
      <div className="footer-actions">
        <ShareResults players={players} canShare={canShare} />
        {canReset && (
          <button
            type="button"
            className="reset-btn"
            onClick={onReset}
            title="Reset everything"
          >
            Reset all
          </button>
        )}
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Update `App.tsx` to pass `players` into the footer**

Find the existing `<PageFooter ... />` usage in `src/App.tsx` and change it to:

```tsx
<PageFooter
  players={players}
  canReset={players.length > 0}
  onReset={() => {
    if (window.confirm("Reset everything? This clears all players and pulls.")) {
      dispatch({ type: "RESET_ALL" });
    }
  }}
/>
```

- [ ] **Step 4: Append footer action styles to `src/styles/scorebox.css`**

```css
/* Group the footer-right actions so Share + Reset sit cleanly together */
.footer-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.share-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 16px;
  border-radius: var(--r-lg);
  background: var(--c-filter-gradient);
  color: var(--c-filter-text);
  border: none;
  font-family: var(--font-body);
  font-size: var(--fs-md);
  font-weight: 600;
  letter-spacing: 0.4px;
  cursor: pointer;
  box-shadow: var(--shadow-filter);
  transition: transform 0.2s var(--ease-snappy);
}
.share-trigger:hover { transform: scale(1.03); }
.share-trigger:focus-visible {
  outline: 2px solid var(--c-primary-500);
  outline-offset: 3px;
}
```

- [ ] **Step 5: Verify the build still passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 6: Commit**

```bash
git add src/components/ShareResults.tsx src/components/PageFooter.tsx src/App.tsx src/styles/scorebox.css
git commit -m "Wire Share results trigger into PageFooter"
```

---

## Task 14: Manual cross-device QA via Chrome DevTools MCP

**Files:**
- None (potential touch-ups to CSS/copy based on findings)

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Wait for `dev live at http://localhost:5173/`.

- [ ] **Step 2: Open in Chrome DevTools MCP, seed two players + pulls**

Navigate to the app, add two players, give each a few pulls of varying rarities. Confirm the **Share results** button appears in the footer.

- [ ] **Step 3: Open the modal and inspect the preview**

Click "Share results". Verify:
- Modal opens with the recap visible (scaled to fit modal width)
- Champion shown with crown + gold gradient name + giant score + biggest-pull chip
- Runners-up listed below with rank, name, score, top-pull tag
- Inkweave Scorebox brand mark at the bottom
- Dates formatted as e.g. "MAY 15, 2026"

- [ ] **Step 4: Test the three action buttons**

On desktop: click **Copy image**, paste into Discord/Messenger/Slack — verify the PNG arrives intact. Click **Download** — verify PNG file is saved with correct filename `scorebox-YYYY-MM-DD.png`.

On a mobile preview (DevTools device emulation or a real phone): click **Share** — verify the native share sheet appears with the file attached.

- [ ] **Step 5: Verify rendering edge cases**

Set up 1 player only — confirm hero card renders without the divider/list. Set up 5+ players — confirm the list packs without overflow. Force a tie at the top — confirm both top players share rank 1.

- [ ] **Step 6: Console clean check**

Open DevTools console. Trigger the modal. Confirm no warnings or errors during PNG generation.

- [ ] **Step 7: Note any tweaks and apply**

If anything looks off (font baselines in the PNG, padding, ranked-row truncation on long names), patch `src/components/ShareableRecap.tsx` or `src/styles/scorebox.css` and commit.

- [ ] **Step 8: Final commit if tweaks were needed**

```bash
git add <touched files>
git commit -m "Share results: post-QA polish"
```

---

## Self-Review Notes

Spec coverage check:
- Footer trigger gated on ≥1 pull → Task 13 (`canShare = totalPulls > 0`)
- 1080×1080 PNG output → Task 8 (`generateRecapPng` width/height) + Task 10 (`.shareable-recap` fixed dimensions)
- Mobile Web Share API → Task 7 + Task 11 (button gated on `isWebShareSupported`)
- Desktop Copy + Download → Task 5, Task 6, Task 11
- Hero champion + ranked list → Task 9 + Task 10
- Brand mark + URL on image → Task 9 + Task 10
- No data model changes → confirmed (no reducer/state modifications)
- a11y (role=dialog, esc, scroll lock) → Task 11
- Reduced motion handling → not explicitly added; modal animations are short (0.18s/0.28s) and inherit existing app behavior; if desired, add a `@media (prefers-reduced-motion: reduce)` block to Task 12 styles later.
- Edge case "1 player only" → covered by `recap.rest.length > 0` guard in Task 9, validated in Task 14 step 5.
- Edge case "tie at top" → `buildRecap` returns the first tied player as champion; the spec accepted this behavior implicitly. If the user wants visually-stacked tied champions, that's a follow-up.

Type consistency check:
- `RecapPlayer.topPull: Rarity | null` consistent across recap.ts, ShareableRecap.tsx, ShareResultsModal.tsx.
- `generateRecapPng(node: HTMLElement): Promise<Blob>` consistent across share.ts callsites.
- `isWebShareSupported(): boolean` used uniformly to gate the Share button.

Placeholder scan: no TBDs, no "implement later", every code step contains complete code.
