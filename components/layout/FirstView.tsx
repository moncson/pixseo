'use client';

import Image from 'next/image';
import { FirstViewSettings } from '@/types/theme';

interface FirstViewProps {
  settings: FirstViewSettings;
}

export default function FirstView({ settings }: FirstViewProps) {
  // FV画像が設定されていない場合は表示しない
  if (!settings.imageUrl) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* 背景画像 */}
      <div className="relative w-full" style={{ height: '400px' }}>
        <Image
          src={settings.imageUrl}
          alt="First View"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        
        {/* テキストコンテンツ */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          {settings.catchphrase && (
            <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 drop-shadow-lg">
              {settings.catchphrase}
            </h1>
          )}
          
          {settings.description && (
            <p className="text-lg md:text-xl text-center max-w-3xl drop-shadow-md whitespace-pre-line">
              {settings.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

