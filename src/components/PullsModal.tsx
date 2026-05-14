import { useEffect, useId } from "react";
import { scoreOf } from "@/lib/scoring";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { Player } from "@/types";
import { PullsLog } from "./PullsLog";

interface PullsModalProps {
  player: Player | null;
  onClose: () => void;
  onUndoPull: (pullId: string) => void;
  onClearPulls: () => void;
}

export function PullsModal({ player, onClose, onUndoPull, onClearPulls }: PullsModalProps) {
  const titleId = useId();
  useBodyScrollLock(player !== null);

  useEffect(() => {
    if (!player) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player, onClose]);

  if (!player) return null;

  const total = scoreOf(player);
  const pullCount = player.pulls.length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="modal-header">
          <div>
            <div className="modal-eyebrow">Recent pulls</div>
            <h2 id={titleId} className="modal-title">{player.name}</h2>
            <div className="modal-meta">
              <span className="modal-score">{total}</span>
              <span className="modal-meta-label">
                pts · {pullCount} pull{pullCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="modal-body">
          <PullsLog pulls={player.pulls} layout="modal" onUndo={onUndoPull} />
        </div>

        {pullCount > 0 && (
          <footer className="modal-footer">
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                onClearPulls();
                onClose();
              }}
            >
              Clear all pulls
            </button>
            <button type="button" className="cta-ghost cta-sm" onClick={onClose}>
              Done
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
