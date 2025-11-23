'use client';

/**
 * 画像ブロックの設定
 */

import { Block, ImageBlockConfig } from '@/types/block';
import FeaturedImageUpload from '@/components/admin/FeaturedImageUpload';
import FloatingInput from '@/components/admin/FloatingInput';

interface ImageBlockSettingsProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

export default function ImageBlockSettings({ block, onUpdate }: ImageBlockSettingsProps) {
  const config = block.config as ImageBlockConfig;

  const updateConfig = (updates: Partial<ImageBlockConfig>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  return (
    <div className="space-y-4">
      {/* 画像アップロード */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          画像
        </label>
        <FeaturedImageUpload
          imageUrl={config.imageUrl}
          altText={config.alt}
          onImageChange={(url) => updateConfig({ imageUrl: url })}
          onAltTextChange={(alt) => updateConfig({ alt })}
        />
      </div>

      {/* キャプション */}
      <FloatingInput
        label="キャプション（オプション）"
        value={config.caption || ''}
        onChange={(value) => updateConfig({ caption: value })}
      />

      {/* リンク先 */}
      <FloatingInput
        label="リンク先URL（オプション）"
        value={config.link || ''}
        onChange={(value) => updateConfig({ link: value })}
        placeholder="https://example.com"
      />

      {/* 幅 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          幅（%）
        </label>
        <input
          type="range"
          min="20"
          max="100"
          step="10"
          value={config.width || 100}
          onChange={(e) => updateConfig({ width: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="text-sm text-gray-600 text-center mt-1">
          {config.width || 100}%
        </div>
      </div>

      {/* 配置 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          配置
        </label>
        <select
          value={config.alignment || 'center'}
          onChange={(e) => updateConfig({ alignment: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="left">左揃え</option>
          <option value="center">中央揃え</option>
          <option value="right">右揃え</option>
        </select>
      </div>
    </div>
  );
}

