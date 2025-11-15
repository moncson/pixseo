'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Lang, SUPPORTED_LANGS, LANG_NAMES } from '@/types/lang';

interface LanguageSelectorProps {
  currentLang: Lang;
  variant?: 'header' | 'sidebar' | 'footer';
}

export default function LanguageSelector({ currentLang, variant = 'header' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (newLang: Lang) => {
    // 現在のパスから言語部分を置き換え
    const pathParts = pathname.split('/');
    pathParts[1] = newLang; // /[lang]/... の [lang] 部分を置き換え
    const newPath = pathParts.join('/');
    
    router.push(newPath);
    setIsOpen(false);
  };

  if (variant === 'footer') {
    return (
      <div className="flex gap-2 text-sm">
        {SUPPORTED_LANGS.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`px-3 py-1 rounded transition-colors ${
              lang === currentLang
                ? 'bg-white text-gray-900 font-semibold'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {LANG_NAMES[lang]}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Language
        </div>
        {SUPPORTED_LANGS.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
              lang === currentLang
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {LANG_NAMES[lang]}
          </button>
        ))}
      </div>
    );
  }

  // Header variant (default)
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="言語を選択"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="font-medium">{LANG_NAMES[currentLang]}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[150px] z-50">
          {SUPPORTED_LANGS.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`block w-full text-left px-4 py-2 transition-colors ${
                lang === currentLang
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {LANG_NAMES[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

