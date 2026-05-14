import { useRef, useState, type FormEvent } from "react";

interface HeroProps {
  playerCount: number;
  onAddPlayer: (name: string) => void;
}

export function Hero({ playerCount, onAddPlayer }: HeroProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent<HTMLFormElement>) {
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
          aria-label="Player name"
        />
        <button type="submit" className="cta" disabled={!name.trim()}>
          <span className="plus-glyph">+</span> Seat at table
        </button>
      </form>
    </section>
  );
}
