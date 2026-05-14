import { useState, type CSSProperties } from "react";
import { RARITIES } from "@/data/rarities";

type IconCSSVars = CSSProperties & { "--icon-url"?: string };

export function Legend() {
  const [open, setOpen] = useState(false);
  const sorted = [...RARITIES].sort((a, b) => a.points - b.points);

  return (
    <aside className={"legend " + (open ? "is-open" : "is-collapsed")}>
      <button
        type="button"
        className="legend-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="legend-title-block">
          <span className="legend-title">Scoring rubric</span>
          <span className="legend-sub">{open ? "Points per pull" : "Tap to view"}</span>
        </span>
        <span className="legend-caret" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <ul className="legend-list">
          {sorted.map((r) => {
            const iconStyle: IconCSSVars = { "--icon-url": `url("${r.icon}")` };
            return (
              <li key={r.id} className={`legend-item ink-${r.ink}${r.foil ? " is-foil" : ""}`}>
                <span className="legend-icon-wrap" style={iconStyle}>
                  <img src={r.icon} alt="" className="legend-icon" />
                  {r.foil && (
                    <>
                      <span className="foil-holo foil-holo-sm" aria-hidden="true" />
                      <span className="foil-shine foil-shine-sm" aria-hidden="true" />
                    </>
                  )}
                </span>
                <span className="legend-name">{r.name}</span>
                <span className="legend-pts">{r.points}</span>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
