import inkbornLogo from "@/design-system/assets/inkborn.png";

const YOUTUBE_URL = "https://www.youtube.com/@InkbornHeroes";
const WEBSITE_URL = "https://inkbornheroes.com/";

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="inkborn-action-icon"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="inkborn-action-icon"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function InkbornCredit() {
  return (
    <aside className="inkborn-credit">
      <span className="inkborn-eyebrow">Scoring system created by</span>
      <img src={inkbornLogo} alt="Inkborn Heroes" className="inkborn-logo" />
      <div className="inkborn-actions">
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener"
          className="inkborn-action inkborn-action--youtube"
          aria-label="Inkborn Heroes on YouTube (opens in a new tab)"
        >
          <YouTubeIcon />
          <span>YouTube</span>
        </a>
        <a
          href={WEBSITE_URL}
          target="_blank"
          rel="noopener"
          className="inkborn-action"
          aria-label="Inkborn Heroes website (opens in a new tab)"
        >
          <GlobeIcon />
          <span>Website</span>
        </a>
      </div>
    </aside>
  );
}
