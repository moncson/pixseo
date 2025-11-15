export interface Page {
  id: string;
  mediaId: string;           // 所属メディアID
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  publishedAt: Date;
  updatedAt: Date;
  featuredImage?: string;
  featuredImageAlt?: string; // アイキャッチ画像のalt属性
  isPublished: boolean;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  // 固定ページ専用
  parentId?: string;         // 親ページID（階層構造用）
  order: number;             // 表示順
}

