'use client';

import { useState } from 'react';

interface ImageGeneratorProps {
  onImageGenerated: (url: string) => void;
  articleTitle?: string;
  articleContent?: string;
}

export default function ImageGenerator({ onImageGenerated, articleTitle, articleContent }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const generateImagePrompt = () => {
    // 記事タイトルとコンテンツから画像プロンプトを自動生成
    if (articleTitle && articleContent) {
      // 記事の最初の段落からキーワードを抽出
      const contentPreview = articleContent.replace(/<[^>]*>/g, '').substring(0, 200);
      return `${articleTitle}に関連する、プロフェッショナルで魅力的な画像。${contentPreview}の内容を反映した、高品質な写真風の画像。`;
    }
    return prompt;
  };

  const handleGenerate = async () => {
    const imagePrompt = prompt || generateImagePrompt();
    
    if (!imagePrompt) {
      setError('プロンプトを入力してください');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const currentTenantId = typeof window !== 'undefined' 
        ? localStorage.getItem('currentTenantId') 
        : null;

      const response = await fetch('/api/admin/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-media-id': currentTenantId || '',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          size,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '画像の生成に失敗しました');
      }

      const data = await response.json();
      setGeneratedImageUrl(data.url);
      onImageGenerated(data.url);
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : '画像の生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          画像プロンプト
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={articleTitle ? `記事タイトル「${articleTitle}」から自動生成されます（空欄のままでもOK）` : '画像の説明を入力してください'}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          画像サイズ
        </label>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value as typeof size)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1024x1024">正方形 (1024x1024)</option>
          <option value="1792x1024">横長 (1792x1024)</option>
          <option value="1024x1792">縦長 (1024x1792)</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {generatedImageUrl && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">生成された画像:</p>
          <img
            src={generatedImageUrl}
            alt="Generated"
            className="w-full rounded-xl border border-gray-200"
          />
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            画像を生成中...
          </span>
        ) : (
          '🎨 AI画像を生成'
        )}
      </button>
    </div>
  );
}

