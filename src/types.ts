export type InkPalette =
  | "amber"
  | "amethyst"
  | "emerald"
  | "ruby"
  | "sapphire"
  | "steel"
  | "enchanted"
  | "iconic";

export type RarityId =
  | "foil-rare"
  | "super-rare"
  | "foil-super-rare"
  | "legendary"
  | "epic"
  | "foil-legendary"
  | "enchanted"
  | "iconic";

export interface Rarity {
  id: RarityId;
  name: string;
  short: string;
  points: number;
  ink: InkPalette;
  icon: string;
  foil: boolean;
}

export interface Pull {
  id: string;
  rarity: RarityId;
  t: number;
}

export interface Player {
  id: string;
  name: string;
  pulls: Pull[];
}

export type PersistedState = Player[];

export type PullTally = Partial<Record<RarityId, number>>;

export interface RankedPlayer {
  player: Player;
  score: number;
  rank: number;
  isLeader: boolean;
  isTied: boolean;
  marginToLeader: number;
}

export interface Scoreboard {
  byPlayerId: ReadonlyMap<string, RankedPlayer>;
  topScore: number;
  leaders: RankedPlayer[];
}
