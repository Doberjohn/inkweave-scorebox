import type { Rarity, RarityId } from "@/types";
import { RARITY_POINTS } from "@/lib/env";

import rarityRare from "@/design-system/assets/rarity-rare.png";
import raritySuperRare from "@/design-system/assets/rarity-super-rare.png";
import rarityLegendary from "@/design-system/assets/rarity-legendary.png";
import rarityEpic from "@/design-system/assets/rarity-epic.png";
import rarityEnchanted from "@/design-system/assets/rarity-enchanted.png";
import rarityIconic from "@/design-system/assets/rarity-iconic.png";

export const RARITIES: readonly Rarity[] = [
  { id: "foil-rare",       name: "Foil Rare",       short: "Foil Rare",       points: RARITY_POINTS["foil-rare"],       ink: "steel",     icon: rarityRare,       foil: true  },
  { id: "super-rare",      name: "Super Rare",      short: "Super Rare",      points: RARITY_POINTS["super-rare"],      ink: "sapphire",  icon: raritySuperRare,  foil: false },
  { id: "foil-super-rare", name: "Foil Super Rare", short: "Foil Super Rare", points: RARITY_POINTS["foil-super-rare"], ink: "emerald",   icon: raritySuperRare,  foil: true  },
  { id: "legendary",       name: "Legendary",       short: "Legendary",       points: RARITY_POINTS["legendary"],       ink: "amethyst",  icon: rarityLegendary,  foil: false },
  { id: "epic",            name: "Epic",            short: "Epic",            points: RARITY_POINTS["epic"],            ink: "ruby",      icon: rarityEpic,       foil: false },
  { id: "foil-legendary",  name: "Foil Legendary",  short: "Foil Legendary",  points: RARITY_POINTS["foil-legendary"],  ink: "amber",     icon: rarityLegendary,  foil: true  },
  { id: "enchanted",       name: "Enchanted",       short: "Enchanted",  points: RARITY_POINTS["enchanted"],       ink: "enchanted", icon: rarityEnchanted,  foil: false },
  { id: "iconic",          name: "Iconic",          short: "Iconic",     points: RARITY_POINTS["iconic"],          ink: "iconic",    icon: rarityIconic,     foil: false },
];

export const RARITY_BY_ID: Readonly<Record<RarityId, Rarity>> = Object.fromEntries(
  RARITIES.map((r) => [r.id, r]),
) as Record<RarityId, Rarity>;
