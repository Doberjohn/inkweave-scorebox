import logoUrl from "@/design-system/assets/logo.svg";

export function PageHeader() {
  return (
    <header className="page-header">
      <div className="brand-row">
        <img src={logoUrl} alt="Inkweave" className="brand-mark" />
        <span className="brand-divider" />
        <span className="brand-section">Scorebox</span>
      </div>
    </header>
  );
}
