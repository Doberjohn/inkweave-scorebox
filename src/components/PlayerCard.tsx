import { useState, type KeyboardEvent } from "react";
import { RARITIES } from "@/data/rarities";
import { tallyOf } from "@/lib/scoring";
import type { RankedPlayer, RarityId } from "@/types";
import { AnimatedNumber } from "./AnimatedNumber";
import { RarityButton } from "./RarityButton";
import { PullsLog } from "./PullsLog";

interface PlayerCardProps {
  ranked: RankedPlayer;
  onRename: (name: string) => void;
  onRemove: () => void;
  onAddPull: (rarity: RarityId) => void;
  onUndoPull: (pullId: string) => void;
  onClearPulls: () => void;
  onOpenPulls: () => void;
}

function rankBadge(rank: number): string {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}

export function PlayerCard({
  ranked,
  onRename,
  onRemove,
  onAddPull,
  onUndoPull,
  onClearPulls,
  onOpenPulls,
}: PlayerCardProps) {
  const { player, score, rank, isLeader, isTied, marginToLeader } = ranked;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(player.name);

  const tally = tallyOf(player);
  const pullCount = player.pulls.length;

  function startEditing() {
    setDraft(player.name);
    setEditing(true);
  }

  function commit() {
    const next = draft.trim();
    if (next && next !== player.name) onRename(next);
    setEditing(false);
  }

  function onNameKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") {
      setDraft(player.name);
      setEditing(false);
    }
  }

  return (
    <article className={"player-card" + (isLeader ? " is-leader" : "")}>
      <header className="player-header">
        <div className="player-rank">
          <span className="rank-num">{rankBadge(rank)}</span>
          {isLeader && (
            <>
              <span className="crown" aria-hidden="true">♛</span>
              <span className="sr-only">Leading</span>
            </>
          )}
          {isTied && <span className="tie-tag">TIE</span>}
        </div>
        <div className="player-name-row">
          {editing ? (
            <input
              className="name-input"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={onNameKey}
              maxLength={24}
              aria-label="Rename player"
            />
          ) : (
            <h2
              className="player-name"
              onClick={startEditing}
              title="Click to rename"
            >
              {player.name}
            </h2>
          )}
          <button
            type="button"
            className="icon-btn"
            onClick={onRemove}
            title="Remove player"
            aria-label={`Remove ${player.name}`}
          >
            ×
          </button>
        </div>
        <div className="score-row">
          <div className="score-num">
            <AnimatedNumber value={score} />
          </div>
          <div className="score-meta">
            <div className="score-label">
              points · {pullCount} pull{pullCount === 1 ? "" : "s"}
            </div>
            {!isLeader && marginToLeader > 0 && (
              <div className="score-gap">−{marginToLeader} to leader</div>
            )}
            {isLeader && isTied && (
              <div className="score-gap is-tied">Tied for the lead</div>
            )}
          </div>
        </div>
      </header>

      <div className="rarity-grid">
        {RARITIES.map((r) => (
          <RarityButton
            key={r.id}
            rarity={r}
            count={tally[r.id] ?? 0}
            onClick={() => onAddPull(r.id)}
          />
        ))}
      </div>

      <div className="pulls-log pulls-inline">
        <div className="pulls-log-header">
          <span>Recent pulls</span>
          {pullCount > 0 && (
            <button type="button" className="text-btn" onClick={onClearPulls}>
              Clear
            </button>
          )}
        </div>
        <PullsLog pulls={player.pulls} layout="inline" onUndo={onUndoPull} />
      </div>

      <button type="button" className="pulls-modal-trigger" onClick={onOpenPulls}>
        <span className="pulls-modal-label">Recent pulls</span>
        <span className="pulls-modal-count">{pullCount}</span>
        <span className="pulls-modal-arrow" aria-hidden="true">›</span>
      </button>
    </article>
  );
}
