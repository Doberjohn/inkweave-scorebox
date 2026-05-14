# Handoff: Lorcana Scorebox

## Overview
A single-page scoring tool for friends opening a Lorcana booster box together. Each player at the table gets a card; when somebody pulls a hit, you tap the corresponding rarity to add points to their tally. The board updates live, the leader's card glows gold, and a collapsible sidebar shows the scoring rubric.

The scoring system:

| Rarity            | Points |
|-------------------|-------:|
| Foil Rare         |      1 |
| Super Rare        |      2 |
| Foil Super Rare   |      4 |
| Legendary         |      4 |
| Epic              |      5 |
| Foil Legendary    |      8 |
| Enchanted         |     12 |
| Iconic            |     25 |

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. The task is to **build a new standalone app** in the Inkweave ecosystem (a separate site like `scorebox.inkweave.ink` or a subroute of the marketing site — the human will tell you which) that recreates these designs. The prototype uses React 18 + Babel-standalone for in-browser convenience; **the production app should use Vite + React 19 + TypeScript** with a normal build pipeline.

This is a **new app**, not a feature inside the existing Inkweave web codebase. It should feel like part of the Inkweave family (same brand, same design system, same fonts), but live in its own repository / deployment.

## Fidelity
**High-fidelity.** Pixel-perfect mocks with final colors, typography, spacing, interactions, animations, and three responsive breakpoints. Recreate the UI faithfully. Since this is a standalone app, the design tokens and fonts vendored in this bundle (`colors_and_type.css`, `fonts/`) are the source of truth — pull them in directly rather than waiting on an external design-system package. If/when an Inkweave shared design-system package gets published, swap to that.

## Recommended setup
- **Framework:** Vite + **React 19** + TypeScript.
- **Routing:** Single page — no router needed unless you want a `/help` or `/about` route later.
- **State:** Local state + `localStorage` only. No backend.
- **Styling:** Plain CSS with the design tokens from `colors_and_type.css`, or migrate to CSS Modules / vanilla-extract / Tailwind matching the rest of the Inkweave ecosystem. **Do not** invent a new design language.
- **Hosting:** Whatever Inkweave currently uses (Vercel / Netlify / Cloudflare Pages) — static deploy, no server needed.
- **Domain suggestion:** `scorebox.inkweave.ink` subdomain, or `inkweave.ink/scorebox` if hosted from the main site's CDN.

### React 19 notes
- The reference `app.jsx` is written against React 18 (uses `ReactDOM.createRoot`, `useState`, `useEffect`, `useMemo`, `useRef`). All of that works unchanged on React 19. No code in the prototype relies on legacy class APIs, `findDOMNode`, string refs, or anything deprecated in 19.
- You can lean on React 19 features where they help, but none are required:
  - `useOptimistic` could power the score-flash UI, but the current `useState`-based flash already feels great.
  - The new `<title>` / `<meta>` / `<link>` rendering inside components could replace manual `<Helmet>` for SEO.
  - The compiler (React Compiler) is optional — turn it on and you can drop most `useMemo` / `useCallback` calls.
- TypeScript: install `@types/react@^19` and `@types/react-dom@^19` (not `^18`).

## Design System
This page is built on the **Inkweave** design system (see `inkweave.ink`, `apps/web/src/shared/constants/theme.ts`). All tokens are in `colors_and_type.css` and mirror the codebase's `theme.ts`. Highlights the developer must respect:

- **Fonts:** Plus Jakarta Sans (variable, 200–800) for UI; Tinos (serif) for hero titles, player names, and big score numbers.
- **Background:** `#0d0d14` near-black, with four soft glow orbs (blue / purple / amber / teal) fixed behind everything.
- **Surfaces:** Dark glassy cards on `rgba(26,26,46,0.85)` with 10px backdrop-blur and a subtle border.
- **Accent / primary:** Gold (`#d4af37` / `#ffb900`) — leader glow, key numbers, CTAs.
- **Ink palette:** The six Lorcana factions (amber, amethyst, emerald, ruby, sapphire, steel) — used here to tint individual rarity buttons.
- **Iridescent foil treatment** for foil rarities — described under Interactions.

