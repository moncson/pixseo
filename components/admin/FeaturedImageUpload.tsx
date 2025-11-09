'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { apiPostFormData } from '@/lib/api-client';
import MediaLibraryModal from './MediaLibraryModal';

interface FeaturedImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function FeaturedImageUpload({ value, onChange, label = 'ロゴ画像を選択' }: FeaturedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [isHovered, setIsHovered] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // valueが変わったらpreviewを更新
  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[FeaturedImageUpload] ファイル選択:', file.name);

    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('[FeaturedImageUpload] プレビュー生成完了');
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // アップロード（API経由、mediaIdが自動的に追加される）
    setUploading(true);
    console.log('[FeaturedImageUpload] API経由でアップロード開始');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('[FeaturedImageUpload] APIリクエスト送信中...');
      const data = await apiPostFormData<{ url: string }>('/api/admin/media/upload', formData);
      
      console.log('[FeaturedImageUpload] アップロード成功、URL:', data.url);
      
      onChange(data.url);
      console.log('[FeaturedImageUpload] onChange呼び出し完了');
    } catch (error: any) {
      console.error('[FeaturedImageUpload] アップロードエラー:', error);
      console.error('[FeaturedImageUpload] エラーメッセージ:', error?.message);
      alert(`画像のアップロードに失敗しました: ${error?.message || '不明なエラー'}`);
      // プレビューをクリア
      setPreview(undefined);
    } finally {
      setUploading(false);
      console.log('[FeaturedImageUpload] アップロード処理終了');
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = () => {
    fileInputRef.current?.click();
  };

  if (!preview) {
    return (
      <>
        <div className="flex flex-col justify-center items-center h-full gap-3">
          <div
            className="aspect-square w-full h-full flex justify-center items-center border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
            onClick={handleChange}
          >
            <div className="text-center">
              <svg
                className="mx-auto h-6 w-6 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-xs text-gray-600 mt-1">
                {label}
              </div>
            </div>
          </div>
          
          {/* メディアライブラリから選択ボタン */}
          <button
            type="button"
            onClick={() => setShowMediaLibrary(true)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            メディアライブラリから選択
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading && (
            <div className="text-center text-xs text-gray-600">
              アップロード中...
            </div>
          )}
        </div>
        
        {/* メディアライブラリモーダル */}
        <MediaLibraryModal
          isOpen={showMediaLibrary}
          onClose={() => setShowMediaLibrary(false)}
          onSelect={(url) => {
            onChange(url);
            setPreview(url);
          }}
          filterType="image"
        />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-center items-center h-full">
        <div
          className="relative aspect-square w-full h-full rounded-lg overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={preview}
            alt="Featured"
            fill
            className="object-cover"
            sizes="48px"
          />
          
          {/* ホバー時のオーバーレイ */}
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center gap-2 transition-opacity z-10">
              <div className="flex gap-2">
                {/* 変更ボタン（アップロード） */}
                <button
                  type="button"
                  onClick={handleChange}
                  className="bg-white text-gray-900 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  title="画像をアップロード"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
                
                {/* 削除ボタン */}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="bg-white text-red-600 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                  title="画像を削除"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {/* メディアライブラリから選択ボタン */}
              <button
                type="button"
                onClick={() => setShowMediaLibrary(true)}
                className="text-xs text-white hover:text-gray-200 font-medium"
              >
                ライブラリから選択
              </button>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        
        {uploading && (
          <div className="text-center text-xs text-gray-600">
            アップロード中...
          </div>
        )}
      </div>
      
      {/* メディアライブラリモーダル */}
      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={(url) => {
          onChange(url);
          setPreview(url);
        }}
        filterType="image"
      />
    </>
  );
}

