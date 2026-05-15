interface XIconProps {
  size?: number;
}

/**
 * Plain × glyph as an SVG so close/remove circle buttons centre cleanly
 * across font/browser combinations. Text × in Plus Jakarta Sans sits
 * slightly high and slightly left of the glyph's box centre, which made
 * the icon look off-axis at 28-36px button sizes.
 */
export function XIcon({ size = 14 }: XIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