⚠️ **Do NOT enable `font-feature-settings: "ss01"` / `"cv11"`** on Plus Jakarta Sans — it swaps in alternate glyph forms that look like a different font and don't match the rest of the Inkweave site.

## Screens / Views

The entire feature is **one screen** with responsive variants. The page is composed of:

### 1. Page header
- **Brand row** (left): Inkweave wordmark SVG (30px tall), 1px vertical divider, "SCOREBOX" label in 13px Plus Jakarta Sans, uppercase, letter-spacing 2.8px, color `#90a1b9`.
- **No header stats.** (Earlier iterations had Pulls / Box total / Leader / Margin — they were removed; the per-card score is enough.)

### 2. Hero / add-player block (left column, max-width 760px)
- Eyebrow label: `CORE · BOX OPENING · LIVE TALLY` — 13px, letter-spacing 2.8px, color `#90a1b9`.
- Title: **"Score the *box*"** — Tinos 700, `clamp(40px, 5.5vw, 64px)`, line-height 1.15, letter-spacing −0.01em. The word "box" is italic with a left-to-right gradient `#faf1d3 → #d4af37 → #b29861`, background-clip: text. The trailing period was intentionally removed.
- Subhead: "Add everyone at the table. Tap a rarity when somebody pulls it. The board updates live and the leader gets the gold." — 16px, color `#cad5e2`, max-width 580px.
- **Add row** (max-width 540px):
  - Text input — `rgba(15,23,43,0.5)` background, `rgba(49,65,88,0.5)` 1px border, 8px radius, 12×16px padding, 14px Plus Jakarta Sans. Placeholder text changes: "First friend's name…" when empty, "Add another friend…" otherwise. Maxlength 24. Focus state: gold border + 3px gold halo.
  - Submit button (CTA primary): "+ Seat at table" — orange-gold gradient `#fe9a00 → #e17100`, dark text `#0f172b`, 8px radius, 44px min-height, drop shadow. Disabled when input is empty.

### 3. Legend / scoring rubric (right column on desktop, sticky, 320px wide)
**Desktop only:** Starts collapsed as a small pill — just "Scoring rubric" title + caret. Click to expand. On expand, shows the full rubric list, ordered low → high points.

**Each rubric row:** 22px icon (PNG, see Assets), rarity full name, points number in gold Tinos 14px tabular-nums on the right.

**Tablet / mobile:** Drops below the hero, can still be collapsed/expanded. When expanded on tablet, the items lay out in a 2-column grid.

### 4. Players grid
- **Desktop (≥1025px):** `auto-fill, minmax(380px, 1fr)` grid, 20px gap.
- **Tablet (≤1024px):** Fixed 2-column grid, 16px gap, slightly tightened card padding.
- **Mobile (≤720px):** Single column, 14px gap.

#### Player card
- Background: `linear-gradient(180deg, rgba(26,26,46,0.85), rgba(15,15,25,0.85))` with 10px backdrop-blur. 1px border `#333355`, 12px radius. Soft shadow.
- **Header area:**
  - Rank badge: `1ST / 2ND / 3RD / 4TH…` — 10px caps, color `#666680`, gold (`#d4af37`) when this card is the leader.
  - Crown glyph `♛` next to rank when leader (with gold drop-shadow).
  - `TIE` chip (gold pill) when multiple leaders share the top score.
  - Player name: Tinos 700, 26px, click-to-rename. Inline `<input>` swap on click; commit on Enter or blur, cancel on Esc, maxlength 24. Truncate with ellipsis.
  - Remove button (×): 28px circle, transparent → red on hover.
- **Score row:**
  - Big number: Tinos 700, 54px, tabular-nums. Leader's number uses the same `#faf1d3 → #ffb900 → #b29861` gold gradient as the hero accent.
  - Number animates on change: `transform: scale(1) → scale(1.18) → scale(1)` over 600ms with a drop-shadow gold glow at peak (`numflash` keyframe).
  - Label "points · N pull/pulls" — 12px, dim.
  - Beneath the label, if non-leader: `−N TO LEADER` — 10px caps, color `#666680`.
  - Tied for lead: `TIED FOR THE LEAD` — same size, gold.
