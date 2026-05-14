import logoUrl from "@/design-system/assets/logo.svg";

const INKWEAVE_URL = "https://inkweave.ink";

export function PageHeader() {
  return (
    <header className="page-header">
      <div className="brand-row">
        <a
          href={INKWEAVE_URL}
          target="_blank"
          rel="noopener"
          className="brand-link"
          aria-label="Inkweave (opens in a new tab)"
        >
          <img src={logoUrl} alt="Inkweave" className="brand-mark" />
        </a>
        <span className="brand-divider" />
        <span className="brand-section">Scorebox</span>
      </div>
    </header>
  );
}
