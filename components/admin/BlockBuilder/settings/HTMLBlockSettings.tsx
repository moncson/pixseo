'use client';

/**
 * HTMLブロックの設定
 */

import { Block, HTMLBlockConfig } from '@/types/block';

interface HTMLBlockSettingsProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

export default function HTMLBlockSettings({ block, onUpdate }: HTMLBlockSettingsProps) {
  const config = block.config as HTMLBlockConfig;

  const updateConfig = (updates: Partial<HTMLBlockConfig>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  return (
    <div className="space-y-4">
      {/* HTML入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          HTML
        </label>
        <textarea
          value={config.html}
          onChange={(e) => updateConfig({ html: e.target.value })}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          placeholder="<div>HTMLを入力してください</div>"
        />
      </div>

      {/* 注意書き */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          ⚠️ カスタムHTMLは慎重に使用してください。
          <br />
          不正なHTMLはページの表示を崩す可能性があります。
        </p>
      </div>
    </div>
  );
}

