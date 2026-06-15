export type BlockType = 'hero' | 'text' | 'featureGrid' | 'cta' | 'faq' | 'testimonial' | 'gallery';

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

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQBlock extends BaseBlock {
  type: 'faq';
  data: {
    title: string;
    subtitle: string;
    items: FAQItem[];
  };
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  content: string;
  avatarUrl: string;
}

export interface TestimonialBlock extends BaseBlock {
  type: 'testimonial';
  data: {
    title: string;
    subtitle: string;
    items: TestimonialItem[];
  };
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  data: {
    title: string;
    subtitle: string;
    images: GalleryImage[];
    columns: 2 | 3 | 4;
  };
}

export type PageBlock = HeroBlock | TextBlock | FeatureGridBlock | CTABlock | FAQBlock | TestimonialBlock | GalleryBlock;
