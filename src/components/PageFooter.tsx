import type { Player } from "@/types";
import { ShareResults } from "./ShareResults";

interface PageFooterProps {
  players: Player[];
  canReset: boolean;
  onReset: () => void;
}

const INKWEAVE_URL = "https://inkweave.ink";

export function PageFooter({ players, canReset, onReset }: PageFooterProps) {
  const totalPulls = players.reduce((sum, p) => sum + p.pulls.length, 0);
  const canShare = totalPulls > 0;

  return (
    <footer className="page-footer">
      <span className="footer-credit">
        Built on the{" "}
        <a
          href={INKWEAVE_URL}
          target="_blank"
          rel="noopener"
          className="footer-link"
        >
          Inkweave
        </a>{" "}
        system
      </span>
      <div className="footer-actions">
        <ShareResults players={players} canShare={canShare} />
        {canReset && (
          <button
            type="button"
            className="reset-btn"
            onClick={onReset}
            title="Reset everything"
          >
            Reset all
          </button>
        )}
      </div>
    </footer>
  );
}
