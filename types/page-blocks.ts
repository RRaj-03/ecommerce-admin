export type BlockType = 'hero' | 'text' | 'featureGrid' | 'cta';

export interface BlockStyles {
  primaryColor?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  mutedColor?: string;
  mutedForeground?: string;
  cardColor?: string;
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  styles: BlockStyles;
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  data: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    imagePosition: 'left' | 'right' | 'background';
  };
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  data: {
    content: string; // Markdown or plain text
    alignment: 'left' | 'center' | 'right';
  };
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FeatureGridBlock extends BaseBlock {
  type: 'featureGrid';
  data: {
    title: string;
    subtitle: string;
    features: FeatureItem[];
  };
}

export interface CTABlock extends BaseBlock {
  type: 'cta';
  data: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
}

export type PageBlock = HeroBlock | TextBlock | FeatureGridBlock | CTABlock;
