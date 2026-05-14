interface PageFooterProps {
  canReset: boolean;
  onReset: () => void;
}

const INKWEAVE_URL = "https://inkweave.ink";

export function PageFooter({ canReset, onReset }: PageFooterProps) {
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
    </footer>
  );
}
