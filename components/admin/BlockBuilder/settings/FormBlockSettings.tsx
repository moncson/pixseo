'use client';

/**
 * フォームブロックの設定
 */

import { Block, FormBlockConfig } from '@/types/block';

interface FormBlockSettingsProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

export default function FormBlockSettings({ block, onUpdate }: FormBlockSettingsProps) {
  const config = block.config as FormBlockConfig;

  const updateConfig = (updates: Partial<FormBlockConfig>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  return (
    <div className="space-y-4">
      {/* フォーム選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          フォーム選択 *
        </label>
        <select
          value={config.formId}
          onChange={(e) => updateConfig({ formId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">フォームを選択してください</option>
          {/* TODO: Phase 2でフォーム一覧を取得して表示 */}
        </select>
      </div>

      {/* タイトル表示 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showTitle"
          checked={config.showTitle !== false}
          onChange={(e) => updateConfig({ showTitle: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="showTitle" className="text-sm text-gray-700">
          フォームタイトルを表示
        </label>
      </div>

      {/* Phase 2実装予定の注意書き */}
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          ⚠️ フォーム機能はPhase 2で実装予定です
        </p>
      </div>
    </div>
  );
}

