interface EmptyStateProps {
  onSeed: () => void;
}

export function EmptyState({ onSeed }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-orb" aria-hidden="true" />
      <h3>The table is empty.</h3>
      <p>Add your first friend above to start scoring the box.</p>
      <button type="button" className="cta-ghost" onClick={onSeed}>
        Try with 3 demo players
      </button>
    </div>
  );
}
