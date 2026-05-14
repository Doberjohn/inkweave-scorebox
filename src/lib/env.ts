import type { RarityId } from "@/types";

function intEnv(name: string, value: string | undefined, fallback: number): number {
  if (value === undefined || value === "") return fallback;
  const n = Number(value);
  if (!Number.isInteger(n)) {
    throw new Error(`Env var ${name} must be an integer (got "${value}")`);
  }
  return n;
}

export const RARITY_POINTS: Readonly<Record<RarityId, number>> = {
  "foil-rare":       intEnv("VITE_POINTS_FOIL_RARE",       import.meta.env.VITE_POINTS_FOIL_RARE,       1),
  "super-rare":      intEnv("VITE_POINTS_SUPER_RARE",      import.meta.env.VITE_POINTS_SUPER_RARE,      2),
  "foil-super-rare": intEnv("VITE_POINTS_FOIL_SUPER_RARE", import.meta.env.VITE_POINTS_FOIL_SUPER_RARE, 3),
  "legendary":       intEnv("VITE_POINTS_LEGENDARY",       import.meta.env.VITE_POINTS_LEGENDARY,       4),
  "epic":            intEnv("VITE_POINTS_EPIC",            import.meta.env.VITE_POINTS_EPIC,            5),
  "foil-legendary":  intEnv("VITE_POINTS_FOIL_LEGENDARY",  import.meta.env.VITE_POINTS_FOIL_LEGENDARY,  8),
  "enchanted":       intEnv("VITE_POINTS_ENCHANTED",       import.meta.env.VITE_POINTS_ENCHANTED,       12),
  "iconic":          intEnv("VITE_POINTS_ICONIC",          import.meta.env.VITE_POINTS_ICONIC,          25),
};
