'use client';

/**
 * CTAブロックの設定
 */

import { Block, CTABlockConfig } from '@/types/block';
import FloatingInput from '@/components/admin/FloatingInput';

interface CTABlockSettingsProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

export default function CTABlockSettings({ block, onUpdate }: CTABlockSettingsProps) {
  const config = block.config as CTABlockConfig;

  const updateConfig = (updates: Partial<CTABlockConfig>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  return (
    <div className="space-y-4">
      {/* ボタンテキスト */}
      <FloatingInput
        label="ボタンテキスト *"
        value={config.text}
        onChange={(value) => updateConfig({ text: value })}
        required
      />

      {/* URL */}
      <FloatingInput
        label="リンク先URL *"
        value={config.url}
        onChange={(value) => updateConfig({ url: value })}
        placeholder="https://example.com"
        required
      />

      {/* スタイル */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          スタイル
        </label>
        <select
          value={config.style || 'primary'}
          onChange={(e) => updateConfig({ style: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="primary">プライマリ（青）</option>
          <option value="secondary">セカンダリ（グレー）</option>
          <option value="outline">アウトライン</option>
        </select>
      </div>

      {/* サイズ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          サイズ
        </label>
        <select
          value={config.size || 'medium'}
          onChange={(e) => updateConfig({ size: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
        </select>
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

      {/* 新しいタブで開く */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="openInNewTab"
          checked={config.openInNewTab || false}
          onChange={(e) => updateConfig({ openInNewTab: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="openInNewTab" className="text-sm text-gray-700">
          新しいタブで開く
        </label>
      </div>
    </div>
  );
}

