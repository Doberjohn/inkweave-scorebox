import logoUrl from "@/design-system/assets/logo.svg";
import { GithubIcon } from "./GithubIcon";

const INKWEAVE_URL = "https://inkweave.ink";
const REPO_URL = "https://github.com/Doberjohn/inkweave-scorebox";

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
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener"
        className="repo-link"
        aria-label="View source on GitHub (opens in a new tab)"
      >
        <GithubIcon size={18} />
        <span className="repo-link-label">View on GitHub</span>
      </a>
    </header>
  );
}
