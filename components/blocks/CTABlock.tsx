/**
 * CTA（Call To Action）ブロックコンポーネント
 */

import Link from 'next/link';
import { Block, CTABlockConfig } from '@/types/block';

interface CTABlockProps {
  block: Block;
}

export default function CTABlock({ block }: CTABlockProps) {
  const config = block.config as CTABlockConfig;
  
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };
  
  const styleClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };
  
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const isExternal = config.url.startsWith('http');

  return (
    <div className={`flex ${alignmentClasses[config.alignment || 'center']}`}>
      <Link
        href={config.url}
        target={config.openInNewTab || isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={`
          inline-block
          rounded-lg
          font-semibold
          transition-all
          hover:scale-105
          shadow-md
          ${styleClasses[config.style || 'primary']}
          ${sizeClasses[config.size || 'medium']}
        `}
      >
        {config.text}
      </Link>
    </div>
  );
}

