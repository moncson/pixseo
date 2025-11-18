'use client';

import { useState, useEffect } from 'react';
import FloatingSelect from './FloatingSelect';
import FloatingInput from './FloatingInput';
import { Category } from '@/types/article';
import { Writer } from '@/types/writer';
import { ArticlePattern } from '@/types/article-pattern';
import { ImagePromptPattern } from '@/types/image-prompt-pattern';

interface AdvancedArticleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (articleId: string) => void;
  categories: Category[];
  writers: Writer[];
}

export default function AdvancedArticleGeneratorModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
  writers,
}: AdvancedArticleGeneratorModalProps) {
  const [patterns, setPatterns] = useState<ArticlePattern[]>([]);
  const [imagePromptPatterns, setImagePromptPatterns] = useState<ImagePromptPattern[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    categoryId: '',
    patternId: '',
    writerId: '',
    imagePromptPatternId: '',
    targetAudience: '',
  });
  const [generatingAudience, setGeneratingAudience] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPatterns();
      fetchImagePromptPatterns();
      
      // カテゴリーが1つしかない場合、自動的に選択
      if (categories.length === 1) {
        setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
      }
      
      // ライターが1つしかない場合、自動的に選択
      if (writers.length === 1) {
        setFormData(prev => ({ ...prev, writerId: writers[0].id }));
      }
    }
  }, [isOpen, categories, writers]);

  const fetchPatterns = async () => {
    try {
      const currentTenantId = typeof window !== 'undefined' 
        ? localStorage.getItem('currentTenantId') 
        : null;

      const response = await fetch('/api/admin/article-patterns', {
        headers: {
          'x-media-id': currentTenantId || '',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch patterns');

      const data = await response.json();
      const fetchedPatterns = data.patterns || [];
      setPatterns(fetchedPatterns);

      // オプションが1つしかない場合、自動的に選択
      if (fetchedPatterns.length === 1) {
        setFormData(prev => ({ ...prev, patternId: fetchedPatterns[0].id }));
      }
    } catch (error) {
      console.error('Error fetching patterns:', error);
    }
  };

  const fetchImagePromptPatterns = async () => {
    try {
      const currentTenantId = typeof window !== 'undefined' 
        ? localStorage.getItem('currentTenantId') 
        : null;

      const response = await fetch('/api/admin/image-prompt-patterns', {
        headers: {
          'x-media-id': currentTenantId || '',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch image prompt patterns');

      const data = await response.json();
      const fetchedPatterns = data.patterns || [];
      setImagePromptPatterns(fetchedPatterns);

      // オプションが1つしかない場合、自動的に選択
      if (fetchedPatterns.length === 1) {
        setFormData(prev => ({ ...prev, imagePromptPatternId: fetchedPatterns[0].id }));
      }
    } catch (error) {
      console.error('Error fetching image prompt patterns:', error);
    }
  };

  const handleGenerateTargetAudience = async () => {
    if (!formData.categoryId) {
      setError('カテゴリーを先に選択してください');
      return;
    }

    setGeneratingAudience(true);
    setError(null);

    try {
      const currentTenantId = typeof window !== 'undefined' 
        ? localStorage.getItem('currentTenantId') 
        : null;

      const response = await fetch('/api/admin/articles/generate-target-audience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-media-id': currentTenantId || '',
        },
        body: JSON.stringify({ categoryId: formData.categoryId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate target audience');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, targetAudience: data.targetAudience }));
    } catch (error) {
      console.error('Error generating target audience:', error);
      setError('想定読者の生成に失敗しました');
    } finally {
      setGeneratingAudience(false);
    }
  };

  const handleGenerate = async () => {
    // デバッグ用：選択されている値を出力
    console.log('[Advanced Generate] Form data:', formData);

    // より詳細なバリデーション
    const missingFields: string[] = [];
    if (!formData.categoryId) missingFields.push('カテゴリー');
    if (!formData.patternId) missingFields.push('構成パターン');
    if (!formData.writerId) missingFields.push('ライター');
    if (!formData.imagePromptPatternId) missingFields.push('画像プロンプトパターン');
    if (!formData.targetAudience) missingFields.push('想定読者');

    if (missingFields.length > 0) {
      setError(`以下の項目を入力してください: ${missingFields.join('、')}`);
      return;
    }

    setGenerating(true);
    setError(null);

    // モーダルを即座に閉じる
    onClose();
    
    // トースト通知を表示
    alert('AI記事生成を開始しました。\n\n数分後に記事一覧に自動的に追加されます。\n他の作業を続けても問題ありません。');

    try {
      const currentTenantId = typeof window !== 'undefined' 
        ? localStorage.getItem('currentTenantId') 
        : null;

      // バックグラウンドで実行（await しない）
      fetch('/api/admin/articles/generate-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-media-id': currentTenantId || '',
        },
        body: JSON.stringify(formData),
      }).then(response => {
        if (response.ok) {
          console.log('[Advanced Generate] Article generation completed');
          // 成功時はページをリロードして新しい記事を表示
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        } else {
          console.error('[Advanced Generate] Article generation failed');
        }
      }).catch(err => {
        console.error('[Advanced Generate] Error:', err);
      });
    } catch (err) {
      console.error('Error starting article generation:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">AI高度記事生成</h2>
          <p className="text-sm text-gray-500 mt-1">
            12ステップの自動生成フローで記事を作成します
          </p>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <FloatingSelect
              label="カテゴリー *"
              value={formData.categoryId}
              onChange={(value) => setFormData({ ...formData, categoryId: value })}
              options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
              required
            />

            <FloatingSelect
              label="構成パターン *"
              value={formData.patternId}
              onChange={(value) => setFormData({ ...formData, patternId: value })}
              options={patterns.map(p => ({ value: p.id, label: p.name }))}
              required
            />
            {patterns.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 -mt-2">
                <p className="text-sm text-yellow-800">
                  ⚠️ 構成パターンが登録されていません。
                  <br />
                  「構成パターン管理」ボタンから登録してください。
                </p>
              </div>
            )}

            <FloatingSelect
              label="ライター *"
              value={formData.writerId}
              onChange={(value) => setFormData({ ...formData, writerId: value })}
              options={writers.map(w => ({ value: w.id, label: w.handleName }))}
              required
            />

            <FloatingSelect
              label="画像プロンプトパターン *"
              value={formData.imagePromptPatternId}
              onChange={(value) => setFormData({ ...formData, imagePromptPatternId: value })}
              options={imagePromptPatterns.map(p => ({ value: p.id, label: p.name }))}
              required
            />
            {imagePromptPatterns.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 -mt-2">
                <p className="text-sm text-yellow-800">
                  ⚠️ 画像プロンプトパターンが登録されていません。
                  <br />
                  メディアライブラリの「画像プロンプトパターン管理」から登録してください。
                </p>
              </div>
            )}

            <div className="space-y-2">
              <FloatingInput
                label="想定読者（ペルソナ）*"
                value={formData.targetAudience}
                onChange={(value) => setFormData({ ...formData, targetAudience: value })}
                required
                placeholder="例: フリーランスのWebデザイナー、スタートアップの創業者"
              />
              <button
                type="button"
                onClick={handleGenerateTargetAudience}
                disabled={!formData.categoryId || generatingAudience}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: !formData.categoryId || generatingAudience 
                    ? '#e5e7eb' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
                title="AIで想定読者を自動生成"
              >
                {generatingAudience ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                カテゴリーから想定読者をAIで自動生成できます（⚡ボタン）
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>生成フロー:</strong><br />
                1. テーマ5つ生成 → 2. 重複チェック → 3. 記事ベース作成（5,000文字以上） → 
                4. タグ自動割り当て → 5. 新規タグ翻訳・登録 → 6. アイキャッチ生成 → 7. ライター選択 → 
                8. メタデータ生成 → 9. FAQ生成 → 10. 記事内画像生成・配置 → 11. 非公開として保存
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ 注意:</strong> 生成開始後、バックグラウンドで処理されます。完了すると記事一覧に自動追加されます（約4-7分）。
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400 transition-colors"
          >
            キャンセル
          </button>
          
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            生成開始
          </button>
        </div>
      </div>
    </div>
  );
}