- **Rarity grid (the eight tally buttons):**
  - **Desktop:** 2-column grid, 8px gap. Each button is 56px min-height, icon on the left (32px square), rarity name + points in a stacked text block.
  - **Tablet:** Same 2-column layout, slightly smaller (50px tall, 28px icon).
  - **Mobile:** 4×2 grid. Icon-only mode: rarity name hidden, just icon + small points label centered, count badge in the top-right corner.
  - Each button uses its ink palette tint (see Ink palette below) — visible only on hover and when active (count > 0).
  - **Count badge** (top-right of button): gold pill, only visible when count > 0, scales in via bounce easing.
  - **Press feedback:** Click triggers `is-pop` class for 250ms — 1.0 → 1.05 → 1.0 scale.
  - **Foil treatment** (Foil Rare, Foil Super Rare, Foil Legendary): the icon itself wears two stacked overlays clipped to its alpha via CSS `mask`:
    1. A 7-stop conic-style **rainbow film** (`#ff8fb1 → #c9a3ff → #8be9fd → #6ee7a0 → #ffd86b → #ffb86c → #ff8fb1`) panning across via background-position, `mix-blend-mode: overlay`, ~85% opacity, 4s linear loop.
    2. A **bright diagonal shine** sweep — `transparent → white(95%) → transparent`, `mix-blend-mode: screen`, sweeps across every ~2.6s. Underlying icon gets a soft warm `drop-shadow` for the gold halo.
- **Recent pulls log:**
  - **Desktop:** Inline list, max-height 200px, scrollable. Each row: ink-tinted left border, small rarity icon (20px, with foil overlay if applicable), rarity name, `+points` in gold, `×` undo button (appears on hover). Animates in via `pullIn` keyframe. Shows up to 8 most recent + `+ N more…` line.
  - **Tablet & mobile:** Inline log is hidden; instead a button "Recent pulls · N · ›" opens a bottom-sheet modal with the full list (see Modal below).

### 5. Pulls modal (tablet + mobile)
- Bottom-sheet style. Backdrop is `rgba(8,8,14,0.7)` with 6px blur, fade-in 180ms.
- Sheet: gradient `#1a1a2e → #0f0f19`, top-only 18px radius, max-width 560px, max-height 86vh. Slide-up entry 280ms with bounce easing.
- Header: small "RECENT PULLS" eyebrow, player name in Tinos 26px, then `score` in Tinos 28px gold + "pts · N pulls" muted.
- Body: full pull list (not truncated). Each row 24px icon, rarity name, `+points`, undo button.
- Footer: "Clear all pulls" (text button, hover red) + "Done" CTA.
- **Esc** closes; backdrop click closes.
- **Critical:** scroll-lock must gate on `player` being non-null. A naive `useEffect` that sets `body.overflow = "hidden"` on mount will lock the page permanently. See `app.jsx` for the correct gated form.

### 6. Page footer
- Single border-top divider.
- Left: credit line "Built on the Inkweave system · Lorcana Core · scores persist locally".
- Right: "Reset all" — ghost-style button, hover red. Only rendered when at least one player exists. Calls `confirm()` before wiping.

### 7. Empty state
- Soft blurred amber orb (radial gradient) at the top.
- Title "The table is empty." (Tinos 28px).
- Subhead "Add your first friend above to start scoring the box."
- Ghost CTA "Try with 3 demo players" — seeds three blank players.
- Dashed border, transparent gradient background.

## Interactions & Behavior

### Adding players
- Form is at the top. Type → enter or click "Seat at table" → empty input refocuses immediately so you can keep typing names.
- Empty / whitespace-only submissions are ignored. Submit button disables when input is empty.

### Renaming
- Click the player's name → swaps to an inline input. Enter commits, Esc cancels, blur commits.

### Adding a pull
- Click any rarity button on the relevant player's card → that rarity's count increments, the player's score animates, the pull is prepended to their log.

### Undoing a pull
- Click the `×` on any item in the recent-pulls list (or in the modal).

### Removing a player
- `×` in the player card header. No confirm.

### Reset all
- Footer button → browser `confirm()` → clears all state. Only visible when players exist.

