"use client";

import { PageBlock } from "@/types/page-blocks";
import { Hero } from "./page-blocks/hero";
import { TextComponent } from "./page-blocks/text-block";
import { FeatureGrid } from "./page-blocks/feature-grid";
import { CTA } from "./page-blocks/cta";
import { FAQ } from "./page-blocks/faq";
import { Testimonial } from "./page-blocks/testimonial";
import { Gallery } from "./page-blocks/gallery";
import React from "react";

function hexToHSL(hex: string): string {
  if (hex.includes("%")) return hex; // Already HSL
  if (!hex.startsWith("#")) return hex; // Invalid hex

  let r: number = 0, g: number = 0, b: number = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  } else {
    return hex;
  }
  
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
}

interface PageRendererProps {
  content: string;
}

export const PageRenderer = ({ content }: PageRendererProps) => {
  let blocks: PageBlock[] | null = null;
  
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      blocks = parsed;
    }
  } catch (e) {
    // Not valid JSON, fallback to raw HTML
  }

  if (!blocks) {
    return (
      <div 
        className="prose dark:prose-invert max-w-none text-foreground whitespace-pre-wrap px-6 py-12"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 py-8 w-full">
      {blocks.map((block) => {
        // Construct inline CSS variables if there are style overrides
        const customStyles: Record<string, string> = {};
        
        if (block.styles?.primaryColor) customStyles["--primary"] = hexToHSL(block.styles.primaryColor);
        if (block.styles?.backgroundColor) customStyles["--background"] = hexToHSL(block.styles.backgroundColor);
        if (block.styles?.foregroundColor) customStyles["--foreground"] = hexToHSL(block.styles.foregroundColor);
        if (block.styles?.mutedColor) customStyles["--muted"] = hexToHSL(block.styles.mutedColor);
        if (block.styles?.mutedForeground) customStyles["--muted-foreground"] = hexToHSL(block.styles.mutedForeground);
        if (block.styles?.cardColor) customStyles["--card"] = hexToHSL(block.styles.cardColor);

        return (
          <div key={block.id} style={customStyles as any} className="w-full">
             {block.type === 'hero' && <Hero data={block.data} />}
             {block.type === 'text' && <TextComponent data={block.data} />}
             {block.type === 'featureGrid' && <FeatureGrid data={block.data} />}
             {block.type === 'cta' && <CTA data={block.data} />}
             {block.type === 'faq' && <FAQ data={block.data} />}
             {block.type === 'testimonial' && <Testimonial data={block.data} />}
             {block.type === 'gallery' && <Gallery data={block.data} />}
          </div>
        );
      })}
    </div>
  );
};
