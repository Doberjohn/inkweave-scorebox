/* ──────────────────────────────────────────────────────────────────
   Lorcana Scorebox — single-page interactive prototype
   Built on the Inkweave dark-fantasy design system.
   ────────────────────────────────────────────────────────────── */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ── Rarity definitions ──────────────────────────────────────── */
const RARITIES = [
  { id: "foil-rare",       name: "Foil Rare",        short: "Rare",      points: 1,  ink: "steel",    icon: "assets/rarity-rare.png",       foil: true  },
  { id: "super-rare",      name: "Super Rare",       short: "Super Rare",points: 2,  ink: "sapphire", icon: "assets/rarity-super-rare.png", foil: false },
  { id: "foil-super-rare", name: "Foil Super Rare",  short: "Super Rare",points: 4,  ink: "emerald",  icon: "assets/rarity-super-rare.png", foil: true  },
  { id: "legendary",       name: "Legendary",        short: "Legendary", points: 4,  ink: "amethyst", icon: "assets/rarity-legendary.png",  foil: false },
  { id: "epic",            name: "Epic",             short: "Epic",      points: 5,  ink: "ruby",     icon: "assets/rarity-epic.png",       foil: false },
  { id: "foil-legendary",  name: "Foil Legendary",   short: "Legendary", points: 8,  ink: "amber",    icon: "assets/rarity-legendary.png",  foil: true  },
  { id: "enchanted",       name: "Enchanted",        short: "Enchanted", points: 12, ink: "enchanted",icon: "assets/rarity-enchanted.png",  foil: false },
  { id: "iconic",          name: "Iconic",           short: "Iconic",    points: 25, ink: "iconic",   icon: "assets/rarity-iconic.png",     foil: false },
];
const RARITY_BY_ID = Object.fromEntries(RARITIES.map(r => [r.id, r]));

/* ── Persisted state hook ────────────────────────────────────── */
const STORAGE_KEY = "lorcana-scorebox-v1";

function usePersistedPlayers() {
  const [players, setPlayers] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    /* Demo seed so the empty state isn't lonely on first load */
    return [
      { id: cryptoId(), name: "Alex",   pulls: [
        { id: cryptoId(), rarity: "foil-rare", t: Date.now() - 60000 },
        { id: cryptoId(), rarity: "super-rare", t: Date.now() - 50000 },
        { id: cryptoId(), rarity: "legendary", t: Date.now() - 40000 },
      ]},
      { id: cryptoId(), name: "Bea",    pulls: [
        { id: cryptoId(), rarity: "foil-rare", t: Date.now() - 30000 },
        { id: cryptoId(), rarity: "epic", t: Date.now() - 20000 },
        { id: cryptoId(), rarity: "foil-legendary", t: Date.now() - 10000 },
      ]},
      { id: cryptoId(), name: "Cyrus",  pulls: [
        { id: cryptoId(), rarity: "super-rare", t: Date.now() - 25000 },
        { id: cryptoId(), rarity: "foil-super-rare", t: Date.now() - 15000 },
      ]},
    ];
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(players)); } catch (e) {}
  }, [players]);
  return [players, setPlayers];
}

function cryptoId() {
  return (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));
}

function scoreOf(player) {
  return player.pulls.reduce((s, p) => s + (RARITY_BY_ID[p.rarity]?.points || 0), 0);
}

function tallyOf(player) {
  const t = {};
  for (const p of player.pulls) t[p.rarity] = (t[p.rarity] || 0) + 1;
  return t;
}

