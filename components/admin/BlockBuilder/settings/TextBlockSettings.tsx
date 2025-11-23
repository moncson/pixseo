'use client';

/**
 * テキストブロックの設定
 */

import { Block, TextBlockConfig } from '@/types/block';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface TextBlockSettingsProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

export default function TextBlockSettings({ block, onUpdate }: TextBlockSettingsProps) {
  const config = block.config as TextBlockConfig;

  const updateConfig = (updates: Partial<TextBlockConfig>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  return (
    <div className="space-y-4">
      {/* テキストエディター */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          テキスト
        </label>
        <RichTextEditor
          value={config.content}
          onChange={(content) => updateConfig({ content })}
        />
      </div>

      {/* 配置 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          配置
        </label>
        <select
          value={config.alignment || 'left'}
          onChange={(e) => updateConfig({ alignment: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="left">左揃え</option>
          <option value="center">中央揃え</option>
          <option value="right">右揃え</option>
        </select>
      </div>

      {/* フォントサイズ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          フォントサイズ
        </label>
        <select
          value={config.fontSize || 'medium'}
          onChange={(e) => updateConfig({ fontSize: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
        </select>
      </div>

      {/* フォント太さ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          フォント太さ
        </label>
        <select
          value={config.fontWeight || 'normal'}
          onChange={(e) => updateConfig({ fontWeight: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="normal">通常</option>
          <option value="bold">太字</option>
        </select>
      </div>
    </div>
  );
}

