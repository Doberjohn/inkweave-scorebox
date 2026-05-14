# Screenshots

These captures show the prototype rendered in the preview pane at ~915px width — which is the **tablet** breakpoint (the design switches to tablet layout at ≤1024px). The other breakpoints (desktop ≥1025px, mobile ≤720px) aren't shown here as static images; instead, open `Responsive Preview.html` from the bundle root in any browser to see all three live side-by-side, or just open `Scorebox.html` and resize the window.

## Captures

- **01-overview.png** — Page top: brand + "Scorebox" label, hero ("Score the *box*"), add-player form, collapsed scoring rubric pill, and the start of the 2-column player grid.
- **02-rubric-expanded.png** — Same view with the scoring rubric clicked open, showing every rarity with its icon and points value in a 4-column grid.
- **03-player-cards.png** — Scrolled to the player cards. Shows:
  - Rarity tally buttons with ink-tinted active state (counts in the gold pill)
  - **Iconic** button glowing gold when active (count 2)
  - Leader card "George" with rank `1ST`, crown, gold gradient score
  - "Recent pulls" modal trigger (the bar at the bottom of each card on tablet/mobile)
  - **Foil** icons rendering with their holographic shimmer overlay

## Layouts not captured

| Breakpoint | What changes | How to view |
|---|---|---|
| **Desktop ≥1025px** | 2-column top row: hero left + sticky scoring sidebar right. Players grid `auto-fill, minmax(380px, 1fr)`. Recent pulls inline (no modal). | Open `Scorebox.html` on a desktop browser. |
| **Mobile ≤720px** | Single-column players. Rarity grid becomes 4×2 icon-only tiles with count badges in the corner. Pulls modal trigger same as tablet. | Resize browser, or open Chrome DevTools device toolbar at 390×800. |
| **Pulls modal (tablet+mobile)** | Bottom-sheet panel with full pull list, undo on each row, "Clear all" + "Done" footer. | Tap the "Recent pulls" bar on any player card. Closes on backdrop click or Esc. |
