'use client';

import { useState, useRef, useEffect } from 'react';

interface TargetAudienceInputProps {
  value: string;
  onChange: (value: string) => void;
  history: string[];
  onDeleteHistory: (audience: string) => void;
  label?: string;
  required?: boolean;
}

export default function TargetAudienceInput({
  value,
  onChange,
  history,
  onDeleteHistory,
  label = '想定読者（ペルソナ）',
  required = false,
}: TargetAudienceInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasValue = value.length > 0;

  // クリック外部検知
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (audience: string) => {
    onChange(audience);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, audience: string) => {
    e.stopPropagation();
    onDeleteHistory(audience);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* 入力欄 */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 peer text-gray-900"
      />
      
      {/* フローティングラベル */}
      <label
        className={`absolute left-2 transition-all pointer-events-none ${
          hasValue || isOpen
            ? 'text-xs -top-2.5 bg-white px-2 text-gray-700'
            : 'text-sm top-1/2 -translate-y-1/2 text-gray-500 px-2'
        } peer-focus:text-xs peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:bg-white peer-focus:px-2 peer-focus:text-gray-700`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* カスタムドロップダウン */}
      {isOpen && history.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {history.map((audience, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer group border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelect(audience)}
            >
              <span className="text-sm text-gray-900 flex-1">{audience}</span>
              <button
                type="button"
                onClick={(e) => handleDelete(e, audience)}
                className="ml-2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                title="削除"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

