import { useEffect, useReducer, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { GlowField } from "@/components/GlowField";
import { PageHeader } from "@/components/PageHeader";
import { Hero } from "@/components/Hero";
import { InkbornCredit } from "@/components/InkbornCredit";
import { PlayerCard } from "@/components/PlayerCard";
import { PullsModal } from "@/components/PullsModal";
import { EmptyState } from "@/components/EmptyState";
import { PageFooter } from "@/components/PageFooter";
import { scoreboxReducer } from "@/state/reducer";
import { computeScoreboard } from "@/lib/scoring";
import { loadInitial, persist } from "@/lib/storage";

export default function App() {
  const [players, dispatch] = useReducer(scoreboxReducer, undefined, loadInitial);
  const [openPullsPlayerId, setOpenPullsPlayerId] = useState<string | null>(null);

  useEffect(() => {
    persist(players);
  }, [players]);

  const scoreboard = computeScoreboard(players);
  const modalPlayer = openPullsPlayerId
    ? players.find((p) => p.id === openPullsPlayerId) ?? null
    : null;

  return (
    <>
      <Analytics />
      <GlowField />
      <main className="page">
        <PageHeader />
        <div className="top-row">
          <Hero onAddPlayer={(name) => dispatch({ type: "ADD_PLAYER", name })} />
          <InkbornCredit />
        </div>

        {players.length === 0 ? (
          <EmptyState onSeed={() => dispatch({ type: "SEED_DEMO" })} />
        ) : (
          <section className="players-grid">
            {players.map((player) => {
              const ranked = scoreboard.byPlayerId.get(player.id);
              if (!ranked) return null;
              return (
                <PlayerCard
                  key={player.id}
                  ranked={ranked}
                  onRename={(name) => dispatch({ type: "RENAME_PLAYER", playerId: player.id, name })}
                  onRemove={() => dispatch({ type: "REMOVE_PLAYER", playerId: player.id })}
                  onAddPull={(rarity) => dispatch({ type: "ADD_PULL", playerId: player.id, rarity })}
                  onUndoPull={(pullId) => dispatch({ type: "UNDO_PULL", playerId: player.id, pullId })}
                  onClearPulls={() => dispatch({ type: "CLEAR_PULLS", playerId: player.id })}
                  onOpenPulls={() => setOpenPullsPlayerId(player.id)}
                />
              );
            })}
          </section>
        )}

        <PageFooter
          players={players}
          canReset={players.length > 0}
          onReset={() => {
            if (window.confirm("Reset everything? This clears all players and pulls.")) {
              dispatch({ type: "RESET_ALL" });
            }
          }}
        />
      </main>

      <PullsModal
        player={modalPlayer}
        onClose={() => setOpenPullsPlayerId(null)}
        onUndoPull={(pullId) => {
          if (modalPlayer) dispatch({ type: "UNDO_PULL", playerId: modalPlayer.id, pullId });
        }}
        onClearPulls={() => {
          if (modalPlayer) dispatch({ type: "CLEAR_PULLS", playerId: modalPlayer.id });
        }}
      />
    </>
  );
}
