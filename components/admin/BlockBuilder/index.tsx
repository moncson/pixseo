'use client';

/**
 * ブロックビルダーメインコンポーネント
 * ドラッグ&ドロップでブロックを組み立てるUI
 */

import { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Block, BlockType } from '@/types/block';
import { v4 as uuidv4 } from 'uuid';
import BlockPalette from './BlockPalette';
import BuilderCanvas from './BuilderCanvas';
import BlockSettings from './BlockSettings';

interface BlockBuilderProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export default function BlockBuilder({ blocks, onChange }: BlockBuilderProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // ブロック追加
  const handleAddBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: uuidv4(),
      type,
      order: blocks.length,
      config: getDefaultConfig(type),
    };
    onChange([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  // ブロック削除
  const handleDeleteBlock = (id: string) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    // orderを再計算
    const reorderedBlocks = newBlocks.map((b, index) => ({ ...b, order: index }));
    onChange(reorderedBlocks);
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  // ブロック更新
  const handleUpdateBlock = (id: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map(b => 
      b.id === id ? { ...b, ...updates } : b
    );
    onChange(newBlocks);
  };

  // ドラッグ開始
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // ドラッグ終了
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      
      const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex).map((b, index) => ({
        ...b,
        order: index,
      }));
      
      onChange(reorderedBlocks);
    }
    
    setActiveId(null);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* 左サイドバー: ブロックパレット */}
      <div className="w-64 flex-shrink-0">
        <BlockPalette onAddBlock={handleAddBlock} />
      </div>

      {/* 中央: キャンバス */}
      <div className="flex-1 overflow-y-auto">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <BuilderCanvas
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onDeleteBlock={handleDeleteBlock}
            />
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg opacity-50">
                ドラッグ中...
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 右サイドバー: ブロック設定 */}
      {selectedBlock && (
        <div className="w-80 flex-shrink-0">
          <BlockSettings
            block={selectedBlock}
            onUpdate={(updates) => handleUpdateBlock(selectedBlock.id, updates)}
            onClose={() => setSelectedBlockId(null)}
          />
        </div>
      )}
    </div>
  );
}

// ブロックタイプごとのデフォルト設定
function getDefaultConfig(type: BlockType): any {
  switch (type) {
    case 'text':
      return {
        content: '<p>テキストを入力してください</p>',
        alignment: 'left',
        fontSize: 'medium',
        fontWeight: 'normal',
      };
    case 'image':
      return {
        imageUrl: '',
        alt: '',
        alignment: 'center',
        width: 100,
      };
    case 'cta':
      return {
        text: 'ボタンテキスト',
        url: '',
        style: 'primary',
        size: 'medium',
        alignment: 'center',
        openInNewTab: false,
      };
    case 'form':
      return {
        formId: '',
        showTitle: true,
      };
    case 'html':
      return {
        html: '<div>HTMLを入力してください</div>',
      };
    default:
      return {};
  }
}

