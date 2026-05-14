interface PageFooterProps {
  canReset: boolean;
  onReset: () => void;
}

export function PageFooter({ canReset, onReset }: PageFooterProps) {
  return (
    <footer className="page-footer">
      <span className="footer-credit">
        Built on the Inkweave system · Lorcana Core · scores persist locally
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
