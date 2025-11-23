'use client';

/**
 * ブロックパレット（左サイドバー）
 * 使用可能なブロックのリストを表示
 */

import { BlockType } from '@/types/block';

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
}

const blockTypes = [
  {
    type: 'text' as BlockType,
    label: 'テキスト',
    icon: '📝',
    description: '見出しや段落を追加',
  },
  {
    type: 'image' as BlockType,
    label: '画像',
    icon: '🖼️',
    description: '画像を表示',
  },
  {
    type: 'cta' as BlockType,
    label: 'CTA',
    icon: '🔘',
    description: 'ボタン/リンクを配置',
  },
  {
    type: 'form' as BlockType,
    label: 'フォーム',
    icon: '📋',
    description: 'フォームを埋め込み',
  },
  {
    type: 'html' as BlockType,
    label: 'HTML',
    icon: '💻',
    description: 'カスタムHTMLを追加',
  },
];

export default function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-4">ブロック</h3>
      <div className="space-y-2">
        {blockTypes.map((blockType) => (
          <button
            key={blockType.type}
            onClick={() => onAddBlock(blockType.type)}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{blockType.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 group-hover:text-blue-600">
                  {blockType.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {blockType.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          💡 ブロックをクリックして追加できます
        </p>
      </div>
    </div>
  );
}

