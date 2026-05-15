# Share Results — End-of-Game Recap

## Goal

After a group finishes opening a Lorcana booster box, let any player at the table tap a single button and share a ceremonial recap of the final scores — into their group chat, story feed, or wherever they're already talking about the box opening. The artifact is a beautiful, brand-aligned PNG that reads as "this is the moment", not "here's a screenshot of an app".

Primary audience: 2–6 friends opening a box together, mostly looking at this on a phone. Secondary: the scorekeeper friend on a laptop who wants to drop the result into Discord/Slack.

## User flow

1. Game wraps. At least one player has at least one pull recorded.
2. A **Share results** button appears in the page footer next to **Reset all** (the existing pairing of "end-of-game" actions).
3. Tap **Share results** → a modal opens showing the ceremonial recap exactly as it will appear in the shared image.
4. The modal footer presents action buttons, contextually:
   - **Mobile / Web Share API supported:** `[Share]` (primary) · `[Copy]` · `[Download]`
   - **Desktop / no Web Share:** `[Copy image]` (primary) · `[Download]`
5. **Share** → invokes `navigator.share({ files: [pngFile], title, text })` → native iOS/Android share sheet. User picks WhatsApp / Messages / Instagram / etc and sends the image directly.
6. **Copy image** → writes the PNG to the system clipboard via `navigator.clipboard.write`. A brief toast confirms ("Copied — paste anywhere"). User switches to Discord/Messenger/Slack and pastes.
7. **Download** → standard browser file save (PNG, filename like `scorebox-2026-05-15.png`). User attaches it manually.
8. Modal closes on Esc / backdrop click / explicit close button.

The same generated PNG fuels all three actions — generated once on modal open, cached for the lifetime of the modal.

## Visual design

### Aspect ratio

**1080 × 1080 square.** Renders at near-full-size in every relevant chat app (Discord, WhatsApp, Messenger, iMessage, Telegram, Twitter, Instagram feed, Slack). No aspect-ratio cropping controversy across platforms. Fits the hero champion plus 4–5 ranked rows comfortably. For 6+ players the ranked-row gap and font size shrink proportionally rather than overflowing.

### Layout

```
┌──────────────────────────────────────┐
│        BOX OPENING · MAY 15, 2026    │  eyebrow + date
│                                      │
│                ♛                     │  crown
│            [WINNER NAME]             │  Tinos, gold gradient
│                                      │
│                78                    │  huge score, gold gradient
│         points · 12 pulls            │
│                                      │
│    ┌──────────────────────────────┐  │
│    │  [icon]  BIGGEST PULL        │  │  callout chip
│    │          Iconic    +25 pts   │  │
│    └──────────────────────────────┘  │
│                                      │
│  ──────────────────────────────────  │  divider
│                                      │
│  2ND   Bea       65   Foil Leg +8    │  compact ranked rows
│  3RD   Cyrus     63   Iconic   +25   │
│                                      │
│  ──────────────────────────────────  │
│                                      │
│         INKWEAVE SCOREBOX            │  brand mark
│        scorebox.inkweave.ink         │  attribution URL
└──────────────────────────────────────┘
```

### Visual vocabulary

- **Surface:** the same near-black background plus the four soft glow orbs (blue / purple / amber / teal) that the live app uses. Reuses the existing `.glow-field` styling but rendered into the snapshot.
- **Champion treatment:** reuses the existing leader-card vocabulary — gold border, gold gradient name (`#faf1d3 → #d4af37 → #b29861`), gold gradient score, crown glyph. No new visual language invented.
- **Champion biggest-pull callout:** small chip with the rarity icon (foil overlay if applicable), the full rarity name, and `+points` in Tinos serif.
- **Ranked rows:** rank label (`2ND`, `3RD`, …), player name in Tinos, score in tabular-nums, and the player's top pull as a small inline tag (rarity icon + `+points`).
- **Typography:** Plus Jakarta Sans for UI text; Tinos for names + score numbers (same split as the live app).
- **Brand mark:** "INKWEAVE SCOREBOX" wordmark — small, gold-tinted — plus `scorebox.inkweave.ink` underneath so anyone seeing the image knows where it came from.

### What's NOT on the image

