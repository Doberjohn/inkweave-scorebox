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
