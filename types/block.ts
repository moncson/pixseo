export interface ContentBlock {
  id: string;
  type: 'banner' | 'text' | 'feature' | 'faq' | 'cta' | 'html';
  title: string;
  placement: 'home_top' | 'home_middle' | 'home_bottom' | 'category' | 'article_top' | 'article_bottom';
  categoryIds?: string[]; // 特定カテゴリーのみ表示
  content: BlockContent;
  order: number;
  isActive: boolean;
  mediaId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 各タイプのコンテンツ
export type BlockContent = 
  | BannerContent 
  | TextContent 
  | FeatureContent 
  | FAQContent 
  | CTAContent 
  | HTMLContent;

export interface BannerContent {
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
}

export interface TextContent {
  html: string;
}

export interface FeatureContent {
  items: {
    icon: string;
    title: string;
    description: string;
  }[];
}

export interface FAQContent {
  items: {
    question: string;
    answer: string;
  }[];
}

export interface CTAContent {
  text: string;
  buttonText: string;
  buttonUrl: string;
  backgroundColor?: string;
}

export interface HTMLContent {
  html: string;
}

// 後方互換性のためのエイリアス
export type Banner = ContentBlock;