### Leader highlighting
Compute the maximum score across players. Any player whose score equals that max (and max > 0) is a "leader":
- Gold border on the card.
- Gold radial-gradient bloom from the top of the card.
- Player name and score number use the gold gradient.
- Rank badge gets the crown glyph.
- If >1 leader, every leader's card gets `TIE` chip + "TIED FOR THE LEAD" label.

### Margin display per card
Each non-leader card shows `−N TO LEADER` under their score, where N = `topScore - thisScore`.

### Rarity sort order
Always render rarity buttons in this fixed order (left-to-right, top-to-bottom): Foil Rare, Super Rare, Foil Super Rare, Legendary, Epic, Foil Legendary, Enchanted, Iconic. The Legend list sorts low→high by points.

### Animations & easing
The Inkweave system defines three custom easings as `linear()` curves:
- `--ease-bounce` — gentle overshoot, used for score number flash and tap pops.
- `--ease-snappy` — quick, slight overshoot — used for hover transitions on buttons.
- `--ease-smooth` — no overshoot — fades and color transitions.

Specific animations:
- `numflash` — 600ms on score change (scale + drop-shadow glow peak).
- `pullIn` — 300ms when a new pull lands in the log (slide-in from left + fade).
- `rarityPop` — 280ms on rarity button click (scale bump).
- `foilHoloPan` — 4s linear infinite, pans rainbow film across foil icons.
- `foilShineSweep` — 2.6s ease-in-out infinite, diagonal shine across foil icons.
- `modalFade` / `modalSlide` — modal entry.

## State Management

```ts
type Pull = {
  id: string;           // crypto.randomUUID()
  rarity: RarityId;     // see RARITIES table
  t: number;            // Date.now() — used to sort recent pulls
};

type Player = {
  id: string;
  name: string;
  pulls: Pull[];
};

type State = {
  players: Player[];
  pullsModalId: string | null;   // which player's modal is open (tablet/mobile)
};
```

- Persist `players` to `localStorage` under key `"lorcana-scorebox-v1"` on every change.
- On boot: read from localStorage; if absent, seed 3 demo players with a few sample pulls so the empty state isn't lonely.

## Design Tokens

