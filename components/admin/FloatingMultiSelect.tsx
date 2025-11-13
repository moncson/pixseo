'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface FloatingMultiSelectProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  placeholder?: string;
  variant?: 'default' | 'badge'; // 新しいvariantを追加
  badgeColor?: 'green' | 'blue' | 'gray' | 'purple'; // バッジの色
}

export default function FloatingMultiSelect({
  label,
  values,
  onChange,
  options,
  placeholder,
  variant = 'default',
  badgeColor = 'blue',
}: FloatingMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter(opt => values.includes(opt.value));
  const availableOptions = options.filter(opt => 
    !values.includes(opt.value) && 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const handleRemove = (value: string) => {
    onChange(values.filter(v => v !== value));
  };

  const getBadgeColorClasses = () => {
    switch (badgeColor) {
      case 'green':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'blue':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'gray':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };

  // バッジバリアント
  if (variant === 'badge') {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        
        {/* 選択済みアイテム（バッジ表示） */}
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map(option => (
            <div
              key={option.value}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${getBadgeColorClasses()}`}
            >
              <span>{option.label}</span>
              <button
                type="button"
                onClick={() => handleRemove(option.value)}
                className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-white/50 transition-colors"
                title="削除"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {selectedOptions.length === 0 && (
            <span className="text-sm text-gray-400">選択されていません</span>
          )}
        </div>

        {/* 追加ボタン */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            + 追加
          </button>

          {/* ドロップダウン */}
          {isOpen && (
            <div className="absolute z-50 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
              {/* 検索ボックス */}
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="検索..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* オプションリスト */}
              <div className="py-1">
                {availableOptions.length > 0 ? (
                  availableOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        handleToggle(option.value);
                        setSearchTerm('');
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    {searchTerm ? '検索結果なし' : 'すべて選択済み'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // デフォルトバリアント（既存の動作）
  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`relative border rounded-xl transition-all ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
        }`}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-[3rem] px-4 py-3 cursor-pointer"
        >
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedOptions.map(option => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(option.value);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder || `${label}を選択`}</span>
          )}
        </div>
        
        <label
          className={`absolute left-3 transition-all pointer-events-none ${
            selectedOptions.length > 0 || isOpen
              ? '-top-2 text-xs bg-white px-1 text-blue-600'
              : 'top-3 text-base text-gray-500'
          }`}
        >
          {label}
        </label>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="検索..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          
          <div className="py-1">
            {availableOptions.length > 0 ? (
              availableOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggle(option.value)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                {searchTerm ? '検索結果なし' : 'すべて選択済み'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
