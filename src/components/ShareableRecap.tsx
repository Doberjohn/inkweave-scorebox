import type { Recap, RecapPlayer } from "@/lib/recap";
import inkbornLogo from "@/design-system/assets/inkborn.png";
import inkweaveLogo from "@/design-system/assets/logo.svg";

interface ShareableRecapProps {
  recap: Recap;
}

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

// Largest number of runner-up rows we render before collapsing the
// remainder into a "+ N more" line. Keeps the recap inside 1080x1080
// even for large groups.
const REST_VISIBLE_LIMIT = 3;

function rankLabel(rank: number): string {
  if (rank === 1) return "1ST";
  if (rank === 2) return "2ND";
  if (rank === 3) return "3RD";
  return `${rank}TH`;
}

function SoloChampion({ champion }: { champion: RecapPlayer }) {
  return (
    <section className="shareable-recap__champion">
      <span className="shareable-recap__crown" aria-hidden="true">♛</span>
      <h2 className="shareable-recap__champion-name">{champion.name}</h2>
      <div className="shareable-recap__champion-score">{champion.score}</div>
      <div className="shareable-recap__champion-meta">
        points · {champion.pullCount} pull{champion.pullCount === 1 ? "" : "s"}
      </div>
      {champion.topPull && (
        <div className="shareable-recap__top-pull-chip">
          <img src={champion.topPull.icon} alt="" className="shareable-recap__top-pull-icon" />
          <div className="shareable-recap__top-pull-text">
            <span className="shareable-recap__top-pull-eyebrow">Biggest pull</span>
            <span className="shareable-recap__top-pull-name">
              {champion.topPull.name}
              <span className="shareable-recap__top-pull-points"> +{champion.topPull.points} pts</span>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

function TiedChampions({ champions }: { champions: RecapPlayer[] }) {
  // All tied champions share the same score by construction.
  const sharedScore = champions[0]?.score ?? 0;
  return (
    <section className="shareable-recap__champion shareable-recap__champion--tied">
      <span className="shareable-recap__crown" aria-hidden="true">♛</span>
      <span className="shareable-recap__tied-label">
        {champions.length}-way tie for the lead
      </span>
      <div className="shareable-recap__tied-names">
        {champions.map((c) => (
          <h2 key={c.name} className="shareable-recap__champion-name shareable-recap__champion-name--tied">
            {c.name}
          </h2>
        ))}
      </div>
      <div className="shareable-recap__champion-score">{sharedScore}</div>
      <div className="shareable-recap__champion-meta">points each</div>
    </section>
  );
}

function RunnerUpRow({ player }: { player: RecapPlayer }) {
  return (
    <li className="shareable-recap__rest-row">
      <span className="shareable-recap__rest-rank">{rankLabel(player.rank)}</span>
      <span className="shareable-recap__rest-name">{player.name}</span>
      <span className="shareable-recap__rest-score">{player.score}</span>
      {player.topPull && (
        <span className="shareable-recap__rest-pull">
          {player.topPull.short} +{player.topPull.points}
        </span>
      )}
    </li>
  );
}

export function ShareableRecap({ recap }: ShareableRecapProps) {
  const date = DATE_FMT.format(recap.date).toUpperCase();
  const soloChampion = recap.champions.length === 1 ? recap.champions[0] : null;
  const tiedChampions = recap.champions.length > 1 ? recap.champions : null;

  return (
    <div className="shareable-recap">
      <div className="shareable-recap__glow" aria-hidden="true">
        <div className="orb orb-blue" />
        <div className="orb orb-purple" />
        <div className="orb orb-amber" />
        <div className="orb orb-teal" />
      </div>

      <header className="shareable-recap__header">
        <span className="shareable-recap__eyebrow">Box Opening · {date}</span>
      </header>

      {soloChampion && <SoloChampion champion={soloChampion} />}
      {tiedChampions && <TiedChampions champions={tiedChampions} />}

      {recap.rest.length > 0 && (
        <ul className="shareable-recap__rest">
          {recap.rest.slice(0, REST_VISIBLE_LIMIT).map((p) => (
            <RunnerUpRow key={p.name + p.rank} player={p} />
          ))}
          {recap.rest.length > REST_VISIBLE_LIMIT && (
            <li className="shareable-recap__rest-more">
              + {recap.rest.length - REST_VISIBLE_LIMIT} more
            </li>
          )}
        </ul>
      )}

      <footer className="shareable-recap__footer">
        <div className="shareable-recap__footer-row">
          <div className="shareable-recap__inkweave-brand">
            <img
              src={inkweaveLogo}
              alt="Inkweave"
              className="shareable-recap__inkweave-logo"
            />
            <span className="shareable-recap__inkweave-divider" aria-hidden="true" />
            <span className="shareable-recap__inkweave-section">Scorebox</span>
          </div>
          <div className="shareable-recap__attribution">
            <span className="shareable-recap__attribution-eyebrow">Scoring system by</span>
            <img
              src={inkbornLogo}
              alt="Inkborn Heroes"
              className="shareable-recap__attribution-logo"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