All tokens live in `colors_and_type.css` (mirrored from the Inkweave codebase's `theme.ts`).

### Colors
- `--c-bg: #0d0d14`
- `--c-surface: #1a1a2e`
- `--c-surface-hover: #252540`
- `--c-surface-alt: #151525`
- `--c-surface-border: #333355`
- `--c-primary: #ffb900`
- `--c-primary-500: #d4af37` (canonical brand gold)
- `--c-text: #e8e8e8`
- `--c-text-muted: #90a1b9`
- `--c-text-dim: #666680`
- `--c-text-desc: #c8c8d8`
- `--c-error: #ef4444`

**Ink palette (Lorcana factions — each has bg / text / border):**
- Amber: `#3d2e10 / #f5c542 / #f59e0b`
- Amethyst: `#2a1a45 / #c4a5f5 / #8b5cf6`
- Emerald: `#0f2e1f / #6ee7a0 / #10b981`
- Ruby: `#3d1515 / #f87171 / #ef4444`
- Sapphire: `#0f1e3d / #7db5f5 / #3b82f6`
- Steel: `#252530 / #a0a0b0 / #6b7280`

**Glow orbs (fixed background):**
- Blue 22%: `rgba(43,127,255,0.22)` — top-left, 520px
- Purple 20%: `rgba(173,70,255,0.20)` — middle-right, 620px
- Amber 12%: `rgba(212,175,55,0.12)` — bottom 30% from left, 480px
- Teal 10%: `rgba(0,187,167,0.10)` — bottom-right, 400px
- All filtered with `blur(70px)`.

### Type scale
| Token | Size | Use |
|---|---|---|
| `--fs-xs` | 10px | badges, tiny labels |
| `--fs-sm` | 11px | small labels, metadata |
| `--fs-md` | 12px | compact labels |
| `--fs-base` | 13px | most UI text |
| `--fs-lg` | 14px | form inputs |
| `--fs-xl` | 16px | section headings |
| `--fs-xxl` | 20px | card titles |
| `--fs-display` | `clamp(40px, 7vw, 96px)` | hero |

### Radii
| Token | Size |
|---|---|
| `--r-sm` | 4px |
| `--r-md` | 6px |
| `--r-lg` | 8px |
| `--r-card` | 12px |
| `--r-chip` | 20px |

### Shadows
- `--shadow-card: 0 2px 6px rgba(0,0,0,0.30)`
- `--shadow-glow-gold: 0 0 12px rgba(255,185,0,0.15), inset 0 0 8px rgba(255,185,0,0.05)`
- `--shadow-filter` for primary CTA: `0 10px 15px 0 rgba(254,154,0,0.2), 0 4px 6px 0 rgba(254,154,0,0.2)`

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| **Desktop (≥1025px)** | 2-column top row (hero + sticky rubric sidebar). Player cards in auto-fill grid with 380px min. Rarity buttons 2-column inside each card. Recent pulls inline. |
| **Tablet (≤1024px)** | Rubric stacks below hero. Players grid fixed 2-column. Cards slightly more compact. Recent pulls in modal. |
| **Mobile (≤720px)** | Single-column players. Rarity buttons collapse to 4×2 icon-only grid. Add row stacks vertically. Pulls in modal. |
| **Small mobile (≤540px)** | Modal title shrinks; modal still bottom-sheet. |

The included `Responsive Preview.html` renders all three side-by-side at fixed widths so layout is easy to QA.

## Assets

All assets are PNG/SVG, in the `assets/` folder.

### Brand
- `logo.svg` — Inkweave wordmark (from existing brand system; keep the original on the production site).
- `logo-animated.svg` — animated variant, not used here.

### Rarity icons
- `rarity-rare.png`
- `rarity-super-rare.png`
- `rarity-legendary.png`
- `rarity-epic.png`
- `rarity-enchanted.png`
- `rarity-iconic.png`

Foil variants reuse the corresponding base icon (same symbol shape, the foil treatment is purely a CSS overlay).

### Ink faction icons (decorative, currently unused on this screen but in the design system)
- `ink-amber.svg`, `ink-amethyst.svg`, `ink-emerald.svg`, `ink-ruby.svg`, `ink-sapphire.svg`, `ink-steel.svg`

## Files

- **`Scorebox.html`** — main prototype; load this for the actual UI.
- **`Responsive Preview.html`** — composes the prototype in three iframes at desktop / tablet / mobile widths.
- **`screenshots/`** — static captures + a README explaining what they show. Note: the iframe-based Responsive Preview can't be screenshotted reliably; open it in a real browser instead.
- **`app.jsx`** — all React component logic (Header, Hero, Legend, PlayerCard, RarityButton, PullsModal, App).
- **`styles.css`** — page-specific styles. Extends `colors_and_type.css`.
- **`colors_and_type.css`** — Inkweave design tokens + base typography. **This file mirrors `apps/web/src/shared/constants/theme.ts` in the production codebase — prefer the codebase's tokens over these.**
- **`fonts/`** — Plus Jakarta Sans VF + Tinos vendored (OFL).
- **`assets/`** — logo, rarity icons, ink icons.

## Notes for the implementer

1. **Use the Inkweave design language.** Tokens, fonts, color palette, glow-orb background, gold accents — all should match the rest of the Inkweave ecosystem. The vendored `colors_and_type.css` mirrors `apps/web/src/shared/constants/theme.ts` from the main Inkweave codebase and is safe to use directly in this new app.
2. **Storage key** is `lorcana-scorebox-v1` — bump the version if the schema changes.
3. **No backend.** Pure client-side, localStorage-persisted. Multi-device sync was discussed but not designed.
4. **Accessibility:** All interactive elements are real `<button>`s with `title` attributes. Modal has `role="dialog"` + `aria-modal="true"` + Esc handler. Confirm form labels and `aria-label`s when porting.
5. **Don't enable Plus Jakarta Sans stylistic sets** (`ss01`, `cv11`). They change letterform designs and the result doesn't match the rest of inkweave.ink. Default glyphs only.
6. **SEO / Social:** As a standalone site, the app needs its own `<title>`, meta description, favicon (use `assets/logo.svg`), and a simple OG image. Suggested title: "Scorebox — Score your Lorcana booster box opening, live".