- Per-player rarity counts (clutter)
- Total combined pulls across the group (irrelevant to recipients)
- Leader margin numbers (the recap reads as a celebration, not a stats table)
- Game duration / timestamps beyond the date
- QR code (skipped because we're not building stored recap URLs in V1)

## Trigger placement & gating

- Button label: **"Share results"**
- Location: page footer, immediately before the existing `Reset all` button (left of it, since "Share" is more positive than "Reset")
- Visibility: same threshold as `Reset all` — visible when `players.length > 0 AND total pulls across all players ≥ 1`
- Disabled state: never disabled when visible (if it's visible, there's something worth sharing)

No new "game complete" / "finish box" state added to the data model. The current app has no concept of a game ending — users just stop tapping rarities and either Share or Reset. We preserve that.

## Component structure

```
src/components/
├── ShareResults.tsx          NEW — wraps the trigger button + the modal lifecycle
├── ShareResultsModal.tsx     NEW — the dialog: shows ShareableRecap + action buttons
├── ShareableRecap.tsx        NEW — the 1080×1080 DOM template that gets snapshotted
├── PageFooter.tsx            MODIFIED — accept onShare prop, render the Share button
└── ...
src/lib/
├── recap.ts                  NEW — pure functions: pick champion, ranked list, biggest pull per player
└── share.ts                  NEW — generatePng(node), shareViaWebShare, copyToClipboard, downloadPng
```

### `ShareResults.tsx`

Owns the modal-open state. Renders the footer button and conditionally the modal. Receives `players: Player[]` as the only prop. Computes the `Recap` data on demand (cheap; no need to persist).

### `ShareResultsModal.tsx`

Props: `{ recap: Recap; onClose: () => void }`.
- Renders `<ShareableRecap recap={recap} />` inside a positioned wrapper sized exactly to 1080×1080 (CSS will scale it down to fit the viewport via `transform: scale(...)`).
- Below it: action buttons (Share / Copy / Download), feature-detected.
- On mount: generates the PNG once, caches the `Blob` in local state.
- On action click: passes the cached blob to the right `share.ts` helper.
- a11y: `role="dialog"`, `aria-modal="true"`, Esc to close, body scroll lock (reuses the existing `useBodyScrollLock` hook).

### `ShareableRecap.tsx`

The pure visual template. Props: `{ recap: Recap }`. Renders the layout in the screenshot above using existing design tokens. Critically, this component is ALWAYS rendered at native 1080×1080 (no responsive resizing within the component), and the modal handles fit-to-viewport via outer scale. This guarantees the rendered PNG matches what the user sees exactly.

### `recap.ts`

```ts
export interface RecapPlayer {
  rank: number;          // 1, 2, 3 — dense rank, ties share
  name: string;
  score: number;
  pullCount: number;
  topPull: Rarity | null;       // highest-points pull they made; null only if they have 0 pulls
}

export interface Recap {
  date: Date;            // when the recap was generated
  champion: RecapPlayer | null;   // first place, gets the hero treatment; null if score === 0
  rest: RecapPlayer[];   // everyone else, already sorted by rank
}

export function buildRecap(players: Player[]): Recap;
```

Pure function, no side effects. Reuses the existing `computeScoreboard` helper, layers on the "biggest pull per player" computation.

### `share.ts`

```ts
export async function generateRecapPng(node: HTMLElement): Promise<Blob>;
export function isWebShareSupported(): boolean;
export async function shareViaWebShare(blob: Blob, filename: string): Promise<void>;
export async function copyImageToClipboard(blob: Blob): Promise<void>;
export function downloadBlob(blob: Blob, filename: string): void;
```

Pure utility module — no React, fully unit-testable. PNG generation uses the `html-to-image` package (small, ~50KB, well-maintained, handles SVG + custom fonts cleanly). `isWebShareSupported` runs the strict feature detect: `'share' in navigator && navigator.canShare?.({ files: [new File([], 'x.png', { type: 'image/png' })] })`.

## Data model changes

**None.** Every value on the recap is derived from the existing `Player[]` state. No new persistence, no new reducer actions, no schema bump.

## Image rendering

Library: **`html-to-image`** (`npm i html-to-image`).

Rationale over alternatives:
- `html2canvas` — older, doesn't handle SVG masks (used in our foil-icon overlays) as cleanly.
- Native canvas API — would require manually replicating layout in canvas drawing calls. Painful and brittle.
- `domtoimage` / `react-to-image` — wrappers around the same approach but with less active maintenance.

Approach:
1. Render `<ShareableRecap>` into an off-screen-friendly DOM node at native 1080×1080.
2. Call `htmlToImage.toBlob(node, { width: 1080, height: 1080, pixelRatio: 1 })` → `Blob`.
3. Wait for fonts to load before generating (`document.fonts.ready`) so Plus Jakarta Sans + Tinos render correctly in the PNG.
4. Cache the blob in modal state; reuse it across Share / Copy / Download clicks.

The modal shows a brief skeleton/loading state while the PNG generates (typically <500ms on modern hardware).

## Share mechanisms — detail

### `navigator.share` (mobile / supported desktops)

```ts
await navigator.share({
  files: [new File([blob], 'scorebox-recap.png', { type: 'image/png' })],
  title: 'Scorebox — Box Opening Recap',
  text: '<Champion> won with <score> points',
});
```

Detection uses `canShare({ files: [...] })` rather than just `'share' in navigator` so we correctly skip browsers that have a stub `share` but no file support.

### Clipboard copy

```ts
const item = new ClipboardItem({ 'image/png': blob });
await navigator.clipboard.write([item]);
```

After resolution, a 2s toast announces "Copied — paste anywhere". On failure (rare: corporate browser, Firefox <127), we fall back to the Download path automatically and inform via the toast.

### Download

```ts
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `scorebox-${YYYY-MM-DD}.png`;
a.click();
URL.revokeObjectURL(url);
```

Filename uses ISO-style date for sortability when users build a recap collection over time.

## Edge cases

| Scenario | Behavior |
|---|---|
| 1 player | Hero champion only, no ranked rows. Divider hidden. Layout balances by extra vertical padding. |
| 2 players | Hero champion + 1 ranked row. |
| 3+ players | Standard layout. |
| Tie at top | Both players share rank 1. Hero block shows them stacked with the same "1ST · TIED" label. Crown stays. |
| All zero pulls | Share button is hidden (gating threshold). `Recap.champion === null` is therefore unreachable from the UI but the type is nullable for defensive programming. |
| Champion has 0 pulls | Defensive: if somehow reached, the callout chip is omitted instead of rendering a placeholder. |
| Font loading delay | We wait on `document.fonts.ready` before snapshotting; worst case adds ~200ms to the modal open. |
| Clipboard write rejected by browser | Toast says "Couldn't copy — saving instead", trigger Download as fallback. |
| Web Share rejected (user dismisses share sheet) | No-op. The share sheet's dismissal is a normal cancellation, not an error. |

## Accessibility

- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the recap title.
- Focus trap: focus moves into the modal on open, returns to the trigger button on close.
- Esc closes; backdrop click closes.
- Action buttons have explicit `aria-label`s (e.g., "Copy recap image to clipboard").
- The recap PNG itself has an `alt` description on the in-DOM preview: "Final scores: champion <name> with <score> points; <N> players total."
- Reduced motion: any transitions in the modal respect `prefers-reduced-motion: reduce` (skip the entrance scale-up, keep the fade).

## Testing

Unit tests (Vitest):
- `buildRecap` — pure function, exercise champion selection, ranking, biggest-pull-per-player, tie cases.
- `share.ts` helpers — wrap `navigator.share` / `navigator.clipboard` / DOM download in injectable dependencies so each can be tested without a real browser environment.

Manual / live testing once built:
- Run on mobile via Vercel preview URL; share to WhatsApp, iMessage, Instagram Stories.
- Run on desktop Chrome + Firefox + Safari; verify Copy and Download work in each.
- Compare PNG rendering to the in-modal preview visually — they should be pixel-identical at 1080×1080.

## Out of scope

- Stored recap URLs (`scorebox.inkweave.ink/r/<id>`) with backend persistence. Solid sequel feature, not V1.
- Animated reveal (3rd → 2nd → 1st with crown drop). Stretch goal post-V1.
- "Box-specific" metadata (which set was opened, when, where). No data model for it today.
- Per-player rarity count breakdowns on the share image (would clutter; the user explicitly de-scoped).
- OG image / link-unfurl previews. Tied to stored recap URLs; out of V1.
- Multiple aspect ratios (square + portrait + landscape variants). One canonical 1:1 ships first; we can add a portrait variant for Stories later if it's requested.
- Custom share text or hashtags. The Web Share `text` field is fixed; users can edit before sending.

## Open questions

None remaining. All decisions confirmed during the brainstorming dialogue.

## Estimated scope

~1 day of focused implementation:
- ~2h: `recap.ts` + tests + `ShareableRecap.tsx` static render
- ~2h: `ShareResultsModal.tsx` + footer wiring + a11y
- ~2h: `share.ts` (PNG generation + Web Share + Copy + Download) + tests
- ~2h: design polish, edge cases, manual cross-device QA on the Vercel preview
