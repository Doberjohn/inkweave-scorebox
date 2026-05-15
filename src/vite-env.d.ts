/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POINTS_FOIL_RARE?: string;
  readonly VITE_POINTS_SUPER_RARE?: string;
  readonly VITE_POINTS_FOIL_SUPER_RARE?: string;
  readonly VITE_POINTS_LEGENDARY?: string;
  readonly VITE_POINTS_EPIC?: string;
  readonly VITE_POINTS_FOIL_LEGENDARY?: string;
  readonly VITE_POINTS_ENCHANTED?: string;
  readonly VITE_POINTS_ICONIC?: string;
  readonly VITE_LORCANA_SET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
