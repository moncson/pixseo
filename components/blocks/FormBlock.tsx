/**
 * フォームブロックコンポーネント
 * TODO: Phase 2でフォーム機能を実装
 */

import { Block, FormBlockConfig } from '@/types/block';

interface FormBlockProps {
  block: Block;
}

export default function FormBlock({ block }: FormBlockProps) {
  const config = block.config as FormBlockConfig;
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <p className="text-gray-600 text-center">
        フォーム（ID: {config.formId}）
        <br />
        <span className="text-sm">※ Phase 2で実装予定</span>
      </p>
    </div>
  );
}

