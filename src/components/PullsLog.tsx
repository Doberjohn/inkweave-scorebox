import { type CSSProperties } from "react";
import { RARITY_BY_ID } from "@/data/rarities";
import type { Pull } from "@/types";

type IconCSSVars = CSSProperties & { "--icon-url"?: string };

interface PullsLogProps {
  pulls: Pull[];
  layout: "inline" | "modal";
  onUndo: (pullId: string) => void;
}

const INLINE_LIMIT = 8;

export function PullsLog({ pulls, layout, onUndo }: PullsLogProps) {
  if (pulls.length === 0) {
    const emptyText = layout === "modal"
      ? "No pulls yet — close this and tap a rarity to start."
      : "No pulls yet — tap a rarity above when something hits the table.";
    return <div className="pulls-empty">{emptyText}</div>;
  }

  const recent = [...pulls].sort((a, b) => b.t - a.t);
  const visible = layout === "inline" ? recent.slice(0, INLINE_LIMIT) : recent;
  const overflow = layout === "inline" ? recent.length - visible.length : 0;

  return (
    <ul className={"pulls-list" + (layout === "modal" ? " pulls-list-modal" : "")}>
      {visible.map((p) => {
        const r = RARITY_BY_ID[p.rarity];
        const iconStyle: IconCSSVars = { "--icon-url": `url("${r.icon}")` };
        return (
          <li key={p.id} className={`pull-item ink-${r.ink}${r.foil ? " is-foil" : ""}`}>
            <span className="pull-icon-wrap" style={iconStyle}>
              <img src={r.icon} alt="" className="pull-icon" />
              {r.foil && (
                <>
                  <span className="foil-holo foil-holo-sm" aria-hidden="true" />
                  <span className="foil-shine foil-shine-sm" aria-hidden="true" />
                </>
              )}
            </span>
            <span className="pull-name">{r.name}</span>
            <span className="pull-pts">+{r.points}</span>
            <button
              type="button"
              className="pull-undo"
              onClick={() => onUndo(p.id)}
              aria-label={`Undo ${r.name} pull`}
              title="Undo this pull"
            >
              ×
            </button>
          </li>
        );
      })}
      {overflow > 0 && (
        <li className="pulls-more" aria-label={`${overflow} more pulls not shown`}>
          + {overflow} more…
        </li>
      )}
    </ul>
  );
}
