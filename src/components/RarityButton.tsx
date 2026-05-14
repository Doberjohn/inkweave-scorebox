import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Rarity } from "@/types";

type IconCSSVars = CSSProperties & { "--icon-url"?: string };

interface RarityButtonProps {
  rarity: Rarity;
  count: number;
  onClick: () => void;
}

export function RarityButton({ rarity, count, onClick }: RarityButtonProps) {
  const [pop, setPop] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  function handle() {
    setPop(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setPop(false), 250);
    onClick();
  }

  const className =
    "rarity-btn ink-" + rarity.ink +
    (count > 0 ? " is-active" : "") +
    (pop ? " is-pop" : "") +
    (rarity.foil ? " is-foil" : "");

  const iconStyle: IconCSSVars = { "--icon-url": `url("${rarity.icon}")` };
  const label = `${rarity.name}, ${rarity.points} point${rarity.points === 1 ? "" : "s"}${count > 0 ? `, ${count} pulled` : ""}`;

  return (
    <button
      type="button"
      className={className}
      onClick={handle}
      aria-label={label}
    >
      <span className="rarity-icon-wrap" style={iconStyle}>
        <img src={rarity.icon} alt="" className="rarity-icon" />
        {rarity.foil && (
          <>
            <span className="foil-holo" aria-hidden="true" />
            <span className="foil-shine" aria-hidden="true" />
          </>
        )}
      </span>
      <span className="rarity-text">
        <span className="rarity-name">{rarity.short}</span>
        <span className="rarity-pts">+{rarity.points}</span>
      </span>
      <span className="rarity-count" aria-hidden={count === 0}>
        {count}
      </span>
    </button>
  );
}
