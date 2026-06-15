"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Check, Palette, Type, Layout, Eye } from "lucide-react";
import { StoreTheme } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  THEME_PRESETS,
  FONT_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  ThemePreset,
} from "@/lib/theme-presets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AppearanceFormProps {
  storeId: string;
  initialTheme: StoreTheme | null;
}

const AppearanceForm = ({ storeId, initialTheme }: AppearanceFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"presets" | "colors" | "typography" | "layout">("presets");

  const [theme, setTheme] = useState({
    preset: initialTheme?.preset || "default",
    primaryColor: initialTheme?.primaryColor || "222.2 47.4% 11.2%",
    secondaryColor: initialTheme?.secondaryColor || "210 40% 96.1%",
    accentColor: initialTheme?.accentColor || "210 40% 96.1%",
    backgroundColor: initialTheme?.backgroundColor || "0 0% 100%",
    foregroundColor: initialTheme?.foregroundColor || "222.2 84% 4.9%",
    mutedColor: initialTheme?.mutedColor || "210 40% 96.1%",
    mutedForeground: initialTheme?.mutedForeground || "215.4 16.3% 46.9%",
    borderColor: initialTheme?.borderColor || "214.3 31.8% 91.4%",
    cardColor: initialTheme?.cardColor || "0 0% 100%",
    destructiveColor: initialTheme?.destructiveColor || "0 84.2% 60.2%",
    darkPrimary: initialTheme?.darkPrimary || "210 40% 98%",
    darkSecondary: initialTheme?.darkSecondary || "217.2 32.6% 17.5%",
    darkAccent: initialTheme?.darkAccent || "217.2 32.6% 17.5%",
    darkBackground: initialTheme?.darkBackground || "222.2 84% 4.9%",
    darkForeground: initialTheme?.darkForeground || "210 40% 98%",
    darkMuted: initialTheme?.darkMuted || "217.2 32.6% 17.5%",
    darkMutedFg: initialTheme?.darkMutedFg || "215 20.2% 65.1%",
    darkBorder: initialTheme?.darkBorder || "217.2 32.6% 17.5%",
    darkCard: initialTheme?.darkCard || "222.2 84% 4.9%",
    darkDestructive: initialTheme?.darkDestructive || "0 62.8% 30.6%",
    fontFamily: initialTheme?.fontFamily || "Inter",
    headingFont: initialTheme?.headingFont || "Inter",
    borderRadius: initialTheme?.borderRadius || "0.5rem",
    navbarStyle: initialTheme?.navbarStyle || "default",
    footerStyle: initialTheme?.footerStyle || "default",
    productCardStyle: initialTheme?.productCardStyle || "default",
  });

  const applyPreset = (preset: ThemePreset) => {
    setTheme((prev) => ({
      ...prev,
      preset: preset.id,
      primaryColor: preset.light.primary,
      secondaryColor: preset.light.secondary,
      accentColor: preset.light.accent,
      backgroundColor: preset.light.background,
      foregroundColor: preset.light.foreground,
      mutedColor: preset.light.muted,
      mutedForeground: preset.light.mutedForeground,
      borderColor: preset.light.border,
      cardColor: preset.light.card,
      destructiveColor: preset.light.destructive,
      darkPrimary: preset.dark.primary,
      darkSecondary: preset.dark.secondary,
      darkAccent: preset.dark.accent,
      darkBackground: preset.dark.background,
      darkForeground: preset.dark.foreground,
      darkMuted: preset.dark.muted,
      darkMutedFg: preset.dark.mutedForeground,
      darkBorder: preset.dark.border,
      darkCard: preset.dark.card,
      darkDestructive: preset.dark.destructive,
    }));
  };

  const onSave = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${storeId}/theme`, theme);
      router.refresh();
      toast.success("Theme updated successfully!");
    } catch (error) {
      toast.error("Failed to update theme");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "presets" as const, label: "Presets", icon: Palette },
    { id: "colors" as const, label: "Colors", icon: Eye },
    { id: "typography" as const, label: "Typography", icon: Type },
    { id: "layout" as const, label: "Layout", icon: Layout },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Appearance" desc="Customize your store's look and feel" />
        <Button onClick={onSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <Separator />

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "presets" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Theme Presets</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose a preset to quickly style your store. You can customize individual colors in the Colors tab.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "relative group rounded-xl border-2 p-1 transition-all hover:scale-[1.02] hover:shadow-lg",
                    theme.preset === preset.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  {theme.preset === preset.id && (
                    <div className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  {/* Preview Card */}
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{ backgroundColor: preset.preview.bg }}
                  >
                    {/* Mini navbar */}
                    <div
                      className="h-6 flex items-center px-3 gap-2"
                      style={{ backgroundColor: preset.preview.primary }}
                    >
                      <div className="w-8 h-2 rounded-full bg-white/30" />
                      <div className="w-5 h-2 rounded-full bg-white/20 ml-auto" />
                      <div className="w-5 h-2 rounded-full bg-white/20" />
                    </div>
                    {/* Content area */}
                    <div className="p-3 space-y-2">
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-12 rounded-md"
                          style={{ backgroundColor: preset.preview.secondary }}
                        />
                        <div className="flex-1 space-y-1.5">
                          <div
                            className="h-2 rounded-full w-3/4"
                            style={{ backgroundColor: preset.preview.primary, opacity: 0.7 }}
                          />
                          <div
                            className="h-2 rounded-full w-1/2"
                            style={{ backgroundColor: preset.preview.accent, opacity: 0.5 }}
                          />
                        </div>
                      </div>
                      <div
                        className="h-5 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: preset.preview.primary }}
                      >
                        <span className="text-[8px] text-white font-medium">Add to Cart</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm font-medium mt-2 mb-1">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "colors" && (
          <div className="space-y-8">
            {/* Light Mode */}
            <div>
              <h3 className="text-lg font-semibold mb-1">Light Mode Colors</h3>
              <p className="text-sm text-muted-foreground mb-4">
                HSL values (e.g. &quot;222.2 47.4% 11.2%&quot;). Changes apply to light mode.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { key: "primaryColor", label: "Primary" },
                  { key: "secondaryColor", label: "Secondary" },
                  { key: "accentColor", label: "Accent" },
                  { key: "backgroundColor", label: "Background" },
                  { key: "foregroundColor", label: "Foreground" },
                  { key: "mutedColor", label: "Muted" },
                  { key: "mutedForeground", label: "Muted FG" },
                  { key: "borderColor", label: "Border" },
                  { key: "cardColor", label: "Card" },
                  { key: "destructiveColor", label: "Destructive" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-xs font-medium">{label}</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-md border shadow-sm flex-shrink-0"
                        style={{ backgroundColor: `hsl(${(theme as any)[key]})` }}
                      />
                      <Input
                        value={(theme as any)[key]}
                        onChange={(e) => setTheme((prev) => ({ ...prev, [key]: e.target.value, preset: "custom" }))}
                        className="text-xs h-8"
                        placeholder="H S% L%"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            {/* Dark Mode */}
            <div>
              <h3 className="text-lg font-semibold mb-1">Dark Mode Colors</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Override colors for dark mode.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { key: "darkPrimary", label: "Primary" },
                  { key: "darkSecondary", label: "Secondary" },
                  { key: "darkAccent", label: "Accent" },
                  { key: "darkBackground", label: "Background" },
                  { key: "darkForeground", label: "Foreground" },
                  { key: "darkMuted", label: "Muted" },
                  { key: "darkMutedFg", label: "Muted FG" },
                  { key: "darkBorder", label: "Border" },
                  { key: "darkCard", label: "Card" },
                  { key: "darkDestructive", label: "Destructive" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-xs font-medium">{label}</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-md border shadow-sm flex-shrink-0"
                        style={{ backgroundColor: `hsl(${(theme as any)[key]})` }}
                      />
                      <Input
                        value={(theme as any)[key]}
                        onChange={(e) => setTheme((prev) => ({ ...prev, [key]: e.target.value, preset: "custom" }))}
                        className="text-xs h-8"
                        placeholder="H S% L%"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "typography" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Typography</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose fonts for your store. Fonts are loaded from Google Fonts.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div className="space-y-2">
                <Label>Body Font</Label>
                <Select
                  value={theme.fontFamily}
                  onValueChange={(v) => setTheme((prev) => ({ ...prev, fontFamily: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Used for body text, descriptions, and UI elements.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Select
                  value={theme.headingFont}
                  onValueChange={(v) => setTheme((prev) => ({ ...prev, headingFont: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Used for page titles, product names, and section headers.
                </p>
              </div>
            </div>
            {/* Font Preview */}
            <div className="border rounded-lg p-6 max-w-2xl">
              <p className="text-xs text-muted-foreground mb-3">PREVIEW</p>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: FONT_OPTIONS.find(f => f.value === theme.headingFont)?.style }}>
                Premium Furniture Collection
              </h2>
              <p className="text-muted-foreground" style={{ fontFamily: FONT_OPTIONS.find(f => f.value === theme.fontFamily)?.style }}>
                Discover our curated selection of modern furniture designed for comfort and style.
                Each piece is crafted with attention to detail and built to last.
              </p>
            </div>
          </div>
        )}

        {activeTab === "layout" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Layout Options</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Customize the structure and spacing of your store.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Select
                  value={theme.borderRadius}
                  onValueChange={(v) => setTheme((prev) => ({ ...prev, borderRadius: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BORDER_RADIUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} ({opt.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Product Card Style</Label>
                <Select
                  value={theme.productCardStyle}
                  onValueChange={(v) => setTheme((prev) => ({ ...prev, productCardStyle: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default — Bordered card</SelectItem>
                    <SelectItem value="minimal">Minimal — No border, shadow only</SelectItem>
                    <SelectItem value="overlay">Overlay — Info on image hover</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Navbar Style</Label>
                <Select
                  value={theme.navbarStyle}
                  onValueChange={(v) => setTheme((prev) => ({ ...prev, navbarStyle: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dropdown">Dropdown — Categories in a dropdown menu</SelectItem>
                    <SelectItem value="inline">Inline — Categories as horizontal links</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Footer Style</Label>
                <Select
                  value={theme.footerStyle}
                  onValueChange={(v) => setTheme((prev) => ({ ...prev, footerStyle: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default — Map + contact</SelectItem>
                    <SelectItem value="minimal">Minimal — Copyright only</SelectItem>
                    <SelectItem value="full">Full — Links + social + contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Radius Preview */}
            <div className="border rounded-lg p-6 max-w-md">
              <p className="text-xs text-muted-foreground mb-3">BORDER RADIUS PREVIEW</p>
              <div className="flex gap-4 items-center">
                <div
                  className="w-16 h-16 bg-primary"
                  style={{ borderRadius: theme.borderRadius }}
                />
                <div className="space-y-2 flex-1">
                  <div
                    className="h-8 bg-primary/10 border"
                    style={{ borderRadius: theme.borderRadius }}
                  />
                  <div
                    className="h-8 bg-secondary"
                    style={{ borderRadius: theme.borderRadius }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Panel */}
      <Separator className="my-8" />
      <div>
        <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Light Preview */}
          <div
            className="rounded-xl overflow-hidden border shadow-lg"
            style={{
              "--preview-primary": theme.primaryColor,
              "--preview-bg": theme.backgroundColor,
              "--preview-fg": theme.foregroundColor,
              "--preview-muted": theme.mutedColor,
              "--preview-muted-fg": theme.mutedForeground,
              "--preview-card": theme.cardColor,
              "--preview-border": theme.borderColor,
              "--preview-accent": theme.accentColor,
              "--preview-radius": theme.borderRadius,
            } as React.CSSProperties}
          >
            <div className="text-xs font-medium px-3 py-1 bg-muted text-muted-foreground">Light Mode</div>
            <div className="p-4" style={{ backgroundColor: `hsl(${theme.backgroundColor})`, color: `hsl(${theme.foregroundColor})` }}>
              {/* Mini navbar */}
              <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: `1px solid hsl(${theme.borderColor})` }}>
                <span className="font-bold text-sm">STORE</span>
                <div className="flex gap-2 text-xs" style={{ color: `hsl(${theme.mutedForeground})` }}>
                  <span>Chairs</span>
                  <span>Tables</span>
                </div>
              </div>
              {/* Product card */}
              <div
                className="p-3 space-y-2"
                style={{
                  backgroundColor: `hsl(${theme.cardColor})`,
                  borderRadius: theme.borderRadius,
                  border: `1px solid hsl(${theme.borderColor})`,
                }}
              >
                <div
                  className="h-20 w-full"
                  style={{
                    backgroundColor: `hsl(${theme.mutedColor})`,
                    borderRadius: theme.borderRadius,
                  }}
                />
                <p className="text-sm font-semibold">SANDSBERG Chair</p>
                <p className="text-xs" style={{ color: `hsl(${theme.mutedForeground})` }}>Chairs</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">₹2,490</span>
                  <button
                    className="text-xs px-3 py-1 text-white"
                    style={{
                      backgroundColor: `hsl(${theme.primaryColor})`,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dark Preview */}
          <div className="rounded-xl overflow-hidden border shadow-lg">
            <div className="text-xs font-medium px-3 py-1 bg-muted text-muted-foreground">Dark Mode</div>
            <div className="p-4" style={{ backgroundColor: `hsl(${theme.darkBackground})`, color: `hsl(${theme.darkForeground})` }}>
              <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: `1px solid hsl(${theme.darkBorder})` }}>
                <span className="font-bold text-sm">STORE</span>
                <div className="flex gap-2 text-xs" style={{ color: `hsl(${theme.darkMutedFg})` }}>
                  <span>Chairs</span>
                  <span>Tables</span>
                </div>
              </div>
              <div
                className="p-3 space-y-2"
                style={{
                  backgroundColor: `hsl(${theme.darkCard})`,
                  borderRadius: theme.borderRadius,
                  border: `1px solid hsl(${theme.darkBorder})`,
                }}
              >
                <div
                  className="h-20 w-full"
                  style={{
                    backgroundColor: `hsl(${theme.darkMuted})`,
                    borderRadius: theme.borderRadius,
                  }}
                />
                <p className="text-sm font-semibold">SANDSBERG Chair</p>
                <p className="text-xs" style={{ color: `hsl(${theme.darkMutedFg})` }}>Chairs</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">₹2,490</span>
                  <button
                    className="text-xs px-3 py-1 text-white"
                    style={{
                      backgroundColor: `hsl(${theme.darkPrimary})`,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppearanceForm;
