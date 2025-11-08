'use client';

import { useState, useRef } from 'react';
import { uploadImage, generateImagePath } from '@/lib/firebase/storage';

interface FeaturedImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function FeaturedImageUpload({ value, onChange }: FeaturedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // アップロード
    setUploading(true);
    try {
      const path = generateImagePath(file, 'articles');
      const url = await uploadImage(file, path);
      onChange(url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
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
      <div className="bg-white rounded-lg p-6">
        <div
          className="flex justify-center items-center px-6 pt-12 pb-12 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
          onClick={handleChange}
        >
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <div className="flex text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                画像を選択
              </span>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
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
          <div className="mt-2 text-center text-sm text-gray-600">
            アップロード中...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div
        className="relative w-full rounded-lg overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={preview}
          alt="Featured"
          className="w-full h-auto object-cover"
          style={{ maxHeight: '400px' }}
        />
        
        {/* ホバー時のオーバーレイ */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-4 transition-opacity">
            {/* 変更ボタン */}
            <button
              type="button"
              onClick={handleChange}
              className="bg-white text-gray-900 w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              title="画像を変更"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
            
            {/* 削除ボタン */}
            <button
              type="button"
              onClick={handleRemove}
              className="bg-white text-red-600 w-12 h-12 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
              title="画像を削除"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
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
        <div className="mt-2 text-center text-sm text-gray-600">
          アップロード中...
        </div>
      )}
    </div>
  );
}

