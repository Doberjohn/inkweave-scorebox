import { useRef, useState } from "react";
import type { Player } from "@/types";
import { buildRecap } from "@/lib/recap";
import { ShareResultsModal } from "./ShareResultsModal";

interface ShareResultsProps {
  players: Player[];
  canShare: boolean;
}

export function ShareResults({ players, canShare }: ShareResultsProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (!canShare) return null;

  function close() {
    setOpen(false);
    // Restore focus to the trigger for keyboard / AT continuity.
    queueMicrotask(() => triggerRef.current?.focus());
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="share-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        Share results
      </button>
      {open && (
        <ShareResultsModal recap={buildRecap(players)} onClose={close} />
      )}
    </>
  );
}
