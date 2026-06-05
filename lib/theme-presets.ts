// Theme presets — curated color schemes
export interface ThemePreset {
  id: string;
  name: string;
  preview: { primary: string; secondary: string; accent: string; bg: string };
  light: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    card: string;
    destructive: string;
  };
  dark: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    card: string;
    destructive: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "Default",
    preview: { primary: "#1e293b", secondary: "#f1f5f9", accent: "#f1f5f9", bg: "#ffffff" },
    light: {
      primary: "222.2 47.4% 11.2%",
      secondary: "210 40% 96.1%",
      accent: "210 40% 96.1%",
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      muted: "210 40% 96.1%",
      mutedForeground: "215.4 16.3% 46.9%",
      border: "214.3 31.8% 91.4%",
      card: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
    },
    dark: {
      primary: "210 40% 98%",
      secondary: "217.2 32.6% 17.5%",
      accent: "217.2 32.6% 17.5%",
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      border: "217.2 32.6% 17.5%",
      card: "222.2 84% 4.9%",
      destructive: "0 62.8% 30.6%",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    preview: { primary: "#818cf8", secondary: "#1e1b4b", accent: "#c084fc", bg: "#0f0a1a" },
    light: {
      primary: "239 84% 67%",
      secondary: "248 53% 20%",
      accent: "270 67% 71%",
      background: "260 60% 98%",
      foreground: "248 53% 10%",
      muted: "250 30% 93%",
      mutedForeground: "250 10% 45%",
      border: "250 25% 88%",
      card: "260 50% 99%",
      destructive: "0 84.2% 60.2%",
    },
    dark: {
      primary: "239 84% 67%",
      secondary: "248 53% 12%",
      accent: "270 67% 71%",
      background: "260 50% 6%",
      foreground: "250 30% 95%",
      muted: "250 20% 14%",
      mutedForeground: "250 15% 60%",
      border: "250 20% 16%",
      card: "260 45% 8%",
      destructive: "0 62.8% 30.6%",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    preview: { primary: "#06b6d4", secondary: "#164e63", accent: "#22d3ee", bg: "#ecfeff" },
    light: {
      primary: "189 94% 43%",
      secondary: "196 64% 24%",
      accent: "187 92% 69%",
      background: "183 100% 96%",
      foreground: "198 80% 10%",
      muted: "186 50% 92%",
      mutedForeground: "190 20% 40%",
      border: "186 40% 86%",
      card: "185 80% 98%",
      destructive: "0 84.2% 60.2%",
    },
    dark: {
      primary: "189 94% 43%",
      secondary: "196 64% 14%",
      accent: "187 85% 53%",
      background: "200 60% 5%",
      foreground: "186 40% 93%",
      muted: "196 40% 12%",
      mutedForeground: "190 20% 60%",
      border: "196 35% 15%",
      card: "200 50% 7%",
      destructive: "0 62.8% 30.6%",
    },
  },
  {
    id: "forest",
    name: "Forest",
    preview: { primary: "#22c55e", secondary: "#14532d", accent: "#4ade80", bg: "#f0fdf4" },
    light: {
      primary: "142 71% 45%",
      secondary: "143 64% 20%",
      accent: "142 69% 58%",
      background: "138 76% 97%",
      foreground: "143 64% 8%",
      muted: "140 45% 92%",
      mutedForeground: "140 15% 40%",
      border: "140 35% 86%",
      card: "138 60% 98%",
      destructive: "0 84.2% 60.2%",
    },
    dark: {
      primary: "142 71% 45%",
      secondary: "143 50% 12%",
      accent: "142 69% 58%",
      background: "144 50% 4%",
      foreground: "140 35% 93%",
      muted: "143 35% 11%",
      mutedForeground: "140 15% 58%",
      border: "143 30% 14%",
      card: "144 45% 6%",
      destructive: "0 62.8% 30.6%",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    preview: { primary: "#f97316", secondary: "#7c2d12", accent: "#fb923c", bg: "#fff7ed" },
    light: {
      primary: "25 95% 53%",
      secondary: "17 74% 28%",
      accent: "27 96% 61%",
      background: "33 100% 96%",
      foreground: "17 74% 10%",
      muted: "30 50% 92%",
      mutedForeground: "25 15% 42%",
      border: "30 40% 86%",
      card: "33 80% 98%",
      destructive: "0 84.2% 60.2%",
    },
    dark: {
      primary: "25 95% 53%",
      secondary: "17 60% 14%",
      accent: "27 96% 61%",
      background: "20 50% 5%",
      foreground: "30 40% 93%",
      muted: "20 35% 12%",
      mutedForeground: "25 15% 58%",
      border: "20 30% 15%",
      card: "20 45% 7%",
      destructive: "0 62.8% 30.6%",
    },
  },
  {
    id: "rose",
    name: "Rose",
    preview: { primary: "#f43f5e", secondary: "#881337", accent: "#fb7185", bg: "#fff1f2" },
    light: {
      primary: "347 77% 50%",
      secondary: "336 74% 31%",
      accent: "350 89% 60%",
      background: "350 100% 97%",
      foreground: "336 74% 10%",
      muted: "348 50% 93%",
      mutedForeground: "346 15% 42%",
      border: "348 40% 87%",
      card: "350 80% 98%",
      destructive: "0 84.2% 60.2%",
    },
    dark: {
      primary: "347 77% 50%",
      secondary: "336 55% 14%",
      accent: "350 89% 60%",
      background: "340 45% 5%",
      foreground: "348 40% 94%",
      muted: "336 35% 12%",
      mutedForeground: "346 15% 58%",
      border: "336 30% 15%",
      card: "340 40% 7%",
      destructive: "0 62.8% 30.6%",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    preview: { primary: "#a855f7", secondary: "#581c87", accent: "#c084fc", bg: "#faf5ff" },
    light: {
      primary: "271 91% 65%",
      secondary: "273 68% 32%",
      accent: "270 67% 75%",
      background: "270 100% 98%",
      foreground: "273 68% 10%",
      muted: "270 45% 94%",
      mutedForeground: "270 15% 42%",
      border: "270 35% 88%",
      card: "270 80% 99%",
      destructive: "0 84.2% 60.2%",
    },
    dark: {
      primary: "271 91% 65%",
      secondary: "273 50% 14%",
      accent: "270 67% 75%",
      background: "270 50% 5%",
      foreground: "270 35% 94%",
      muted: "273 35% 12%",
      mutedForeground: "270 15% 58%",
      border: "273 30% 15%",
      card: "270 45% 7%",
      destructive: "0 62.8% 30.6%",
    },
  },
  {
    id: "slate",
    name: "Slate Pro",
    preview: { primary: "#3b82f6", secondary: "#1e293b", accent: "#60a5fa", bg: "#f8fafc" },
    light: {
      primary: "217 91% 60%",
      secondary: "215 28% 17%",
      accent: "213 94% 68%",
      background: "210 40% 98%",
      foreground: "215 28% 10%",
      muted: "214 32% 93%",
      mutedForeground: "215 16% 47%",
      border: "214 32% 91%",
      card: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
    },
    dark: {
      primary: "217 91% 60%",
      secondary: "215 28% 12%",
      accent: "213 94% 68%",
      background: "222 47% 6%",
      foreground: "214 32% 93%",
      muted: "215 25% 14%",
      mutedForeground: "215 16% 58%",
      border: "215 25% 16%",
      card: "222 40% 8%",
      destructive: "0 62.8% 30.6%",
    },
  },
];

export const FONT_OPTIONS = [
  { value: "Inter", label: "Inter", style: "'Inter', sans-serif" },
  { value: "Outfit", label: "Outfit", style: "'Outfit', sans-serif" },
  { value: "DM Sans", label: "DM Sans", style: "'DM Sans', sans-serif" },
  { value: "Poppins", label: "Poppins", style: "'Poppins', sans-serif" },
  { value: "Space Grotesk", label: "Space Grotesk", style: "'Space Grotesk', sans-serif" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", style: "'Plus Jakarta Sans', sans-serif" },
  { value: "Manrope", label: "Manrope", style: "'Manrope', sans-serif" },
  { value: "Roboto", label: "Roboto", style: "'Roboto', sans-serif" },
];

export const BORDER_RADIUS_OPTIONS = [
  { value: "0", label: "None" },
  { value: "0.25rem", label: "Small" },
  { value: "0.5rem", label: "Medium" },
  { value: "0.75rem", label: "Large" },
  { value: "1rem", label: "XL" },
  { value: "1.5rem", label: "2XL" },
];
