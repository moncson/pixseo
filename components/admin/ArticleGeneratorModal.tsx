'use client';

import { useState } from 'react';
import { Category, Tag } from '@/types/article';
import FloatingMultiSelect from './FloatingMultiSelect';
import FloatingInput from './FloatingInput';
import RichTextEditor from './RichTextEditor';
import ImageGenerator from './ImageGenerator';

interface ArticleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (articleData: {
    title: string;
    excerpt: string;
    content: string;
    categoryIds: string[];
    tagIds: string[];
    featuredImage?: string;
  }) => void;
  categories: Category[];
  tags: Tag[];
}

export default function ArticleGeneratorModal({
  isOpen,
  onClose,
  onGenerate,
  categories,
  tags,
}: ArticleGeneratorModalProps) {
  const [step, setStep] = useState<'input' | 'generating' | 'review' | 'rewriting'>('input');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedArticle, setGeneratedArticle] = useState<{
    title: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
  } | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<{
    isDuplicate: boolean;
    duplicates: Array<{ articleId: string; title: string; titleSimilarity: number; contentSimilarity: number }>;
  } | null>(null);

  const handleGenerate = async () => {
    if (selectedCategoryIds.length === 0 && selectedTagIds.length === 0 && !topic) {
      setError('カテゴリ、タグ、またはトピックのいずれかを選択してください');
      return;
    }

    setStep('generating');
    setError(null);

    try {
      const currentTenantId = typeof window !== 'undefined' 
        ? localStorage.getItem('currentTenantId') 
        : null;

      const response = await fetch('/api/admin/articles/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-media-id': currentTenantId || '',
        },
        body: JSON.stringify({
          categoryIds: selectedCategoryIds,
          tagIds: selectedTagIds,
          topic,
          additionalContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '記事の生成に失敗しました');
      }

      const data = await response.json();
      setGeneratedArticle({
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
      });

      // 重複チェックを実行
      await checkDuplicates(data.title, data.content);

      setStep('review');
    } catch (err) {
      console.error('Error generating article:', err);
      setError(err instanceof Error ? err.message : '記事の生成に失敗しました');
      setStep('input');
    }
  };

  const checkDuplicates = async (title: string, content: string) => {
    try {
      const currentTenantId = typeof window !== 'undefined' 
        ? localStorage.getItem('currentTenantId') 
        : null;

      const response = await fetch('/api/admin/articles/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-media-id': currentTenantId || '',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDuplicateCheck(data);
      }
    } catch (err) {
      console.error('Error checking duplicates:', err);
    }
  };

  const handleRewrite = async () => {
    if (!generatedArticle) return;

    setStep('rewriting');
    setError(null);

    try {
      const currentTenantId = typeof window !== 'undefined' 
        ? localStorage.getItem('currentTenantId') 
        : null;

      const response = await fetch('/api/admin/articles/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-media-id': currentTenantId || '',
        },
        body: JSON.stringify({
          title: generatedArticle.title,
          content: generatedArticle.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '記事のリライトに失敗しました');
      }

      const data = await response.json();
      setGeneratedArticle({
        ...generatedArticle,
        content: data.content,
      });

      // 重複チェックを再実行
      await checkDuplicates(generatedArticle.title, data.content);

      setStep('review');
    } catch (err) {
      console.error('Error rewriting article:', err);
      setError(err instanceof Error ? err.message : '記事のリライトに失敗しました');
      setStep('review');
    }
  };

  const handleUseArticle = () => {
    if (!generatedArticle) return;

    onGenerate({
      title: generatedArticle.title,
      excerpt: generatedArticle.excerpt,
      content: generatedArticle.content,
      categoryIds: selectedCategoryIds,
      tagIds: selectedTagIds,
      featuredImage: generatedArticle.featuredImage,
    });

    // リセット
    handleClose();
  };

  const handleClose = () => {
    setStep('input');
    setSelectedCategoryIds([]);
    setSelectedTagIds([]);
    setTopic('');
    setAdditionalContext('');
    setGeneratedArticle(null);
    setError(null);
    setDuplicateCheck(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-custom">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">AI記事生成</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {step === 'input' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">記事の条件を入力</h3>
                
                {/* カテゴリー */}
                <div className="mb-4">
                  <FloatingMultiSelect
                    label="カテゴリー"
                    values={selectedCategoryIds}
                    onChange={setSelectedCategoryIds}
                    options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                  />
                </div>

                {/* タグ */}
                <div className="mb-4">
                  <FloatingMultiSelect
                    label="タグ"
                    values={selectedTagIds}
                    onChange={setSelectedTagIds}
                    options={tags.map(tag => ({ value: tag.id, label: tag.name }))}
                  />
                </div>

                {/* トピック */}
                <div className="mb-4">
                  <FloatingInput
                    label="トピック（任意）"
                    value={topic}
                    onChange={setTopic}
                    placeholder="例：バリアフリー対応のカフェ"
                  />
                </div>

                {/* 追加のコンテキスト */}
                <div className="mb-4">
                  <FloatingInput
                    label="追加のコンテキスト（任意）"
                    value={additionalContext}
                    onChange={setAdditionalContext}
                    multiline
                    rows={3}
                    placeholder="例：特に車椅子でのアクセスについて詳しく書いてください"
                  />
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleGenerate}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    📝 記事を生成
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">記事を生成中...</p>
            </div>
          )}

          {step === 'rewriting' && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">記事をリライト中...</p>
            </div>
          )}

          {step === 'review' && generatedArticle && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">生成された記事</h3>

                {/* 重複チェック結果 */}
                {duplicateCheck && (
                  <div className={`mb-4 p-4 rounded-xl border ${
                    duplicateCheck.isDuplicate 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {duplicateCheck.isDuplicate ? (
                        <span className="text-yellow-600 text-xl">⚠️</span>
                      ) : (
                        <span className="text-green-600 text-xl">✓</span>
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${
                          duplicateCheck.isDuplicate ? 'text-yellow-800' : 'text-green-800'
                        }`}>
                          {duplicateCheck.isDuplicate 
                            ? '重複の可能性があります' 
                            : '重複は検出されませんでした'}
                        </p>
                        {duplicateCheck.duplicates.length > 0 && (
                          <ul className="mt-2 text-sm space-y-1">
                            {duplicateCheck.duplicates.map((dup, idx) => (
                              <li key={idx} className="text-gray-700">
                                • {dup.title} (類似度: {Math.round(dup.titleSimilarity * 100)}%)
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* タイトル */}
                <div className="mb-4">
                  <FloatingInput
                    label="タイトル"
                    value={generatedArticle.title}
                    onChange={(value) => setGeneratedArticle({ ...generatedArticle, title: value })}
                  />
                </div>

                {/* メタディスクリプション */}
                <div className="mb-4">
                  <FloatingInput
                    label="メタディスクリプション"
                    value={generatedArticle.excerpt}
                    onChange={(value) => setGeneratedArticle({ ...generatedArticle, excerpt: value })}
                    multiline
                    rows={2}
                  />
                </div>

                {/* アイキャッチ画像生成 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      アイキャッチ画像
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowImageGenerator(!showImageGenerator)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {showImageGenerator ? '閉じる' : '🎨 AI画像を生成'}
                    </button>
                  </div>
                  
                  {generatedArticle.featuredImage ? (
                    <div className="relative">
                      <img
                        src={generatedArticle.featuredImage}
                        alt="Featured"
                        className="w-full h-48 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setGeneratedArticle({ ...generatedArticle, featuredImage: undefined })}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : showImageGenerator ? (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <ImageGenerator
                        onImageGenerated={(url) => {
                          setGeneratedArticle({ ...generatedArticle, featuredImage: url });
                          setShowImageGenerator(false);
                        }}
                        articleTitle={generatedArticle.title}
                        articleContent={generatedArticle.content}
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
                      画像が設定されていません
                    </div>
                  )}
                </div>

                {/* 本文 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    本文
                  </label>
                  <RichTextEditor
                    value={generatedArticle.content}
                    onChange={(content) => setGeneratedArticle({ ...generatedArticle, content })}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleRewrite}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                  >
                    ✏️ リライト
                  </button>
                  <button
                    onClick={handleUseArticle}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    ✓ この記事を使用
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

