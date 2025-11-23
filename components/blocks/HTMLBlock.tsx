/**
 * HTMLブロックコンポーネント
 */

import { Block, HTMLBlockConfig } from '@/types/block';

interface HTMLBlockProps {
  block: Block;
}

export default function HTMLBlock({ block }: HTMLBlockProps) {
  const config = block.config as HTMLBlockConfig;
  
  return (
    <div
      className="custom-html-block"
      dangerouslySetInnerHTML={{ __html: config.html }}
    />
  );
}