/* ────────────────────────────────────────────────────────────── */
/*  Background — Inkweave glow orbs                                */
/* ────────────────────────────────────────────────────────────── */
function GlowField() {
  return (
    <div className="glow-field" aria-hidden="true">
      <div className="orb orb-blue"></div>
      <div className="orb orb-purple"></div>
      <div className="orb orb-amber"></div>
      <div className="orb orb-teal"></div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Header                                                         */
/* ────────────────────────────────────────────────────────────── */
function Header() {
  return (
    <header className="page-header">
      <div className="brand-row">
        <img src="assets/logo.svg" alt="Inkweave" className="brand-mark" />
        <span className="brand-divider"></span>
        <span className="brand-section">Scorebox</span>
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Hero — title + add-player form                                 */
/* ────────────────────────────────────────────────────────────── */
function Hero({ onAddPlayer, playerCount }) {
  const [name, setName] = useState("");
  const inputRef = useRef(null);
  function submit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddPlayer(trimmed);
    setName("");
    inputRef.current?.focus();
  }
  return (
    <section className="hero">
      <div className="eyebrow">CORE · BOX OPENING · LIVE TALLY</div>
      <h1 className="hero-title-text">
        Score the <span className="hero-accent">box</span>
      </h1>
      <p className="hero-sub">
        Add everyone at the table. Tap a rarity when somebody pulls it.
        The board updates live and the leader gets the gold.
      </p>
      <form className="add-row" onSubmit={submit}>
        <input
          ref={inputRef}
          type="text"
          className="add-input"
          placeholder={playerCount === 0 ? "First friend's name…" : "Add another friend…"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
        />
        <button type="submit" className="cta" disabled={!name.trim()}>
          <span className="plus-glyph">+</span> Seat at table
        </button>
      </form>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Player card                                                    */
/* ────────────────────────────────────────────────────────────── */
function PlayerCard({ player, rank, isLeader, isTied, leaderScore, onRename, onRemove, onAddPull, onUndoPull, onClearPulls, onOpenPulls }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(player.name);
  const score = scoreOf(player);
  const tally = tallyOf(player);
  const recent = [...player.pulls].sort((a, b) => b.t - a.t);

  function commitRename() {
    const t = draft.trim();
    if (t && t !== player.name) onRename(t);
    else setDraft(player.name);
    setEditing(false);
  }

  const rankBadge = rank === 1 ? "1st" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : `${rank}th`;

  return (
    <article className={"player-card" + (isLeader ? " is-leader" : "")}>
      <header className="player-header">
        <div className="player-rank">
          <span className="rank-num">{rankBadge}</span>
          {isLeader && <span className="crown" title="Leading">♛</span>}
          {isTied && <span className="tie-tag">TIE</span>}
        </div>
        <div className="player-name-row">
          {editing ? (
            <input
              className="name-input"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") { setDraft(player.name); setEditing(false); }
              }}
              maxLength={24}
            />
          ) : (
            <h2 className="player-name" onClick={() => { setDraft(player.name); setEditing(true); }} title="Click to rename">
              {player.name}
            </h2>
          )}
          <button className="icon-btn" onClick={onRemove} title="Remove player" aria-label="Remove player">×</button>
        </div>
        <div className="score-row">
          <div className="score-num"><AnimatedNumber value={score} /></div>
          <div className="score-meta">
            <div className="score-label">points · {player.pulls.length} pull{player.pulls.length === 1 ? "" : "s"}</div>
            {!isLeader && leaderScore > 0 && (
              <div className="score-gap">−{leaderScore - score} to leader</div>
            )}
            {isLeader && isTied && (
              <div className="score-gap is-tied">Tied for the lead</div>
            )}
          </div>
        </div>
      </header>

      <div className="rarity-grid">
        {RARITIES.map((r) => (
          <RarityButton
            key={r.id}
            rarity={r}
            count={tally[r.id] || 0}
            onClick={() => onAddPull(r.id)}
          />
        ))}
      </div>

      <div className="pulls-log pulls-inline">
        <div className="pulls-log-header">
          <span>Recent pulls</span>
          {player.pulls.length > 0 && (
            <button className="text-btn" onClick={onClearPulls}>Clear</button>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="pulls-empty">No pulls yet — tap a rarity above when something hits the table.</div>
        ) : (
          <ul className="pulls-list">
            {recent.slice(0, 8).map((p) => {
              const r = RARITY_BY_ID[p.rarity];
              return (
                <li key={p.id} className={"pull-item ink-" + r.ink + (r.foil ? " is-foil" : "")}>
                  <span className="pull-icon-wrap" style={{ "--icon-url": `url("${r.icon}")` }}>
                    <img src={r.icon} alt="" className="pull-icon" />
                    {r.foil && (
                      <>
                        <span className="foil-holo foil-holo-sm" aria-hidden="true"></span>
                        <span className="foil-shine foil-shine-sm" aria-hidden="true"></span>
                      </>
                    )}
                  </span>
                  <span className="pull-name">{r.name}</span>
                  <span className="pull-pts">+{r.points}</span>
                  <button className="pull-undo" onClick={() => onUndoPull(p.id)} title="Undo this pull">×</button>
                </li>
              );
            })}
            {recent.length > 8 && (
              <li className="pulls-more">+ {recent.length - 8} more…</li>
            )}
          </ul>
        )}
      </div>

      {/* Modal trigger — visible on tablet/mobile only */}
      <button className="pulls-modal-trigger" onClick={onOpenPulls}>
        <span className="pulls-modal-label">Recent pulls</span>
        <span className="pulls-modal-count">{player.pulls.length}</span>
        <span className="pulls-modal-arrow" aria-hidden="true">›</span>
      </button>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Pulls modal — shown on tablet/mobile                           */
/* ────────────────────────────────────────────────────────────── */
function PullsModal({ player, onClose, onUndoPull, onClearPulls }) {
  useEffect(() => {
    if (!player) return;
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [player, onClose]);

  if (!player) return null;
  const recent = [...player.pulls].sort((a, b) => b.t - a.t);
  const total = player.pulls.reduce((s, p) => s + (RARITY_BY_ID[p.rarity]?.points || 0), 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="modal-header">
          <div>
            <div className="modal-eyebrow">Recent pulls</div>
            <h2 className="modal-title">{player.name}</h2>
            <div className="modal-meta">
              <span className="modal-score">{total}</span>
              <span className="modal-meta-label">pts · {player.pulls.length} pull{player.pulls.length === 1 ? "" : "s"}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="modal-body">
          {recent.length === 0 ? (
            <div className="pulls-empty">No pulls yet — close this and tap a rarity to start.</div>
          ) : (
            <ul className="pulls-list pulls-list-modal">
              {recent.map((p) => {
                const r = RARITY_BY_ID[p.rarity];
                return (
                  <li key={p.id} className={"pull-item ink-" + r.ink + (r.foil ? " is-foil" : "")}>
                    <span className="pull-icon-wrap" style={{ "--icon-url": `url("${r.icon}")` }}>
                      <img src={r.icon} alt="" className="pull-icon" />
                      {r.foil && (
                        <>
                          <span className="foil-holo foil-holo-sm" aria-hidden="true"></span>
                          <span className="foil-shine foil-shine-sm" aria-hidden="true"></span>
                        </>
                      )}
                    </span>
                    <span className="pull-name">{r.name}</span>
                    <span className="pull-pts">+{r.points}</span>
                    <button className="pull-undo" onClick={() => onUndoPull(p.id)} title="Undo this pull">×</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {recent.length > 0 && (
          <footer className="modal-footer">
            <button className="text-btn" onClick={() => { onClearPulls(); onClose(); }}>Clear all pulls</button>
            <button className="cta-ghost cta-sm" onClick={onClose}>Done</button>
          </footer>
        )}
      </div>
    </div>
  );
}

/* Big score animated number — flashes gold on increase */
function AnimatedNumber({ value }) {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (value !== prev.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  return <span className={"animated-num" + (flash ? " is-flash" : "")}>{value}</span>;
}

/* ────────────────────────────────────────────────────────────── */
/*  Rarity tally button                                            */
/* ────────────────────────────────────────────────────────────── */
function RarityButton({ rarity, count, onClick }) {
  const [pop, setPop] = useState(false);
  function handle() {
    setPop(true);
    setTimeout(() => setPop(false), 250);
    onClick();
  }
  return (
    <button
      className={"rarity-btn ink-" + rarity.ink + (count > 0 ? " is-active" : "") + (pop ? " is-pop" : "") + (rarity.foil ? " is-foil" : "")}
      onClick={handle}
    >
      <span className="rarity-icon-wrap" style={{ "--icon-url": `url("${rarity.icon}")` }}>
        <img src={rarity.icon} alt="" className="rarity-icon" />
        {rarity.foil && (
          <>
            <span className="foil-holo" aria-hidden="true"></span>
            <span className="foil-shine" aria-hidden="true"></span>
          </>
        )}
      </span>
      <span className="rarity-text">
        <span className="rarity-name">{rarity.short}</span>
        <span className="rarity-pts">+{rarity.points}</span>
      </span>
      <span className="rarity-count" aria-hidden={count === 0}>{count}</span>
    </button>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Legend / scoring reference — collapsible sidebar               */
/* ────────────────────────────────────────────────────────────── */
function Legend() {
  const [open, setOpen] = useState(false);
  return (
    <aside className={"legend" + (open ? " is-open" : " is-collapsed")}>
      <button
        className="legend-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="legend-title-block">
          <span className="legend-title">Scoring rubric</span>
          <span className="legend-sub">{open ? "Points per pull" : "Tap to view"}</span>
        </span>
        <span className="legend-caret" aria-hidden="true">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <ul className="legend-list">
          {[...RARITIES].sort((a, b) => a.points - b.points).map(r => (
            <li key={r.id} className={"legend-item ink-" + r.ink + (r.foil ? " is-foil" : "")}>
              <span className="legend-icon-wrap" style={{ "--icon-url": `url("${r.icon}")` }}>
                <img src={r.icon} alt="" className="legend-icon" />
                {r.foil && (
                  <>
                    <span className="foil-holo foil-holo-sm" aria-hidden="true"></span>
                    <span className="foil-shine foil-shine-sm" aria-hidden="true"></span>
                  </>
                )}
              </span>
              <span className="legend-name">{r.name}</span>
              <span className="legend-pts">{r.points}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Empty state                                                    */
/* ────────────────────────────────────────────────────────────── */
function EmptyState({ onSeed }) {
  return (
    <div className="empty-state">
      <div className="empty-orb"></div>
      <h3>The table is empty.</h3>
      <p>Add your first friend above to start scoring the box.</p>
      <button className="cta-ghost" onClick={onSeed}>Try with 3 demo players</button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  App                                                            */
/* ────────────────────────────────────────────────────────────── */
function App() {
  const [players, setPlayers] = usePersistedPlayers();
  const [pullsModalId, setPullsModalId] = useState(null);

  const addPlayer = (name) => {
    setPlayers(p => [...p, { id: cryptoId(), name, pulls: [] }]);
  };
  const renamePlayer = (id, name) => {
    setPlayers(p => p.map(pl => pl.id === id ? { ...pl, name } : pl));
  };
  const removePlayer = (id) => {
    setPlayers(p => p.filter(pl => pl.id !== id));
  };
  const addPull = (playerId, rarityId) => {
    setPlayers(p => p.map(pl => pl.id === playerId
      ? { ...pl, pulls: [...pl.pulls, { id: cryptoId(), rarity: rarityId, t: Date.now() }] }
      : pl));
  };
  const undoPull = (playerId, pullId) => {
    setPlayers(p => p.map(pl => pl.id === playerId
      ? { ...pl, pulls: pl.pulls.filter(pu => pu.id !== pullId) }
      : pl));
  };
  const clearPulls = (playerId) => {
    setPlayers(p => p.map(pl => pl.id === playerId ? { ...pl, pulls: [] } : pl));
  };
  const seedDemo = () => {
    setPlayers([
      { id: cryptoId(), name: "Player 1", pulls: [] },
      { id: cryptoId(), name: "Player 2", pulls: [] },
      { id: cryptoId(), name: "Player 3", pulls: [] },
    ]);
  };
  const resetAll = () => {
    if (confirm("Reset everything? This clears all players and pulls.")) {
      setPlayers([]);
    }
  };

  /* Ranking */
  const ranked = useMemo(() => {
    const withScore = players.map(p => ({ ...p, _score: scoreOf(p) }));
    const sorted = [...withScore].sort((a, b) => b._score - a._score);
    /* Compute dense rank so ties share a rank */
    let rank = 0, prevScore = null;
    const ranks = new Map();
    sorted.forEach((p, i) => {
      if (p._score !== prevScore) { rank = i + 1; prevScore = p._score; }
      ranks.set(p.id, rank);
    });
    return { sorted, ranks };
  }, [players]);

  const totalPulls = players.reduce((s, p) => s + p.pulls.length, 0);
  const totalScore = players.reduce((s, p) => s + scoreOf(p), 0);
  const topScore = ranked.sorted[0]?._score || 0;
  const leaders = topScore > 0 ? ranked.sorted.filter(p => p._score === topScore) : [];
  const isTied = leaders.length > 1;
  const leaderName = leaders.length === 0
    ? null
    : leaders.length === 1
      ? leaders[0].name
      : (leaders.length === 2 ? `${leaders[0].name} & ${leaders[1].name}` : `${leaders.length}-way tie`);

  /* Header summary stats */
  const headerLeader = leaders.length === 0
    ? null
    : { name: leaderName, score: topScore };

  let headerMargin = null;
  if (topScore > 0 && players.length >= 2) {
    const secondScore = ranked.sorted.find(p => p._score < topScore)?._score ?? 0;
    if (isTied) {
      headerMargin = { text: "Tied", sub: `${leaders.length}-way` };
    } else {
      const lead = topScore - secondScore;
      const second = ranked.sorted.find(p => p._score < topScore);
      headerMargin = {
        text: `+${lead}`,
        sub: second ? `over ${second.name}` : null,
      };
    }
  }

  let headerBestPull = null;
  for (const pl of players) {
    for (const pu of pl.pulls) {
      const r = RARITY_BY_ID[pu.rarity];
      if (!r) continue;
      if (!headerBestPull
          || r.points > headerBestPull.points
          || (r.points === headerBestPull.points && pu.t > headerBestPull.t)) {
        headerBestPull = {
          points: r.points,
          t: pu.t,
          rarityShort: r.name,
          icon: r.icon,
          foil: r.foil,
          playerName: pl.name,
        };
      }
    }
  }

  return (
    <>
      <GlowField />
      <main className="page">
        <Header />
        <div className="top-row">
          <Hero onAddPlayer={addPlayer} playerCount={players.length} />
          <Legend />
        </div>

        {players.length === 0 ? (
          <EmptyState onSeed={seedDemo} />
        ) : (
          <section className="players-grid">
            {players.map((p) => {
              const rank = ranked.ranks.get(p.id);
              const score = scoreOf(p);
              const isLeader = score > 0 && score === topScore;
              return (
                <PlayerCard
                  key={p.id}
                  player={p}
                  rank={rank}
                  isLeader={isLeader}
                  isTied={isLeader && isTied}
                  leaderScore={topScore}
                  onRename={(n) => renamePlayer(p.id, n)}
                  onRemove={() => removePlayer(p.id)}
                  onAddPull={(rid) => addPull(p.id, rid)}
                  onUndoPull={(pid) => undoPull(p.id, pid)}
                  onClearPulls={() => clearPulls(p.id)}
                  onOpenPulls={() => setPullsModalId(p.id)}
                />
              );
            })}
          </section>
        )}

        <footer className="page-footer">
          <span className="footer-credit">Built on the Inkweave system · Lorcana Core · scores persist locally</span>
          {players.length > 0 && (
            <button className="reset-btn" onClick={resetAll} title="Reset everything">Reset all</button>
          )}
        </footer>
      </main>

      <PullsModal
        player={players.find(p => p.id === pullsModalId) || null}
        onClose={() => setPullsModalId(null)}
        onUndoPull={(pid) => pullsModalId && undoPull(pullsModalId, pid)}
        onClearPulls={() => pullsModalId && clearPulls(pullsModalId)}
      />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
